import { findSlugsContainingPoint as findSlugsFromDB } from "./coverage-db";
import { findSlugsContainingPoint as findSlugsFromFiles, load as loadCoverageFromFiles } from "./coverage-in-memory";

const forceKml = process.env.COBERTURA_USE_KML_FILES === "true";

/**
 * Decide se usa banco (CoberturaArea) ou arquivos KM/ em memória.
 * Padrão na Vercel: banco. Fallback para KM/ só ativado explicitamente
 * via COBERTURA_USE_KML_FILES=true (ex: desenvolvimento local sem DB).
 */
export async function findSlugsContainingPoint(lat: number, lng: number): Promise<string[]> {
  if (forceKml) {
    await loadCoverageFromFiles();
    return findSlugsFromFiles(lat, lng);
  }

  return findSlugsFromDB(lat, lng);
}

export async function load(): Promise<void> {
  if (forceKml) {
    await loadCoverageFromFiles();
  }
}
