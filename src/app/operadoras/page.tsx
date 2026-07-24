"use client";

import { PublicHeader } from "@/components/public/PublicHeader";
import { CosmicSection } from "@/components/public/cosmic/CosmicSection";
import { SectionHeader } from "@/components/public/cosmic/SectionHeader";
import { OperadorasCatalog } from "@/components/public/OperadorasCatalog";

export default function OperadorasPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cosmos-bg)" }}>
      <PublicHeader />
      <CosmicSection maxWidth="7xl" className="pt-[72px] md:pt-[80px]">
        <SectionHeader
          align="left"
          eyebrow="Catálogo"
          title="Planos por"
          highlight="operadora"
          subtitle="Compare velocidades, preços e benefícios. Clique em Contratar para falar direto com a operadora pelo WhatsApp."
        />
        <OperadorasCatalog />
      </CosmicSection>
    </div>
  );
}
