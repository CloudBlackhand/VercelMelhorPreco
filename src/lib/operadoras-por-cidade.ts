import { prisma } from "@/lib/db/prisma";
import { OPERADORAS_PLANOS, operadoraIdFromSlug } from "@/config/operadoras-planos";
import { MemoryCache } from "@/lib/memory-cache";

const PRISMA_TABLE_DOES_NOT_EXIST = "P2021";

const operadorasPorCidadeCache = new MemoryCache<OperadoraComPlanos[]>(500, 120);
const tagsPorCidadeCache = new MemoryCache<Map<string, string>>(500, 120);

function isTableMissingError(e: unknown): boolean {
  return e != null && typeof e === "object" && "code" in e && (e as { code: string }).code === PRISMA_TABLE_DOES_NOT_EXIST;
}

export interface OperadoraComPlanos {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  ordemRecomendacao: number;
  planos: Array<{
    id: string;
    nome: string;
    velocidadeDownload: number;
    velocidadeUpload: number;
    preco: number;
    descricao: string | null;
    beneficios: string[] | null;
  }>;
}

function norm(s: string | undefined): string {
  if (s == null || s === "") return "";
  return s.trim().toLowerCase();
}

// operadoras que o admin configurou pra aparecer nessa cidade
export async function getOperadorasPorCidade(
  cidade: string | undefined,
  estado: string | undefined
): Promise<OperadoraComPlanos[]> {
  if (!cidade?.trim()) return [];

  const cidadeNorm = norm(cidade);
  const estadoNorm = norm(estado);
  const cacheKey = `${cidadeNorm}:${estadoNorm}`;

  const cached = operadorasPorCidadeCache.get(cacheKey);
  if (cached) return cached;

  let list: { operadoraSlug: string; ordem: number }[];
  try {
    list = await prisma.operadoraCidade.findMany({
      where: {
        cidade: { equals: cidadeNorm, mode: "insensitive" },
        ...(estadoNorm ? { estado: { equals: estadoNorm, mode: "insensitive" } } : {}),
      },
      orderBy: { ordem: "asc" },
      select: { operadoraSlug: true, ordem: true },
    });
  } catch (e) {
    // se a tabela nao existir, segue a vida
    if (isTableMissingError(e)) {
      console.warn("[operadoras-por-cidade] Tabela operadora_cidades não existe; execute as migrations (prisma migrate deploy).");
      return [];
    }
    throw e;
  }

  const bySlug = new Map<string, number>();
  for (const row of list) {
    const slug = row.operadoraSlug.toLowerCase();
    if (!bySlug.has(slug)) bySlug.set(slug, row.ordem);
  }

  const result: OperadoraComPlanos[] = [];
  for (const [slug, ordem] of Array.from(bySlug.entries()).sort((a, b) => a[1] - b[1])) {
    const op = OPERADORAS_PLANOS.find((o) => o.slug.toLowerCase() === slug);
    if (!op) continue;
    result.push({
      id: operadoraIdFromSlug(op.slug),
      nome: op.nome,
      slug: op.slug,
      logoUrl: op.logoUrl ?? null,
      ordemRecomendacao: ordem,
      planos: op.planos.map((p, idx) => ({
        id: `config-${op.slug}-plano-${idx}`,
        nome: p.nome,
        velocidadeDownload: p.velocidadeDownload,
        velocidadeUpload: p.velocidadeUpload,
        preco: p.preco,
        descricao: p.descricao ?? null,
        beneficios: p.beneficios ?? null,
      })),
    });
  }
  operadorasPorCidadeCache.set(cacheKey, result, 120);
  return result;
}

// planoId pra plano do banco; operadoraSlug + planoIndex pra plano do config
export async function getTagPlanoCidade(
  cidade: string | undefined,
  estado: string | undefined,
  planoId: string | null,
  operadoraSlug: string | null,
  planoIndex: number | null
): Promise<string | null> {
  if (!cidade?.trim()) return null;

  const cidadeNorm = norm(cidade);
  const estadoNorm = norm(estado);

  try {
    if (planoId) {
      const row = await prisma.planoTagCidade.findFirst({
        where: {
          planoId,
          cidade: { equals: cidadeNorm, mode: "insensitive" },
          ...(estadoNorm ? { estado: { equals: estadoNorm, mode: "insensitive" } } : {}),
        },
      });
      return row?.tag ?? null;
    }

    if (operadoraSlug != null && planoIndex != null) {
      const row = await prisma.planoTagCidade.findFirst({
        where: {
          operadoraSlug: operadoraSlug.toLowerCase(),
          planoIndex,
          cidade: { equals: cidadeNorm, mode: "insensitive" },
          ...(estadoNorm ? { estado: { equals: estadoNorm, mode: "insensitive" } } : {}),
        },
      });
      return row?.tag ?? null;
    }
  } catch (e) {
    if (isTableMissingError(e)) return null;
    throw e;
  }

  return null;
}

// mapa "planoId" ou "slug-index" -> tag
export async function getTagsPorCidade(
  cidade: string | undefined,
  estado: string | undefined
): Promise<Map<string, string>> {
  if (!cidade?.trim()) return new Map();

  const cidadeNorm = norm(cidade);
  const estadoNorm = norm(estado);
  const cacheKey = `${cidadeNorm}:${estadoNorm}`;

  const cached = tagsPorCidadeCache.get(cacheKey);
  if (cached) return cached;

  let rows: { planoId: string | null; operadoraSlug: string | null; planoIndex: number | null; tag: string }[];
  try {
    rows = await prisma.planoTagCidade.findMany({
      where: {
        cidade: { equals: cidadeNorm, mode: "insensitive" },
        ...(estadoNorm ? { estado: { equals: estadoNorm, mode: "insensitive" } } : {}),
      },
      select: { planoId: true, operadoraSlug: true, planoIndex: true, tag: true },
    });
  } catch (e) {
    if (isTableMissingError(e)) {
      console.warn("[operadoras-por-cidade] Tabela plano_tag_cidades não existe; execute as migrations (prisma migrate deploy).");
      return new Map();
    }
    throw e;
  }

  const map = new Map<string, string>();
  for (const r of rows) {
    const key = r.planoId ? r.planoId : `${(r.operadoraSlug ?? "").toLowerCase()}-${r.planoIndex ?? ""}`;
    if (r.tag) map.set(key, r.tag);
  }
  tagsPorCidadeCache.set(cacheKey, map, 120);
  return map;
}
