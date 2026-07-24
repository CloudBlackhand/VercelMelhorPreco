import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planos por Operadora | MelhorPreço.net",
  description:
    "Veja todos os planos de internet por operadora: fibra óptica, velocidades e preços. Compare e contrate pelo seu CEP.",
  openGraph: {
    title: "Planos por Operadora | MelhorPreço.net",
    description: "Catálogo de planos de internet por operadora. Compare preços e contrate pelo WhatsApp.",
    type: "website",
  },
};

export default function OperadorasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
