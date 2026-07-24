import axios from "axios";
import type { GeoLocation } from "@/types";
import { getCache, setCache } from "@/lib/redis";

const BRASIL_API_URL = "https://brasilapi.com.br/api/cep/v2";
const VIA_CEP_URL = process.env.VIA_CEP_API_URL || "https://viacep.com.br/ws";
const HTTP_TIMEOUT = 12000;

export class GeolocationService {
  // BrasilAPI e ViaCEP+Nominatim em paralelo, vale a primeira resposta válida
  static async cepToCoordinates(cep: string): Promise<GeoLocation | null> {
    // concertar dps, ta feio fazer 2 reqs em paralelo
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      throw new Error("CEP inválido. Deve conter 8 dígitos");
    }

    const cacheKey = `geocoding:cep:${cleanCep}`;

    const cached = await getCache<GeoLocation>(cacheKey);
    if (cached) {
      return cached;
    }

    const [brasilApiResult, viaCepResult] = await Promise.all([
      this.fetchFromBrasilAPI(cleanCep),
      this.fetchFromViaCepNominatim(cleanCep),
    ]);

    const result = brasilApiResult ?? viaCepResult;
    if (result) {
      await setCache(cacheKey, result, 86400);
      return result;
    }
    return null;
  }

  private static async fetchFromBrasilAPI(cep: string): Promise<GeoLocation | null> {
    try {
      const response = await axios.get(`${BRASIL_API_URL}/${cep}`, { timeout: HTTP_TIMEOUT });
      const data = response.data;
      if (!data || data.errors) return null;

      const lat = parseFloat(data.location?.coordinates?.latitude);
      const lng = parseFloat(data.location?.coordinates?.longitude);

      const location: GeoLocation = {
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
        cep: data.cep || cep,
        logradouro: data.street || undefined,
        bairro: data.neighborhood || undefined,
        cidade: data.city || undefined,
        estado: data.state || undefined,
      };

      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
        // veio endereço sem coordenadas, tenta geocodificar cidade+estado
        const city = data.city || data.localidade;
        const state = data.state || data.state_code;
        if (city && state) {
          const coords = await this.addressToCoordinates(`${city}, ${state}, Brasil`);
          if (coords) {
            const fallbackLocation: GeoLocation = {
              ...location,
              lat: coords.lat,
              lng: coords.lng,
            };
            return fallbackLocation;
          }
        }
        console.warn(`[Geolocation] BrasilAPI sem coordenadas para CEP ${cep}, fallback Nominatim não retornou`);
        return null;
      }

      if (!this.validateCoordinates(location.lat, location.lng)) {
        console.warn(`[Geolocation] BrasilAPI retornou coordenadas fora do Brasil para CEP ${cep}: ${lat}, ${lng}`);
        return null;
      }

      return location;
    } catch (error) {
      // se der merda retorna null e foda-se
      console.warn(`[Geolocation] BrasilAPI falhou para CEP ${cep}:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  private static async fetchFromViaCepNominatim(cep: string): Promise<GeoLocation | null> {
    try {
      const response = await axios.get(`${VIA_CEP_URL}/${cep}/json/`, { timeout: HTTP_TIMEOUT });

      if (response.data.erro) {
        throw new Error("CEP não encontrado");
      }

      const { logradouro, bairro, localidade, uf, cep: cepFormatted } = response.data;

      const addressParts = [logradouro, bairro, localidade, uf].filter(Boolean);
      if (addressParts.length < 2) {
        console.warn(`[Geolocation] ViaCEP retornou dados insuficientes para CEP ${cep}`);
        return null;
      }

      const coordinates = await this.addressToCoordinates(addressParts.join(", "));

      if (!coordinates) {
        // tenta de novo só com cidade + estado
        if (localidade && uf) {
          const broadCoordinates = await this.addressToCoordinates(`${localidade}, ${uf}`);
          if (broadCoordinates) {
            const location: GeoLocation = {
              ...broadCoordinates,
              cep: cepFormatted,
              logradouro,
              bairro,
              cidade: localidade,
              estado: uf,
            };
            return location;
          }
        }
        return null;
      }

      return {
        ...coordinates,
        cep: cepFormatted,
        logradouro,
        bairro,
        cidade: localidade,
        estado: uf,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const axiosErr = error as { response?: { status?: number; data?: unknown } };
      const detail = axiosErr.response ? ` status=${axiosErr.response.status} data=${JSON.stringify(axiosErr.response.data)}` : "";
      console.warn(`[Geolocation] ViaCEP+Nominatim falhou para CEP ${cep}: ${msg}${detail}`);
      return null;
    }
  }

  private static async addressToCoordinates(
    address: string
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: address,
            format: "json",
            limit: 1,
            countrycodes: "br",
          },
          headers: {
            "User-Agent": "MelhorPreco.net (contato@melhorpreco.net)",
          },
          timeout: HTTP_TIMEOUT,
        }
      );

      if (response.data && response.data.length > 0) {
        const first = response.data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        if (Number.isFinite(lat) && Number.isFinite(lng) && this.validateCoordinates(lat, lng)) {
          return { lat, lng };
        }
      }
    } catch (error) {
      console.warn("[Geolocation] Nominatim error:", error instanceof Error ? error.message : error);
    }
    return null;
  }

  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -35 && lat <= 5 && lng >= -75 && lng <= -30;
  }

  static normalizeCEP(cep: string): string {
    return cep.replace(/\D/g, "");
  }
}
