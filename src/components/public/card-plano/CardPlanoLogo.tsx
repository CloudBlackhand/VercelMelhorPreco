"use client";

import { LogoImage } from "@/components/public/LogoImage";

interface CardPlanoLogoProps {
  operadora: {
    nome: string;
    slug: string;
    logoUrl?: string | null;
  };
  className?: string;
}

export function CardPlanoLogo({ operadora, className = "" }: CardPlanoLogoProps) {
  const isDesktopLogo = operadora.slug === "desktop" || operadora.slug === "desktop-fibra";

  return (
    <div className={`mb-6 flex items-center justify-center h-16 ${className}`}>
      <div
        className={
          isDesktopLogo
            ? "flex items-center justify-center rounded-lg bg-red-600 p-2"
            : "inline-flex items-center justify-center"
        }
      >
        <LogoImage
          nome={operadora.nome}
          slug={operadora.slug}
          logoUrl={operadora.logoUrl}
          containerClassName="w-[140px] h-12"
          imgClassName="max-h-12 w-auto"
          fallbackClassName="w-[140px] h-12 text-lg rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-6"
        />
      </div>
    </div>
  );
}
