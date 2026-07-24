"use client";

import { CosmicSection } from "@/components/public/cosmic/CosmicSection";
import { SectionHeader } from "@/components/public/cosmic/SectionHeader";

export function TrustSection() {
  const depoimentos = [
    {
      texto: "Encontrei o plano ideal pelo CEP. Em dois dias a internet estava instalada.",
      autor: "Cliente, Ribeirão Preto",
    },
    {
      texto: "Comparação rápida e sem complicação. Recomendo.",
      autor: "Cliente, região de Campinas",
    },
  ];

  const selos = [
    "Comparação gratuita",
    "Dados de cobertura oficiais",
    "Contato direto com a operadora",
  ];

  return (
    <CosmicSection maxWidth="6xl">
      <SectionHeader
        eyebrow="Prova social"
        title="Quem comparou"
        highlight="recomenda"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {depoimentos.map((d, i) => (
          <blockquote key={i} className="cosmic-card hover-lift p-6">
            <p className="text-[var(--cosmos-text)] mb-3">&ldquo;{d.texto}&rdquo;</p>
            <cite className="text-sm text-[var(--cosmos-muted)] not-italic">{d.autor}</cite>
          </blockquote>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {selos.map((selo) => (
          <div
            key={selo}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--cosmos-border)] bg-white/5 px-4 py-2 text-sm font-medium text-[var(--cosmos-text)]"
          >
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {selo}
          </div>
        ))}
      </div>
    </CosmicSection>
  );
}
