"use client";

import { useState } from "react";
import { CosmicSection } from "@/components/public/cosmic/CosmicSection";
import { SectionHeader } from "@/components/public/cosmic/SectionHeader";

const FAQ_ITEMS = [
  {
    pergunta: "Como funciona?",
    resposta:
      "Digite seu CEP no topo da página. Mostramos apenas os planos das operadoras que têm cobertura na sua região. Você compara preços e velocidades e entra em contato direto com a operadora pelo WhatsApp para contratar.",
  },
  {
    pergunta: "O que acontece depois que clico em Contratar?",
    resposta:
      "O botão abre uma conversa no WhatsApp com a operadora já com os dados do plano preenchidos. A operadora confirma a disponibilidade no seu endereço e agenda a instalação. O processo e os prazos variam por operadora.",
  },
  {
    pergunta: "Posso mudar de plano depois?",
    resposta:
      "Sim. As operadoras costumam permitir upgrade ou downgrade de plano. Consulte a operadora pelo WhatsApp ou no site dela para as regras e possíveis fidelidades.",
  },
  {
    pergunta: "Como é a instalação?",
    resposta:
      "Após a contratação, a operadora agenda a visita técnica. Na maioria dos casos a instalação é feita em um dia e o técnico leva o equipamento (modem/roteador). Consulte com a operadora se há custo de instalação.",
  },
];

export function FaqSection({ id }: { id?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <CosmicSection id={id ?? "faq"} maxWidth="3xl">
      <SectionHeader
        eyebrow="Tire suas dúvidas"
        title="Perguntas"
        highlight="frequentes"
      />
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <div
            key={index}
            className="cosmic-card overflow-hidden !rounded-xl"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left font-medium text-[var(--cosmos-text)] hover:bg-white/5 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span>{item.pergunta}</span>
              <svg
                className={`w-5 h-5 flex-shrink-0 text-[var(--cosmos-accent)] transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 pt-0 text-[var(--cosmos-muted)] text-sm leading-relaxed border-t border-[var(--cosmos-border)]">
                {item.resposta}
              </div>
            )}
          </div>
        ))}
      </div>
    </CosmicSection>
  );
}
