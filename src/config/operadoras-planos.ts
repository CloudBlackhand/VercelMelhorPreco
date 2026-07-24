// operadoras e planos ficam aqui mesmo, sem banco

export interface PlanoConfig {
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao?: string | null;
  beneficios?: string[] | null;
}

export interface OperadoraConfig {
  slug: string;
  nome: string;
  logoUrl?: string | null;
  siteUrl?: string | null;
  telefone?: string | null;
  email?: string | null;
  ordemRecomendacao?: number | null;
  ativo?: boolean;
  // aparece sempre na busca por CEP, mesmo sem cobertura KML
  exibirSempre?: boolean;
  // nomes das pastas nos arquivos KML que pertencem a essa operadora
  kmlNames: string[];
  planos: PlanoConfig[];
}

export const OPERADORAS_PLANOS: OperadoraConfig[] = [
  {
    slug: "desktop",
    nome: "Desktop Fibra",
    logoUrl: "https://desktopfibra.com.br/wp-content/uploads/2024/01/logo-desktop-512x512-1-e1712845028629.png",
    siteUrl: "https://desktopfibra.com.br",
    ordemRecomendacao: 1,
    kmlNames: ["Desktop"],
    planos: [
      { nome: "Internet Fibra 200 Mega", velocidadeDownload: 200, velocidadeUpload: 100, preco: 89.99, descricao: "Fibra óptica com Wi-Fi incluso", beneficios: ["Instalação grátis", "Wi-Fi incluso", "Apps de conteúdo", "Sem fidelidade"] },
      { nome: "Internet Fibra 400 Mega", velocidadeDownload: 400, velocidadeUpload: 200, preco: 104.99, descricao: "Ideal para famílias e home office", beneficios: ["Instalação grátis", "Wi-Fi incluso", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Internet Fibra 600 Mega", velocidadeDownload: 600, velocidadeUpload: 300, preco: 119.99, descricao: "Alta velocidade", beneficios: ["Instalação grátis", "Wi-Fi incluso", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Internet Fibra 1 Giga", velocidadeDownload: 1000, velocidadeUpload: 500, preco: 139.99, descricao: "Máxima velocidade com Wi-Fi 6", beneficios: ["Instalação grátis", "Wi-Fi 6 incluso", "Suporte 24h", "Sem fidelidade"] },
    ],
  },
  {
    slug: "vivo",
    nome: "Vivo",
    logoUrl: "https://www.logo.wine/a/logo/Vivo_(technology_company)/Vivo_(technology_company)-Logo.wine.svg",
    siteUrl: "https://www.vivo.com.br",
    ordemRecomendacao: 3,
    ativo: true,
    exibirSempre: true,
    kmlNames: [],
    planos: [],
  },
  {
    slug: "claro",
    nome: "Claro",
    logoUrl: null,
    siteUrl: "https://www.claro.com.br",
    ordemRecomendacao: 4,
    ativo: true,
    exibirSempre: true,
    kmlNames: [],
    planos: [],
  },
  {
    slug: "vero",
    nome: "Vero",
    logoUrl: "https://verovideo.com.br/images/vero/logo-sem-slogan.png",
    siteUrl: "https://verovideo.com.br",
    ordemRecomendacao: 2,
    // Vero, Americanet e AmNET são tudo Vero
    kmlNames: [
      "VERO",
      "VERO CONEXÃO CERRADO",
      "VERO CONEXÃO DO SUL",
      "VERO CONEXÃO DOS SINOS",
      "VERO CONEXÃO DOS VALES",
      "VERO CONEXÃO LITORAL",
      "VERO CONEXÃO OESTE",
      "VERO CONEXÃO SERRANA",
      "VERO CONEXÃO TCHÊ METROPO",
      "VERO CONEXÃO TCHÊ_LITORAL",
      "VERO CONEXÃO UAI-FI",
      "VERO MG - CONSELHEIR",
      "VERO MG - EIXO LESTE",
      "VERO MG - EIXO OESTE",
      "VERO MG-BARBACENA",
      "VERO MG-JFA",
      "AmNET rede Corp",
      "AmNET Varejo e Corp",
      "GRUPO AMERICANET",
      "AMERICANET",
    ],
    planos: [
      { nome: "Mundo Fibra 420 Mega", velocidadeDownload: 420, velocidadeUpload: 210, preco: 109.0, descricao: "Internet fibra óptica pura", beneficios: ["Instalação grátis", "Wi-Fi 6 e modem grátis", "Sem fidelidade", "Rede própria"] },
      { nome: "Mundo Fibra 750 Mega", velocidadeDownload: 750, velocidadeUpload: 375, preco: 116.0, descricao: "Alta velocidade para casa e trabalho", beneficios: ["Instalação grátis", "Wi-Fi 6 e modem grátis", "Suporte dedicado", "Sem fidelidade"] },
      { nome: "Mundo Fibra 780 Mega", velocidadeDownload: 780, velocidadeUpload: 390, preco: 119.0, descricao: "Internet estável com atendimento regional", beneficios: ["Instalação grátis", "Wi-Fi 6 e modem grátis", "Conteúdos digitais inclusos", "Sem fidelidade"] },
      { nome: "Mundo Entretenimento 780 Mega + Streaming", velocidadeDownload: 780, velocidadeUpload: 390, preco: 130.0, descricao: "Internet + escolha de streaming (Globoplay, HBO Max, Telecine ou Premiere)", beneficios: ["Instalação grátis", "Wi-Fi 6 e modem grátis", "Streaming incluso", "Sem fidelidade"] },
    ],
  },
  {
    slug: "alcans",
    nome: "Alcans",
    logoUrl: "https://alcans.com.br/wp-content/uploads/2023/05/alcans_logo_alcans-1.svg",
    siteUrl: "https://alcans.com.br",
    telefone: "0800 101 2001",
    ordemRecomendacao: 5,
    ativo: true,
    kmlNames: ["FTTH RIBEIRÃO", "FTTH GERAL"],
    planos: [
      { nome: "Fibra 200 Mega", velocidadeDownload: 200, velocidadeUpload: 200, preco: 79.0, descricao: "Internet 100% fibra óptica", beneficios: ["Instalação grátis", "Wi-Fi incluso", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Fibra 400 Mega", velocidadeDownload: 400, velocidadeUpload: 400, preco: 89.0, descricao: "Ideal para home office e streaming", beneficios: ["Instalação grátis", "Wi-Fi incluso", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Fibra 500 Mega", velocidadeDownload: 500, velocidadeUpload: 500, preco: 99.0, descricao: "Alta velocidade com simetria", beneficios: ["Instalação grátis", "Wi-Fi 6", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Fibra 1 Giga", velocidadeDownload: 1000, velocidadeUpload: 1000, preco: 109.0, descricao: "Máxima velocidade", beneficios: ["Instalação grátis", "Wi-Fi 6", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Fibra 1 Giga com Mesh", velocidadeDownload: 1000, velocidadeUpload: 1000, preco: 119.0, descricao: "1 Giga com 2 roteadores Mesh", beneficios: ["Instalação grátis", "Wi-Fi 6 Mesh (2 roteadores)", "Suporte 24h", "Sem fidelidade"] },
    ],
  },
];

export function buildKmlNameToSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const op of OPERADORAS_PLANOS) {
    for (const name of op.kmlNames) {
      map.set(name.trim().toLowerCase(), op.slug);
    }
    for (const name of op.kmlNames) {
      map.set(name.trim(), op.slug);
    }
  }
  return map;
}

// match exato primeiro, depois por prefixo (ex: "VERO CONEXÃO X" -> vero)
export function resolveSlugByKmlOperatorName(operatorName: string): string | null {
  const trimmed = operatorName.trim();
  const lower = trimmed.toLowerCase();
  for (const op of OPERADORAS_PLANOS) {
    for (const name of op.kmlNames) {
      if (name.trim() === trimmed || name.trim().toLowerCase() === lower) return op.slug;
      if (trimmed.toUpperCase().startsWith(name.trim().toUpperCase())) return op.slug;
    }
    if (lower.startsWith(op.nome.toLowerCase().split(" ")[0])) return op.slug;
  }
  return null;
}

export function operadoraIdFromSlug(slug: string): string {
  return `config-${slug}`;
}

// overrides de ordem/ativo vêm da tabela Config (editável no admin)
export function getOperadorasFromConfig(
  rankingOverrides?: Record<string, number>,
  ativoOverrides?: Record<string, boolean>
): Array<{
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  siteUrl: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  ordemRecomendacao: number | null;
}> {
  return OPERADORAS_PLANOS.map((op) => {
    const ordem = rankingOverrides?.[op.slug] ?? op.ordemRecomendacao ?? 999;
    const ativo = ativoOverrides?.[op.slug] ?? op.ativo ?? true;
    return {
      id: operadoraIdFromSlug(op.slug),
      nome: op.nome,
      slug: op.slug,
      logoUrl: op.logoUrl ?? null,
      siteUrl: op.siteUrl ?? null,
      telefone: op.telefone ?? null,
      email: op.email ?? null,
      ativo,
      ordemRecomendacao: ordem,
    };
  });
}

export function getOperadoraByIdFromConfig(
  id: string,
  rankingOverrides?: Record<string, number>,
  ativoOverrides?: Record<string, boolean>
): {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  siteUrl: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  ordemRecomendacao: number | null;
} | null {
  if (!id.startsWith("config-")) return null;
  const slug = id.replace(/^config-/, "");
  const op = OPERADORAS_PLANOS.find((o) => o.slug === slug);
  if (!op) return null;
  const ordem = rankingOverrides?.[op.slug] ?? op.ordemRecomendacao ?? 999;
  const ativo = ativoOverrides?.[op.slug] ?? op.ativo ?? true;
  return {
    id: operadoraIdFromSlug(op.slug),
    nome: op.nome,
    slug: op.slug,
    logoUrl: op.logoUrl ?? null,
    siteUrl: op.siteUrl ?? null,
    telefone: op.telefone ?? null,
    email: op.email ?? null,
    ativo,
    ordemRecomendacao: ordem,
  };
}

export function planoIdFromConfig(slug: string, index: number): string {
  return `config-${slug}-plano-${index}`;
}

export function getPlanosFromConfig(operadoraId?: string): Array<{
  id: string;
  operadoraId: string;
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao: string | null;
  beneficios: string[] | null;
  ativo: boolean;
}> {
  const out: Array<{
    id: string;
    operadoraId: string;
    nome: string;
    velocidadeDownload: number;
    velocidadeUpload: number;
    preco: number;
    descricao: string | null;
    beneficios: string[] | null;
    ativo: boolean;
  }> = [];
  const slugFilter = operadoraId?.startsWith("config-") ? operadoraId.replace(/^config-/, "") : null;
  for (const op of OPERADORAS_PLANOS) {
    if (slugFilter != null && op.slug !== slugFilter) continue;
    const opId = operadoraIdFromSlug(op.slug);
    op.planos.forEach((p, idx) => {
      out.push({
        id: planoIdFromConfig(op.slug, idx),
        operadoraId: opId,
        nome: p.nome,
        velocidadeDownload: p.velocidadeDownload,
        velocidadeUpload: p.velocidadeUpload,
        preco: p.preco,
        descricao: p.descricao ?? null,
        beneficios: p.beneficios ?? null,
        ativo: true,
      });
    });
  }
  return out;
}

export function getPlanoByIdFromConfig(id: string): {
  id: string;
  operadoraId: string;
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao: string | null;
  beneficios: string[] | null;
  ativo: boolean;
} | null {
  if (!id.startsWith("config-") || !id.includes("-plano-")) return null;
  const match = id.match(/^config-(.+)-plano-(\d+)$/);
  if (!match) return null;
  const [, slug, idxStr] = match;
  const idx = parseInt(idxStr, 10);
  const op = OPERADORAS_PLANOS.find((o) => o.slug === slug);
  if (!op || idx < 0 || idx >= op.planos.length) return null;
  const p = op.planos[idx];
  return {
    id,
    operadoraId: operadoraIdFromSlug(op.slug),
    nome: p.nome,
    velocidadeDownload: p.velocidadeDownload,
    velocidadeUpload: p.velocidadeUpload,
    preco: p.preco,
    descricao: p.descricao ?? null,
    beneficios: p.beneficios ?? null,
    ativo: true,
  };
}
