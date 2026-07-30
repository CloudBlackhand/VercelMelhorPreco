"use client";

import { useState } from "react";
import { getLogoUrl } from "@/lib/logo-urls";

interface LogoImageProps {
  nome: string;
  slug: string;
  logoUrl?: string | null;
  containerClassName?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

export function LogoImage({
  nome,
  slug,
  logoUrl,
  containerClassName = "",
  imgClassName = "",
  fallbackClassName = "",
}: LogoImageProps) {
  const [errored, setErrored] = useState(false);
  const url = getLogoUrl({ slug, logoUrl });

  if (!url || errored) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-white/10 text-white font-bold ${fallbackClassName}`}
        title={nome}
      >
        {nome.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${containerClassName}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={nome}
        className={`object-contain ${imgClassName}`}
        onError={() => setErrored(true)}
        loading="lazy"
      />
    </div>
  );
}
