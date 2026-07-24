import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export interface TrackingData {
  ip?: string;
  userAgent?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
}

export interface EventData {
  tipo: string; // page_view, click, search_cep, view_plan...
  pagina?: string;
  elemento?: string;
  dados?: Record<string, any>;
}

export function extractTrackingData(request: Request): TrackingData {
  // parsing de header, provavelmente da pra fazer melhor
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const referer = headersList.get("referer") || undefined;
  const ip = 
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    undefined;

  const url = new URL(request.url);
  const utmSource = url.searchParams.get("utm_source") || undefined;
  const utmMedium = url.searchParams.get("utm_medium") || undefined;
  const utmCampaign = url.searchParams.get("utm_campaign") || undefined;
  const utmContent = url.searchParams.get("utm_content") || undefined;

  let refererDomain: string | undefined;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      refererDomain = refererUrl.hostname;
    } catch {
      refererDomain = referer;
    }
  }

  const device = detectDevice(userAgent);
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);

  return {
    ip,
    userAgent,
    referer: refererDomain,
    utmSource: utmSource || extractSourceFromReferer(refererDomain),
    utmMedium,
    utmCampaign,
    utmContent,
    device,
    browser,
    os,
  };
}

function detectDevice(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function detectBrowser(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Other";
}

function detectOS(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  return "Other";
}

function extractSourceFromReferer(referer?: string): string | undefined {
  if (!referer) return "direct";

  const domain = referer.toLowerCase();

  if (domain.includes("google.com") || domain.includes("google.")) {
    return "google";
  }
  if (domain.includes("facebook.com") || domain.includes("fb.com")) {
    return "facebook";
  }
  if (domain.includes("instagram.com")) {
    return "instagram";
  }
  if (domain.includes("twitter.com") || domain.includes("x.com")) {
    return "twitter";
  }
  if (domain.includes("linkedin.com")) {
    return "linkedin";
  }
  if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
    return "youtube";
  }
  if (domain.includes("bing.com")) {
    return "bing";
  }
  if (domain.includes("yahoo.com")) {
    return "yahoo";
  }

  return "referral";
}

export function getOrCreateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function trackVisit(data: TrackingData, sessionId: string) {
  try {
    await prisma.visitante.create({
      data: {
        ipAddress: data.ip,
        userAgent: data.userAgent,
        referer: data.referer,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        cidade: data.city,
        sessionId,
      },
    });
  } catch (error) {
    // tracking não pode derrubar a aplicação
    console.error("Error tracking visit:", error);
  }
}

export async function trackEvent(
  sessionId: string,
  eventData: EventData
) {
  try {
    const visitante = await prisma.visitante.findFirst({
      where: { sessionId },
      orderBy: { lastVisit: "desc" },
    });

    if (!visitante) {
      console.warn(`Visitante não encontrado para sessionId: ${sessionId}`);
      return;
    }

    await prisma.evento.create({
      data: {
        visitanteId: visitante.id,
        tipo: eventData.tipo,
        acao: eventData.pagina,
        url: eventData.pagina,
        elemento: eventData.elemento,
        metadata: eventData.dados || {},
      },
    });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}
