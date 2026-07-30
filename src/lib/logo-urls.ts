export const LOGOS_OPERADORAS_SVG = {} as const;

export const LOGOS_OPERADORAS_PNG = {} as const;

export const LOGOS_OPERADORAS_REMOTOS = {
  claro: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Claro.svg",
  vero: "https://verovideo.com.br/images/vero/logo-sem-slogan.png",
  desktop:
    "https://desktopfibra.com.br/wp-content/uploads/2024/01/logo-desktop-512x512-1-e1712845028629.png",
  alcans: "https://alcans.com.br/wp-content/uploads/2023/05/alcans_logo_alcans-1.svg",
  vivo: "https://www.logo.wine/a/logo/Vivo_(technology_company)/Vivo_(technology_company)-Logo.wine.svg",
  algar: "https://www.logo.wine/a/logo/Algar_Telecom/Algar_Telecom-Logo.wine.svg",
  oi: "https://www.logo.wine/a/logo/Oi_(telecommunications)/Oi_(telecommunications)-Logo.wine.svg",
  tim: "https://www.logo.wine/a/logo/Tim_(Brazil)/Tim_(Brazil)-Logo.wine.svg",
} as const;

export const LOGOS_POR_SLUG: Record<string, string> = {
  claro: LOGOS_OPERADORAS_REMOTOS.claro,
  vero: LOGOS_OPERADORAS_REMOTOS.vero,
  desktop: LOGOS_OPERADORAS_REMOTOS.desktop,
  "desktop-fibra": LOGOS_OPERADORAS_REMOTOS.desktop,
  alcans: LOGOS_OPERADORAS_REMOTOS.alcans,
  vivo: LOGOS_OPERADORAS_REMOTOS.vivo,
  algar: LOGOS_OPERADORAS_REMOTOS.algar,
  oi: LOGOS_OPERADORAS_REMOTOS.oi,
  tim: LOGOS_OPERADORAS_REMOTOS.tim,
};

// prioriza logoUrl da operadora, cai pro map de slug se não tiver
export function getLogoUrl(operadora: {
  slug: string;
  logoUrl?: string | null;
}): string | null {
  if (operadora.logoUrl) return operadora.logoUrl;
  return LOGOS_POR_SLUG[operadora.slug] ?? null;
}
