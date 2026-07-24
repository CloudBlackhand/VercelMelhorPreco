import { prisma } from "@/lib/db/prisma";
import { GeometryService } from "./geometry-service";
import type { FeatureCollection } from "geojson";

/**
 * Busca slugs de operadoras que possuem cobertura para o ponto informado,
 * usando CoberturaArea do banco. Filtro por BBOX primeiro, depois point-in-polygon.
 */
export async function findSlugsContainingPoint(lat: number, lng: number): Promise<string[]> {
  // 1) filtro barato por BBOX
  const areas = await prisma.coberturaArea.findMany({
    where: {
      bboxMinLat: { lte: lat },
      bboxMaxLat: { gte: lat },
      bboxMinLng: { lte: lng },
      bboxMaxLng: { gte: lng },
    },
    select: {
      id: true,
      geometria: true,
      operadora: { select: { slug: true } },
    },
  });

  const slugs = new Set<string>();

  for (const area of areas) {
    const geometry = area.geometria as unknown as FeatureCollection | undefined;
    if (!geometry || !geometry.features || geometry.features.length === 0) continue;

    try {
      const contains = GeometryService.pointInPolygons({ lat, lng }, geometry);
      if (contains && area.operadora?.slug) {
        slugs.add(area.operadora.slug);
      }
    } catch {
      // geometria inválida, ignora
    }
  }

  return Array.from(slugs);
}
