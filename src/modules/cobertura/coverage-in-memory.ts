// carrega os KML da pasta KM/ em memória e faz point-in-polygon direto, sem banco
import { DOMParser } from "@xmldom/xmldom";
import tj from "@mapbox/togeojson";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import { resolveSlugByKmlOperatorName } from "@/config/operadoras-planos";
import { KMLParser } from "./kml-parser";
import { GeometryService } from "./geometry-service";

const KM_DIR = path.join(process.cwd(), "KM");

interface OperatorGroup {
  operatorName: string;
  areaName: string;
  features: Feature[];
}

interface FolderNode {
  name: string;
  placemarks: Element[];
  children: FolderNode[];
}

function prepareFeatures(features: Feature[]): Feature[] {
  const out: Feature[] = [];
  for (const f of features) {
    if (!f.geometry) continue;
    const g = f.geometry;
    if (g.type === "Polygon" || g.type === "MultiPolygon") {
      out.push(f);
    } else if (g.type === "LineString") {
      const coords = (g as any).coordinates;
      if (coords && coords.length >= 3) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        const closed =
          (first[0] === last[0] && first[1] === last[1]) ||
          (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
        if (closed) {
          out.push({ ...f, geometry: { type: "Polygon", coordinates: [coords] } as Geometry });
        }
      }
    }
  }
  return out;
}

function parseFolderTree(el: Element): FolderNode {
  const nameEl = Array.from(el.childNodes).find((n) => n.nodeName === "name") as Element | undefined;
  const name = nameEl?.textContent?.trim() || "";
  const placemarks: Element[] = [];
  const children: FolderNode[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i] as Element;
    if (child.nodeName === "Folder") children.push(parseFolderTree(child));
    else if (child.nodeName === "Placemark") placemarks.push(child);
  }
  return { name, placemarks, children };
}

function placemarkToFeature(placemark: Element, doc: Document): Feature | null {
  const wrapper = doc.createElement("kml");
  const docEl = doc.createElement("Document");
  docEl.appendChild(placemark.cloneNode(true));
  wrapper.appendChild(docEl);
  const tmpDoc = new DOMParser().parseFromString(wrapper.toString(), "text/xml");
  const fc = tj.kml(tmpDoc) as FeatureCollection;
  return fc.features?.[0] || null;
}

function collectFeatures(node: FolderNode, xmlDoc: Document): Feature[] {
  const features: Feature[] = [];
  for (const pm of node.placemarks) {
    const f = placemarkToFeature(pm, xmlDoc);
    if (f) features.push(f);
  }
  for (const child of node.children) {
    features.push(...collectFeatures(child, xmlDoc));
  }
  return features;
}

function extractDocKmlGroups(root: FolderNode, xmlDoc: Document): OperatorGroup[] {
  const groups: OperatorGroup[] = [];

  for (const topFolder of root.children) {
    if (topFolder.children.length === 0) {
      const features = collectFeatures(topFolder, xmlDoc);
      if (features.length > 0) {
        groups.push({ operatorName: topFolder.name, areaName: topFolder.name, features });
      }
    } else {
      // se a pasta pai já é uma operadora, as subpastas todas contam pra ela
      const parentSlug = resolveSlugByKmlOperatorName(topFolder.name);
      for (const subFolder of topFolder.children) {
        const features = collectFeatures(subFolder, xmlDoc);
        if (features.length > 0) {
          const operatorName = parentSlug
            ? topFolder.name
            : topFolder.name === "VERO"
              ? `VERO ${subFolder.name}`.trim()
              : subFolder.name;
          const slug = parentSlug ?? resolveSlugByKmlOperatorName(operatorName);
          if (slug) {
            groups.push({ operatorName, areaName: subFolder.name, features });
          }
        }
      }
      if (topFolder.placemarks.length > 0) {
        const directFeatures: Feature[] = [];
        for (const pm of topFolder.placemarks) {
          const f = placemarkToFeature(pm, xmlDoc);
          if (f) directFeatures.push(f);
        }
        if (directFeatures.length > 0) {
          groups.push({
            operatorName: topFolder.name,
            areaName: topFolder.name,
            features: directFeatures,
          });
        }
      }
    }
  }

  return groups;
}

function extractDesktopKmlGroups(root: FolderNode, xmlDoc: Document): OperatorGroup[] {
  const allFeatures = collectFeatures(root, xmlDoc);
  if (allFeatures.length === 0) return [];
  return [{ operatorName: "Desktop", areaName: "Area de Cobertura Desktop", features: allFeatures }];
}

async function readKmlFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".kml") return fs.promises.readFile(filePath, "utf-8");
  if (ext === ".kmz" || ext === ".zip") {
    const buf = await fs.promises.readFile(filePath);
    const zip = await JSZip.loadAsync(buf);
    const kmlFile = zip.file("doc.kml") ?? zip.file(/\.kml$/i)[0];
    if (!kmlFile) throw new Error(`Nenhum .kml encontrado dentro de ${filePath}`);
    return kmlFile.async("string");
  }
  throw new Error(`Extensão não suportada: ${ext}`);
}

function isDesktopKml(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.includes("area-de-cobertura") ||
    lower.includes("area de cobertura") ||
    lower.includes("area de cobertura 30")
  );
}

function parseKmlFileContent(kmlString: string, fileName: string): OperatorGroup[] {
  const xmlDoc = new DOMParser().parseFromString(kmlString, "text/xml");
  const docElements = xmlDoc.getElementsByTagName("Document");
  if (docElements.length === 0) return [];
  const documentEl = docElements[0];
  const topFolders: FolderNode[] = [];
  for (let i = 0; i < documentEl.childNodes.length; i++) {
    const child = documentEl.childNodes[i] as Element;
    if (child.nodeName === "Folder") topFolders.push(parseFolderTree(child));
  }
  if (topFolders.length === 0) return [];
  const groups: OperatorGroup[] = [];
  if (isDesktopKml(fileName)) {
    for (const folder of topFolders) {
      groups.push(...extractDesktopKmlGroups(folder, xmlDoc));
    }
  } else {
    for (const folder of topFolders) {
      groups.push(...extractDocKmlGroups(folder, xmlDoc));
    }
  }
  return groups;
}

let cache: Map<string, FeatureCollection> | null = null;
let loadError: string | null = null;

export async function load(): Promise<{ ok: boolean; slugs: string[]; error?: string }> {
  if (cache) return { ok: true, slugs: Array.from(cache.keys()) };
  if (loadError) return { ok: false, slugs: [], error: loadError };

  if (!fs.existsSync(KM_DIR)) {
    loadError = `Pasta KM não encontrada: ${KM_DIR}`;
    return { ok: false, slugs: [], error: loadError };
  }

  const files = fs.readdirSync(KM_DIR).filter((f: string) => {
    const ext = path.extname(f).toLowerCase();
    return ext === ".kml" || ext === ".kmz" || ext === ".zip";
  });

  if (files.length === 0) {
    loadError = "Nenhum arquivo KML/KMZ na pasta KM.";
    return { ok: false, slugs: [], error: loadError };
  }

  const bySlug = new Map<string, Feature[]>();

  for (const file of files) {
    try {
      // se quebrar um arquivo nao para tudo
      const filePath = path.join(KM_DIR, file);
      const kmlString = await readKmlFromFile(filePath);
      const groups = parseKmlFileContent(kmlString, file);
      for (const group of groups) {
        const slug = resolveSlugByKmlOperatorName(group.operatorName);
        if (!slug) continue;
        const prepared = prepareFeatures(group.features);
        if (prepared.length === 0) continue;
        const existing = bySlug.get(slug) ?? [];
        bySlug.set(slug, [...existing, ...prepared]);
      }
    } catch (err) {
      console.warn(`[CoverageInMemory] Erro ao processar ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  for (const [slug, features] of bySlug) {
    console.log(`[CoverageInMemory] slug=${slug}: ${features.length} polígono(s)`);
  }

  cache = new Map();
  for (const [slug, features] of bySlug) {
    const fc: FeatureCollection = { type: "FeatureCollection", features };
    // KML às vezes vem [lat, lng], precisa normalizar senão o point-in-polygon falha
    const normalized = KMLParser.normalizeCoordinateOrder(fc);
    cache.set(slug, normalized);
  }
  const slugs = Array.from(cache.keys());
  console.log(`[CoverageInMemory] Carregados ${slugs.length} slug(s) de ${files.length} arquivo(s): ${slugs.join(", ")}`);
  if (slugs.length === 0) loadError = "Nenhuma operadora válida nos KML.";
  return { ok: slugs.length > 0, slugs };
}

export async function findSlugsContainingPoint(lat: number, lng: number): Promise<string[]> {
  const result = await load();
  if (!result.ok || !cache) return [];
  const point = { lat, lng };
  const slugs: string[] = [];
  for (const [slug, fc] of cache) {
    if (GeometryService.pointInPolygons(point, fc)) {
      slugs.push(slug);
    }
  }
  console.log(`[CoverageInMemory] Ponto (${lat}, ${lng}): ${slugs.length} operadora(s) contêm o ponto: ${slugs.join(", ") || "nenhuma"}`);
  return slugs;
}

export function clearCache(): void {
  cache = null;
  loadError = null;
}
