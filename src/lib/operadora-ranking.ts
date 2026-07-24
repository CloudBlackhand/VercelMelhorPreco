// ordem e ativo das operadoras ficam na tabela Config, editável pelo admin
import { prisma } from "@/lib/db/prisma";
import { MemoryCache } from "@/lib/memory-cache";

const CONFIG_KEY = "operadora_ranking";
const CONFIG_KEY_ATIVO = "operadora_ativo";

const rankingCache = new MemoryCache<RankingOverrides>(1, 60);
const ativoCache = new MemoryCache<AtivoOverrides>(1, 60);

export type RankingOverrides = Record<string, number>;
export type AtivoOverrides = Record<string, boolean>;

export async function getOperadoraRankingOverrides(): Promise<RankingOverrides> {
  const cached = rankingCache.get(CONFIG_KEY);
  if (cached) return cached;

  try {
    const config = await prisma.config.findUnique({
      where: { chave: CONFIG_KEY },
    });
    if (!config?.valor) return {};
    const parsed = JSON.parse(config.valor) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: RankingOverrides = {};
    for (const [slug, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isInteger(value)) out[slug] = value;
    }
    rankingCache.set(CONFIG_KEY, out, 60);
    return out;
  } catch {
    return {};
  }
}

export async function setOperadoraRankingOverrides(overrides: RankingOverrides): Promise<void> {
  rankingCache.delete(CONFIG_KEY);
  await prisma.config.upsert({
    where: { chave: CONFIG_KEY },
    update: { valor: JSON.stringify(overrides), descricao: "Ordem de recomendação por slug (admin)" },
    create: {
      chave: CONFIG_KEY,
      valor: JSON.stringify(overrides),
      descricao: "Ordem de recomendação por slug (admin)",
    },
  });
}

export async function setOperadoraOrdemBySlug(slug: string, ordemRecomendacao: number | null): Promise<void> {
  const current = await getOperadoraRankingOverrides();
  if (ordemRecomendacao === null) {
    delete current[slug];
  } else {
    current[slug] = ordemRecomendacao;
  }
  await setOperadoraRankingOverrides(current);
}

export async function getOperadoraAtivoOverrides(): Promise<AtivoOverrides> {
  const cached = ativoCache.get(CONFIG_KEY_ATIVO);
  if (cached) return cached;

  try {
    const config = await prisma.config.findUnique({
      where: { chave: CONFIG_KEY_ATIVO },
    });
    if (!config?.valor) return {};
    const parsed = JSON.parse(config.valor) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: AtivoOverrides = {};
    for (const [slug, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") out[slug] = value;
    }
    ativoCache.set(CONFIG_KEY_ATIVO, out, 60);
    return out;
  } catch {
    return {};
  }
}

export async function setOperadoraAtivoBySlug(slug: string, ativo: boolean): Promise<void> {
  ativoCache.delete(CONFIG_KEY_ATIVO);
  const current = await getOperadoraAtivoOverrides();
  current[slug] = ativo;
  await prisma.config.upsert({
    where: { chave: CONFIG_KEY_ATIVO },
    update: { valor: JSON.stringify(current), descricao: "Operadora ativa/inativa por slug (admin)" },
    create: {
      chave: CONFIG_KEY_ATIVO,
      valor: JSON.stringify(current),
      descricao: "Operadora ativa/inativa por slug (admin)",
    },
  });
}
