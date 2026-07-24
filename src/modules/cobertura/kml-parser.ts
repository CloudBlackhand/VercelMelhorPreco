import tj from "@mapbox/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { FeatureCollection, Geometry } from "geojson";

export interface KMLParseResult {
  geojson: FeatureCollection;
  isValid: boolean;
  errors: string[];
}

export class KMLParser {
  // limites aproximados do Brasil
  private static readonly BRAZIL_LNG_MIN = -75;
  private static readonly BRAZIL_LNG_MAX = -30;
  private static readonly BRAZIL_LAT_MIN = -35;
  private static readonly BRAZIL_LAT_MAX = 5;

  // cada feature é avaliada sozinha — uma coleção pode misturar ordens de coordenada
  private static normalizeCoordinates(geojson: FeatureCollection): FeatureCollection {
    if (!geojson.features?.length) return geojson;

    const features = geojson.features.map((feature) => {
      if (!feature.geometry || !("coordinates" in feature.geometry)) return feature;
      const sample = this.flattenFirst((feature.geometry as any).coordinates);
      if (!sample || sample.length < 2) return feature;

      const [first, second] = sample;
      const asIs = this.isInsideBrazil(first, second);
      const swapped = this.isInsideBrazil(second, first);

      if (asIs) return feature;
      if (!swapped) return feature;

      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: this.swapCoords((feature.geometry as any).coordinates),
        },
      };
    });

    return { type: "FeatureCollection", features };
  }

  private static isInsideBrazil(lng: number, lat: number): boolean {
    return (
      lng >= this.BRAZIL_LNG_MIN && lng <= this.BRAZIL_LNG_MAX &&
      lat >= this.BRAZIL_LAT_MIN && lat <= this.BRAZIL_LAT_MAX
    );
  }

  private static sampleCoordinate(fc: FeatureCollection): number[] | null {
    for (const feature of fc.features) {
      if (!feature.geometry || !("coordinates" in feature.geometry)) continue;
      const coords = (feature.geometry as any).coordinates;
      const flat = this.flattenFirst(coords);
      if (flat) return flat;
    }
    return null;
  }

  private static flattenFirst(coords: any): number[] | null {
    if (!Array.isArray(coords)) return null;
    if (typeof coords[0] === "number" && coords.length >= 2) return coords;
    return this.flattenFirst(coords[0]);
  }

  private static swapAllCoordinates(fc: FeatureCollection): FeatureCollection {
    return {
      type: "FeatureCollection",
      features: fc.features.map((feature) => {
        if (!feature.geometry || !("coordinates" in feature.geometry)) return feature;
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: this.swapCoords((feature.geometry as any).coordinates),
          },
        };
      }),
    };
  }

  private static swapCoords(coords: any): any {
    if (!Array.isArray(coords)) return coords;
    if (typeof coords[0] === "number" && coords.length >= 2) {
      return [coords[1], coords[0], ...coords.slice(2)];
    }
    return coords.map((c: any) => this.swapCoords(c));
  }

  static normalizeCoordinateOrder(geojson: FeatureCollection): FeatureCollection {
    return this.normalizeCoordinates(geojson);
  }

  static parse(kmlString: string): KMLParseResult {
    const errors: string[] = [];
    let geojson: FeatureCollection | null = null;

    if (!kmlString || typeof kmlString !== "string" || kmlString.trim().length === 0) {
      errors.push("KML vazio ou inválido. O arquivo deve conter conteúdo válido.");
      return {
        geojson: { type: "FeatureCollection", features: [] },
        isValid: false,
        errors,
      };
    }

    if (!kmlString.trim().startsWith("<") || !kmlString.includes("kml")) {
      errors.push("Arquivo não parece ser um KML válido. Verifique se o arquivo está correto.");
      return {
        geojson: { type: "FeatureCollection", features: [] },
        isValid: false,
        errors,
      };
    }

    try {
      const kml = new DOMParser().parseFromString(kmlString, "text/xml");

      const parseError = kml.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        const errorText = parseError[0].textContent || "";
        errors.push(`Erro ao fazer parse do XML do KML. ${errorText.substring(0, 200)}`);
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      const rootElement = kml.documentElement;
      if (!rootElement || rootElement.nodeName.toLowerCase() !== "kml") {
        errors.push("Arquivo não é um KML válido. O elemento raiz deve ser <kml>");
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      try {
        geojson = tj.kml(kml) as FeatureCollection;
        geojson = this.normalizeCoordinates(geojson);
      } catch (conversionError) {
        errors.push(`Erro ao converter KML para GeoJSON: ${conversionError instanceof Error ? conversionError.message : "Erro desconhecido"}`);
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      if (!geojson || !geojson.type || geojson.type !== "FeatureCollection") {
        errors.push("KML não contém uma estrutura GeoJSON válida após conversão");
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      if (!geojson.features || geojson.features.length === 0) {
        errors.push("KML não contém nenhuma geometria válida. Verifique se o arquivo possui polígonos ou áreas de cobertura.");
        return {
          geojson,
          isValid: false,
          errors,
        };
      }

      let polygonCount = 0;
      let multiPolygonCount = 0;
      let lineStringCount = 0;
      let closedLineStringCount = 0;
      let otherGeometryCount = 0;

      geojson.features.forEach((feature, index) => {
        if (!feature.geometry) {
          errors.push(`Feature ${index + 1} não possui geometria`);
        } else {
          const geom = feature.geometry as Geometry;
          if (!geom.type) {
            errors.push(`Feature ${index + 1} possui geometria sem tipo`);
          } else {
            if (geom.type === "Polygon") {
              polygonCount++;
            } else if (geom.type === "MultiPolygon") {
              multiPolygonCount++;
            } else if (geom.type === "LineString") {
              lineStringCount++;
              const coords = (geom as any).coordinates;
              if (coords && coords.length >= 3) {
                const first = coords[0];
                const last = coords[coords.length - 1];
                const isClosed =
                  (first[0] === last[0] && first[1] === last[1]) ||
                  (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
                if (isClosed) {
                  closedLineStringCount++;
                }
              }
            } else {
              otherGeometryCount++;
            }
          }
        }
      });

      if (polygonCount === 0 && multiPolygonCount === 0 && closedLineStringCount === 0) {
        errors.push(
          `KML não contém polígonos ou círculos válidos. ` +
          `Encontrados: ${polygonCount} Polygon(s), ${multiPolygonCount} MultiPolygon(s), ` +
          `${lineStringCount} LineString(s) (${closedLineStringCount} fechada(s)), ` +
          `${otherGeometryCount} outro(s) tipo(s). ` +
          `Para cobertura, são necessários polígonos ou LineString fechadas (círculos).`
        );
      } else if (closedLineStringCount > 0) {
        console.log(
          `[KMLParser] ${closedLineStringCount} LineString(s) fechada(s) detectada(s) - serão convertidas para Polygon`
        );
      }

      return {
        geojson,
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      errors.push(`Erro ao processar KML: ${errorMessage}`);

      if (errorMessage.includes("XML")) {
        errors.push("Verifique se o arquivo é um XML/KML válido e bem formatado.");
      }
      
      return {
        geojson: { type: "FeatureCollection", features: [] },
        isValid: false,
        errors,
      };
    }
  }

  static validateKMLFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (file.size > 25 * 1024 * 1024) {
      errors.push("Arquivo muito grande. Máximo permitido: 25MB");
    }

    const validKmlTypes = [
      "application/vnd.google-earth.kml+xml",
      "application/xml",
      "text/xml",
    ];
    const validKmzTypes = ["application/vnd.google-earth.kmz", "application/zip"];
    const validExtensions = [".kml", ".kmz"];

    const name = file.name.toLowerCase();
    const hasKmlExt = name.endsWith(".kml");
    const hasKmzExt = name.endsWith(".kmz");
    const hasValidType =
      validKmlTypes.includes(file.type) ||
      validKmzTypes.includes(file.type) ||
      hasKmlExt ||
      hasKmzExt;

    if (!hasValidType) {
      errors.push("Arquivo deve ser KML (.kml) ou KMZ (.kmz)");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


