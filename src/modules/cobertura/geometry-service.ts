import * as turf from "@turf/turf";
import type { FeatureCollection, Point, Polygon, MultiPolygon } from "geojson";

// Turf exige anel fechado com pelo menos 4 posições
function everyRingHasMin4Positions(rings: unknown): boolean {
  if (!Array.isArray(rings)) return false;
  for (const ring of rings) {
    if (!Array.isArray(ring) || ring.length < 4) return false;
  }
  return true;
}

function swapCoordinateOrder(coords: unknown): unknown {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === "number" && coords.length >= 2) {
    return [coords[1], coords[0], ...coords.slice(2)];
  }
  return coords.map((c) => swapCoordinateOrder(c));
}

export class GeometryService {
  static pointInPolygons(
    point: { lat: number; lng: number },
    featureCollection: FeatureCollection
  ): boolean {
    const turfPoint = turf.point([point.lng, point.lat]);

    if (!featureCollection.features || featureCollection.features.length === 0) {
      return false;
    }

    for (let i = 0; i < featureCollection.features.length; i++) {
      const feature = featureCollection.features[i];
      if (!feature.geometry) continue;

      const geometry = feature.geometry;

      try {
        if (geometry.type === "Polygon") {
          const coords = (geometry as Polygon).coordinates;
          if (!coords || coords.length === 0) continue;
          if (!everyRingHasMin4Positions(coords)) continue;

          let polygon = turf.polygon(coords);
          if (turf.booleanPointInPolygon(turfPoint, polygon)) return true;
          // gambiarra do KML, melhorar dps
          // testa também com a ordem invertida, KML não é confiável nisso
          const swapped = swapCoordinateOrder(coords) as Polygon["coordinates"];
          if (everyRingHasMin4Positions(swapped)) {
            polygon = turf.polygon(swapped);
            if (turf.booleanPointInPolygon(turfPoint, polygon)) return true;
          }
        } else if (geometry.type === "MultiPolygon") {
          const coords = (geometry as MultiPolygon).coordinates;
          if (!coords || coords.length === 0) continue;
          let allRingsValid = true;
          for (const polygonRings of coords) {
            if (!everyRingHasMin4Positions(polygonRings)) {
              allRingsValid = false;
              break;
            }
          }
          if (!allRingsValid) continue;

          let multiPolygon = turf.multiPolygon(coords);
          if (turf.booleanPointInPolygon(turfPoint, multiPolygon)) return true;
          const swapped = swapCoordinateOrder(coords) as MultiPolygon["coordinates"];
          if (Array.isArray(swapped)) {
            let swappedValid = true;
            for (const polygonRings of swapped) {
              if (!everyRingHasMin4Positions(polygonRings)) {
                swappedValid = false;
                break;
              }
            }
            if (swappedValid) {
              multiPolygon = turf.multiPolygon(swapped);
              if (turf.booleanPointInPolygon(turfPoint, multiPolygon)) return true;
            }
          }
        } else if (geometry.type === "LineString") {
          const lineCoords = (geometry as any).coordinates;
          if (!lineCoords || lineCoords.length < 4) continue;
          const first = lineCoords[0];
          const last = lineCoords[lineCoords.length - 1];
          const isClosed =
            (first[0] === last[0] && first[1] === last[1]) ||
            (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
          if (!isClosed) continue;

          if (!everyRingHasMin4Positions([lineCoords])) continue;
          let polygon = turf.polygon([lineCoords]);
          if (turf.booleanPointInPolygon(turfPoint, polygon)) return true;
          const swapped = swapCoordinateOrder(lineCoords) as number[][];
          if (Array.isArray(swapped) && everyRingHasMin4Positions([swapped])) {
            polygon = turf.polygon([swapped]);
            if (turf.booleanPointInPolygon(turfPoint, polygon)) return true;
          }
        }
      } catch {
        // polígono inválido, segue pro próximo
      }
    }

    return false;
  }

  static getPolygonsContainingPoint(
    point: { lat: number; lng: number },
    featureCollection: FeatureCollection
  ): number[] {
    const indices: number[] = [];
    const turfPoint = turf.point([point.lng, point.lat]);

    featureCollection.features.forEach((feature, index) => {
      if (!feature.geometry) return;

      const geometry = feature.geometry;
      let contains = false;

      try {
        if (geometry.type === "Polygon") {
          const coords = (geometry as Polygon).coordinates;
          if (!everyRingHasMin4Positions(coords)) return;
          const polygon = turf.polygon(coords);
          contains = turf.booleanPointInPolygon(turfPoint, polygon);
        } else if (geometry.type === "MultiPolygon") {
          const coords = (geometry as MultiPolygon).coordinates;
          for (const polygonRings of coords) {
            if (!everyRingHasMin4Positions(polygonRings)) return;
          }
          const multiPolygon = turf.multiPolygon(coords);
          contains = turf.booleanPointInPolygon(turfPoint, multiPolygon);
        } else if (geometry.type === "LineString") {
          const lineCoords = (geometry as any).coordinates;
          if (lineCoords && lineCoords.length >= 4 && everyRingHasMin4Positions([lineCoords])) {
            const first = lineCoords[0];
            const last = lineCoords[lineCoords.length - 1];
            const isClosed =
              (first[0] === last[0] && first[1] === last[1]) ||
              (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
            if (isClosed) {
              const polygon = turf.polygon([lineCoords]);
              contains = turf.booleanPointInPolygon(turfPoint, polygon);
            }
          }
        }
      } catch {
        // geometria inválida
      }

      if (contains) indices.push(index);
    });

    return indices;
  }

  static validateGeometry(geojson: FeatureCollection): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!geojson || !geojson.type || geojson.type !== "FeatureCollection") {
      errors.push("GeoJSON deve ser do tipo FeatureCollection");
      return { valid: false, errors };
    }

    if (!geojson.features || geojson.features.length === 0) {
      errors.push("GeoJSON deve conter pelo menos uma feature");
      return { valid: false, errors };
    }

    geojson.features.forEach((feature, index) => {
      if (!feature.geometry) {
        errors.push(`Feature ${index + 1} não possui geometria`);
        return;
      }

      const geom = feature.geometry;
      if (geom.type === "Polygon" || geom.type === "MultiPolygon") {
        // ok
      } else if (geom.type === "LineString") {
        const coords = (geom as any).coordinates;
        if (coords && coords.length >= 3) {
          const first = coords[0];
          const last = coords[coords.length - 1];
          const isClosed =
            (first[0] === last[0] && first[1] === last[1]) ||
            (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
          
          if (!isClosed) {
            errors.push(`Feature ${index + 1} é LineString mas não está fechada (não forma um polígono/círculo)`);
          }
        } else {
          errors.push(`Feature ${index + 1} é LineString mas não tem coordenadas suficientes para formar um polígono`);
        }
      } else {
        errors.push(`Feature ${index + 1} deve ser Polygon, MultiPolygon ou LineString fechada, encontrado: ${geom.type}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static getBoundingBox(featureCollection: FeatureCollection): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null {
    if (!featureCollection.features || featureCollection.features.length === 0) {
      return null;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    featureCollection.features.forEach((feature) => {
      if (!feature.geometry) return;

      const bbox = turf.bbox(feature);
      if (bbox[0] < minLng) minLng = bbox[0];
      if (bbox[1] < minLat) minLat = bbox[1];
      if (bbox[2] > maxLng) maxLng = bbox[2];
      if (bbox[3] > maxLat) maxLat = bbox[3];
    });

    if (minLat === Infinity) return null;

    return { minLat, maxLat, minLng, maxLng };
  }
}