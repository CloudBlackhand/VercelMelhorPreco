import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { SpeedTestSection } from "@/components/public/SpeedTestSection";
import { SpeedTestRanking } from "@/components/public/SpeedTestRanking";
import { CosmicSection } from "@/components/public/cosmic/CosmicSection";

export const metadata: Metadata = {
  title: "Teste de Velocidade | MelhorPreço.net",
  description: "Teste a velocidade da sua internet: ping, download e upload. Compare com os planos disponíveis na sua região.",
  openGraph: {
    title: "Teste de Velocidade | MelhorPreço.net",
    description: "Teste sua conexão e compare com os planos da sua região.",
    type: "website",
  },
};

export default function SpeedTestPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cosmos-bg)" }}>
      <PublicHeader />
      <CosmicSection maxWidth="2xl" className="pt-[72px] md:pt-[80px]">
        <div className="mb-8">
          <span className="eyebrow mb-2">
            <span aria-hidden="true">✦</span> Meça sua velocidade
          </span>
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-[var(--cosmos-text)]">
            Teste sua <span className="text-brand-gradient">conexão</span>
          </h1>
          <p className="text-[var(--cosmos-muted)] text-sm md:text-base mt-2">
            Veja a velocidade da sua internet antes de comparar planos na sua região.
          </p>
        </div>
        <SpeedTestSection />
        <div className="mt-10">
          <SpeedTestRanking />
        </div>
      </CosmicSection>
    </div>
  );
}
