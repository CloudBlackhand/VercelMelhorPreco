import { GeolocationService } from "./geolocation";
import { findSlugsContainingPoint } from "./coverage-resolver";
import { OPERADORAS_PLANOS } from "@/config/operadoras-planos";
import { getOperadoraRankingOverrides, getOperadoraAtivoOverrides } from "@/lib/operadora-ranking";
import { getOperadorasPorCidade, getTagsPorCidade } from "@/lib/operadoras-por-cidade";
import type { CoberturaResponse, PlanoCobertura } from "@/types";
import { getCache, setCache } from "@/lib/redis";

export class CoberturaService {
  async checkCoverageByCEP(cep: string): Promise<CoberturaResponse> {
    const normalizedCEP = cep.replace(/\D/g, "");
    if (normalizedCEP.length !== 8) {
      console.warn(`[CoberturaService] CEP inválido recebido: ${cep} (normalizado: ${normalizedCEP})`);
      return {
        operadoras: [],
        cep: normalizedCEP || cep,
        mensagem: "CEP inválido. Informe 8 dígitos (ex: 30130-100).",
      };
    }

    const cacheKey = `cobertura:cep:${normalizedCEP}`;

    const cached = await getCache<CoberturaResponse>(cacheKey);
    if (cached) {
      console.log(`[CoberturaService] Cache hit para CEP: ${normalizedCEP}`);
      return cached;
    }

    try {
      console.log(`[CoberturaService] Buscando coordenadas para CEP: ${normalizedCEP}`);
      const location = await GeolocationService.cepToCoordinates(normalizedCEP);

      if (!location || location.lat == null || location.lng == null) {
        console.warn(`[CoberturaService] Não foi possível obter coordenadas para CEP: ${normalizedCEP}`);
        return {
          operadoras: [],
          cep: normalizedCEP,
          mensagem: "Não foi possível obter a localização deste CEP. Verifique o número ou tente outro.",
        };
      }

      console.log(`[CoberturaService] Coordenadas obtidas: ${location.lat}, ${location.lng} para CEP: ${normalizedCEP}`);

      const result = await this.checkCoverageByCoordinates(location.lat, location.lng, {
        cidade: location.cidade,
        estado: location.estado,
      });
      result.cep = normalizedCEP;
      result.cidade = location.cidade;
      result.estado = location.estado;
      if (result.operadoras.length === 0 && !result.mensagem) {
        result.mensagem =
          "CEP encontrado, mas não há cobertura para esta região.";
      }

      await setCache(cacheKey, result, 86400);
      console.log(`[CoberturaService] Resultado cacheado para CEP: ${normalizedCEP}`);

      return result;
    } catch (error) {
      console.error(`[CoberturaService] Erro ao buscar cobertura para CEP ${normalizedCEP}:`, error);
      const msg = error instanceof Error ? error.message : "Erro ao consultar CEP.";
      const isNotFound = msg.includes("não encontrado") || msg.includes("CEP não encontrado");
      
      return {
        operadoras: [],
        cep: normalizedCEP,
        mensagem: isNotFound 
          ? "CEP não encontrado. Verifique o número e tente novamente."
          : "Erro ao consultar CEP. Tente novamente mais tarde.",
      };
    }
  }

  async checkCoverageByCoordinates(
    lat: number,
    lng: number,
    options?: { cidade?: string; estado?: string }
  ): Promise<CoberturaResponse> {
    const { cidade, estado } = options ?? {};

    if (!GeolocationService.validateCoordinates(lat, lng)) {
      console.warn(`[CoberturaService] Coordenadas inválidas: ${lat}, ${lng}`);
      return {
        operadoras: [],
        coordenadas: { lat, lng },
        mensagem: "Coordenadas fora dos limites do Brasil.",
      };
    }

    // resultado varia por cidade, então a chave do cache também
    const cacheKey =
      cidade && estado
        ? `cobertura:coord:${lat}:${lng}:${cidade}:${estado}`
        : `cobertura:coord:${lat}:${lng}`;

    const cached = await getCache<CoberturaResponse>(cacheKey);
    if (cached) {
      console.log(`[CoberturaService] Cache hit para coordenadas: ${lat}, ${lng}`);
      return cached;
    }

    try {
      console.log(`[CoberturaService] Buscando áreas contendo ponto: ${lat}, ${lng}`);

      const slugsFromFiles = await findSlugsContainingPoint(lat, lng);

      const rankingOverrides = await getOperadoraRankingOverrides();
      const slugsPresent = new Set<string>();

      const operadorasRaw: Array<{
        id: string;
        nome: string;
        slug: string;
        logoUrl: string | null;
        siteUrl?: string | null;
        ordemRecomendacao: number;
        planos: Array<PlanoCobertura & { _slug?: string; _planoIndex?: number }>;
      }> = [];

      // esse merge ta meio podre, melhorar mais aqui
      // 1) operadoras com cobertura no KML
      if (slugsFromFiles.length > 0) {
        const operadorasFromConfig = slugsFromFiles
          .map((slug) => OPERADORAS_PLANOS.find((o) => o.slug === slug))
          .filter((o): o is NonNullable<typeof o> => o != null);
        for (const op of operadorasFromConfig) {
          slugsPresent.add(op.slug);
          const ordem = rankingOverrides[op.slug] ?? op.ordemRecomendacao ?? 999;
          operadorasRaw.push({
            id: `config-${op.slug}`,
            nome: op.nome,
            slug: op.slug,
            logoUrl: op.logoUrl ?? null,
            siteUrl: op.siteUrl ?? null,
            ordemRecomendacao: ordem,
            planos: op.planos.map((p, idx) => ({
              id: `config-${op.slug}-plano-${idx}`,
              nome: p.nome,
              velocidadeDownload: p.velocidadeDownload,
              velocidadeUpload: p.velocidadeUpload,
              preco: p.preco,
              descricao: p.descricao ?? null,
              beneficios: p.beneficios ?? null,
              _slug: op.slug,
              _planoIndex: idx,
            })),
          });
        }
      }

      // 2) operadoras cadastradas por cidade no admin
      if (cidade?.trim()) {
        const operadorasCidade = await getOperadorasPorCidade(cidade, estado);
        for (const op of operadorasCidade) {
          if (slugsPresent.has(op.slug)) continue;
          slugsPresent.add(op.slug);
          const configOp = OPERADORAS_PLANOS.find((o) => o.slug === op.slug);
          operadorasRaw.push({
            id: op.id,
            nome: op.nome,
            slug: op.slug,
            logoUrl: op.logoUrl,
            siteUrl: configOp?.siteUrl ?? null,
            ordemRecomendacao: op.ordemRecomendacao,
            planos: op.planos.map((p) => ({
              id: p.id,
              nome: p.nome,
              velocidadeDownload: p.velocidadeDownload,
              velocidadeUpload: p.velocidadeUpload,
              preco: p.preco,
              descricao: p.descricao,
              beneficios: p.beneficios,
            })),
          });
        }
      }

      // 3) operadoras com exibirSempre (Claro, Vivo...)
      const ativoOverrides = await getOperadoraAtivoOverrides();
      for (const op of OPERADORAS_PLANOS) {
        if (!op.exibirSempre) continue;
        const ativo = ativoOverrides?.[op.slug] ?? op.ativo ?? true;
        if (!ativo || slugsPresent.has(op.slug)) continue;
        slugsPresent.add(op.slug);
        const ordem = rankingOverrides[op.slug] ?? op.ordemRecomendacao ?? 999;
        operadorasRaw.push({
          id: `config-${op.slug}`,
          nome: op.nome,
          slug: op.slug,
          logoUrl: op.logoUrl ?? null,
          siteUrl: op.siteUrl ?? null,
          ordemRecomendacao: ordem,
          planos: op.planos.map((p, idx) => ({
            id: `config-${op.slug}-plano-${idx}`,
            nome: p.nome,
            velocidadeDownload: p.velocidadeDownload,
            velocidadeUpload: p.velocidadeUpload,
            preco: p.preco,
            descricao: p.descricao ?? null,
            beneficios: p.beneficios ?? null,
            _slug: op.slug,
            _planoIndex: idx,
          })),
        });
      }

      operadorasRaw.sort((a, b) => a.ordemRecomendacao - b.ordemRecomendacao);
      const validOperadoras = operadorasRaw.map(({ ordemRecomendacao: _o, ...rest }) => rest);

      // 4) tags por plano/cidade
      let tagsMap = new Map<string, string>();
      if (cidade?.trim()) {
        tagsMap = await getTagsPorCidade(cidade, estado);
      }
      for (const op of validOperadoras) {
        for (let i = 0; i < op.planos.length; i++) {
          const plano = op.planos[i];
          const key = (plano as any)._slug != null
            ? `${String((plano as any)._slug).toLowerCase()}-${(plano as any)._planoIndex}`
            : plano.id;
          const tag = tagsMap.get(key);
          if (tag) (plano as PlanoCobertura).tag = tag;
          delete (plano as any)._slug;
          delete (plano as any)._planoIndex;
        }
      }

      const result: CoberturaResponse = {
        operadoras: validOperadoras,
        coordenadas: { lat, lng },
      };
      if (slugsFromFiles.length === 0 && result.operadoras.length === 0) {
        result.mensagem = "Não há cobertura para esta região.";
      }
      const totalPlanos = result.operadoras.reduce((sum, op) => sum + op.planos.length, 0);
      console.log(`[CoberturaService] Total de ${totalPlanos} plano(s) para ${result.operadoras.length} operadora(s)`);
      await setCache(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error(`[CoberturaService] Erro ao buscar cobertura por coordenadas ${lat}, ${lng}:`, error);
      return {
        operadoras: [],
        coordenadas: { lat, lng },
        mensagem: "Erro ao buscar cobertura. Tente novamente mais tarde.",
      };
    }
  }
}


