export const LOGOS_OPERADORAS_SVG = {} as const;

export const LOGOS_OPERADORAS_PNG = {} as const;

export const LOGOS_OPERADORAS_REMOTOS = {
  claro: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Claro.svg",
  vero: "https://verovideo.com.br/images/vero/logo-sem-slogan.png",
  desktop:
    "https://desktopfibra.com.br/wp-content/uploads/2024/01/logo-desktop-512x512-1-e1712845028629.png",
  alcans: "https://alcans.com.br/wp-content/uploads/2023/05/alcans_logo_alcans-1.svg",
} as const;

export const LOGOS_POR_SLUG: Record<string, string> = {
  claro: LOGOS_OPERADORAS_REMOTOS.claro,
  vero: LOGOS_OPERADORAS_REMOTOS.vero,
  desktop: LOGOS_OPERADORAS_REMOTOS.desktop,
  "desktop-fibra": LOGOS_OPERADORAS_REMOTOS.desktop,
  alcans: LOGOS_OPERADORAS_REMOTOS.alcans,
  algar: "", // logo da algar vem do admin
};

// prioriza logoUrl da operadora, cai pro map de slug se não tiver
export function getLogoUrl(operadora: {
  slug: string;
  logoUrl?: string | null;
}): string | null {
  if (operadora.logoUrl) return operadora.logoUrl;
  return LOGOS_POR_SLUG[operadora.slug] ?? null;
}
