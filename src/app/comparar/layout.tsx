import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparar Planos por CEP | MelhorPreço.net",
  description: "Compare planos de internet disponíveis no seu CEP. Veja preços, velocidades e operadoras com cobertura na sua região.",
  openGraph: {
    title: "Comparar Planos por CEP | MelhorPreço.net",
    description: "Compare planos de internet disponíveis no seu CEP. Contrate pelo WhatsApp.",
    type: "website",
  },
};

export default function CompararLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
