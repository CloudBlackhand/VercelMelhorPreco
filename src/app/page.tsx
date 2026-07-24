import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlanosDestaque } from "@/components/public/PlanosDestaque";
import { RocketHero } from "@/components/public/hero3d/RocketHero";
import { SpeedTestSection } from "@/components/public/SpeedTestSection";
import { FaqSection } from "@/components/public/FaqSection";
import { TrustSection } from "@/components/public/TrustSection";
import { CosmicSection } from "@/components/public/cosmic/CosmicSection";
import { SectionHeader } from "@/components/public/cosmic/SectionHeader";

export const metadata: Metadata = {
  title: "MelhorPreço.net - Compare Planos de Internet",
  description: "Encontre o melhor plano de internet para sua região. Digite seu CEP, compare preços e velocidades e contrate direto com a operadora.",
  openGraph: {
    title: "MelhorPreço.net - Compare Planos de Internet",
    description: "Encontre o melhor plano de internet para sua região. Compare preços e contrate pelo WhatsApp.",
    type: "website",
  },
};

const INFO_CARDS = [
  {
    iconBg: "rgba(147, 197, 253, 0.15)",
    iconColor: "#93c5fd",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: "Compare Preços",
    desc: "Compare planos de diferentes operadoras e encontre o melhor preço para você",
  },
  {
    iconBg: "rgba(74, 222, 128, 0.12)",
    iconColor: "#4ade80",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    title: "Verifique Cobertura",
    desc: "Veja quais operadoras têm cobertura na sua região antes de contratar",
  },
  {
    iconBg: "rgba(192, 132, 252, 0.12)",
    iconColor: "#c084fc",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    title: "Alta Velocidade",
    desc: "Encontre planos de fibra óptica com velocidades de até 1 Gbps",
  },
] as const;

const STATS = [
  { value: "100+", label: "Planos Disponíveis" },
  { value: "50+", label: "Cidades Cobertas" },
  { value: "10+", label: "Operadoras" },
  { value: "24/7", label: "Suporte" },
] as const;

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--cosmos-bg)", margin: 0, padding: 0 }}>
      <RocketHero />

      {/* Planos — mesmo fundo do hero para handoff suave */}
      <CosmicSection maxWidth="7xl" className="pt-16">
        <PlanosDestaque />
      </CosmicSection>

      {/* Speed test */}
      <CosmicSection id="speedtest" maxWidth="2xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow mb-2">
              <span aria-hidden="true">✦</span> Meça sua velocidade
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[var(--cosmos-text)]">
              Teste sua <span className="text-brand-gradient">conexão</span>
            </h2>
            <p className="text-[var(--cosmos-muted)] mt-1">Medição de ping, download e upload</p>
          </div>
          <Link
            href="/speedtest"
            className="text-sm font-medium text-[var(--cosmos-accent)] hover:text-white transition-colors shrink-0"
          >
            Abrir página do speed test →
          </Link>
        </div>
        <SpeedTestSection />
      </CosmicSection>

      <TrustSection />
      <FaqSection id="faq" />

      {/* Como ajudamos */}
      <CosmicSection>
        <SectionHeader
          eyebrow="Como ajudamos"
          title="Tudo para você"
          highlight="decolar"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INFO_CARDS.map((card) => (
            <div key={card.title} className="cosmic-card hover-lift text-center p-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ backgroundColor: card.iconBg }}
              >
                <svg className="w-8 h-8" style={{ color: card.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--cosmos-text)] mb-2">{card.title}</h3>
              <p className="text-[var(--cosmos-muted)]">{card.desc}</p>
            </div>
          ))}
        </div>
      </CosmicSection>

      {/* Estatísticas — gradiente cósmico + foguete */}
      <CosmicSection gradient stars={false}>
        <div className="cosmic-stars pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-2 top-6 opacity-90 sm:right-8 animate-rocket-float" aria-hidden="true">
          <Image
            src="/rocket.webp"
            alt=""
            width={72}
            height={72}
            className="drop-shadow-[0_0_18px_rgba(147,197,253,0.45)]"
          />
        </div>
        <SectionHeader
          light
          eyebrow="Confiança que voa alto"
          title="Milhares já encontraram seu plano ideal"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-[0_0_14px_rgba(147,197,253,0.4)]">
                {s.value}
              </div>
              <div className="text-blue-200 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </CosmicSection>
    </main>
  );
}
