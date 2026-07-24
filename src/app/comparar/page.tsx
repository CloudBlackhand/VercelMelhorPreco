"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ComparadorPlanos } from "../../components/public/ComparadorPlanos";
import { BuscaCobertura } from "../../components/public/BuscaCobertura";
import { PublicHeader } from "../../components/public/PublicHeader";
import { CosmicSection } from "@/components/public/cosmic/CosmicSection";

function CompararContent() {
  const searchParams = useSearchParams();
  const cep = searchParams.get("cep");

  if (!cep) {
    return (
      <div className="min-h-screen" style={{ background: "var(--cosmos-bg)" }}>
        <PublicHeader />
        <CosmicSection maxWidth="3xl" className="pt-[72px] md:pt-[80px]">
          <BuscaCobertura />
        </CosmicSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cosmos-bg)" }}>
      <PublicHeader />
      <CosmicSection maxWidth="7xl" className="pt-[72px] md:pt-[80px]">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--cosmos-text)] mb-6">
          Planos <span className="text-brand-gradient">Disponíveis</span>
        </h1>
        <ComparadorPlanos cep={cep} />
      </CosmicSection>
    </div>
  );
}

export default function CompararPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cosmos-bg)" }}>
          <p className="text-[var(--cosmos-muted)]">Carregando...</p>
        </div>
      }
    >
      <CompararContent />
    </Suspense>
  );
}
