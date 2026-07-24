"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BuscaCobertura } from "@/components/public/BuscaCobertura";
import { useScrollProgress, prefersReducedMotion, SCROLL_SPAN_VH } from "@/lib/hooks/useScrollProgress";

export type RocketBannerProps = {
  
  revealContent?: React.ReactNode;
};


const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  left: ((i * 13 + 7) % 98) + 1,
  top: ((i * 29 + 11) % 96) + 2,
  size: (i % 3) * 0.7 + 1,
  opacity: (i % 5) * 0.12 + 0.25,
}));

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function RocketBanner({ revealContent }: RocketBannerProps) {
  const revealRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const rocketLinkRef = useRef<HTMLAnchorElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useScrollProgress((p, raw) => {
    const pastEnd = raw >= 1;

    // Frente da névoa (0..100%): horizonte que sobe conforme o scroll.
    const fog = (1 - p) * 100;

    // Banner = céu sólido cuja parte ABAIXO da frente da névoa dissolve em alpha (máscara).
    // Sem recorte/V → sem "asas" diagonais cobrindo os cards. Os cards emergem da névoa.
    const maskA = (fog - 26).toFixed(1); // opaco acima disto
    const maskB = (fog + 6).toFixed(1); // transparente abaixo disto
    const mask = `linear-gradient(to bottom, #000 ${maskA}%, rgba(0,0,0,0) ${maskB}%)`;
    const bannerOpacity = clamp(1 - (p - 0.82) / 0.18, 0, 1); // limpeza final
    const banner = bannerRef.current;
    if (banner) {
      banner.style.display = !pastEnd && p < 1 ? "block" : "none";
      banner.style.opacity = String(bannerOpacity);
      banner.style.maskImage = mask;
      banner.style.webkitMaskImage = mask;
    }

    // Camada revelada (fixa, atrás): crossfade some um pouco antes do conteúdo em fluxo entrar.
    const reveal = revealRef.current;
    if (reveal) {
      const revealOpacity = pastEnd ? 0 : clamp(1 - (p - 0.45) / 0.3, 0, 1);
      reveal.style.display = !pastEnd && revealContent != null ? "block" : "none";
      reveal.style.opacity = String(revealOpacity);
    }

    // Título + busca: parallax para cima + fade rápido.
    const header = headerRef.current;
    if (header) {
      const headerOpacity = clamp(1 - p / 0.4, 0, 1);
      header.style.opacity = String(headerOpacity);
      header.style.transform = reduced ? "none" : `translate(-50%, calc(-50% - ${p * 60}px))`;
      header.style.pointerEvents = headerOpacity < 0.1 ? "none" : "auto";
    }

    // Estrelas: leve parallax.
    const stars = starsRef.current;
    if (stars) {
      stars.style.transform = reduced ? "none" : `translateY(${p * 30}px) scale(${1 + p * 0.05})`;
    }

    // Foguete: acompanha a frente da névoa subindo, mas NUNCA cai abaixo do repouso (76%)
    // → sem salto/flick no início do scroll. Na reta final acelera para fora (decolagem).
    const launch = Math.max(0, p - 0.78) / 0.22; // 0 → 1 nos últimos 22%
    const fogTrack = clamp(fog - 6 - launch * launch * 70, -18, 92);
    const rocketTopPct = Math.min(76, fogTrack);
    const rocket = rocketRef.current;
    if (rocket) {
      const rocketScale = 1 + p * 0.22;
      const rocketOpacity = clamp(1 - launch * 1.05, 0, 1);
      rocket.style.display = !pastEnd && rocketOpacity > 0 ? "block" : "none";
      rocket.style.top = `${rocketTopPct}%`;
      rocket.style.opacity = String(rocketOpacity);
      rocket.style.transform = `translate(-50%, -50%) rotate(-18deg) scale(${rocketScale})`;
    }

    // Pausa a flutuação (CSS) assim que o scroll começa: float + decolagem juntos = tremida.
    const rocketLink = rocketLinkRef.current;
    if (rocketLink) rocketLink.style.animation = !reduced && p < 0.02 ? "" : "none";

    // Rastro de propulsão: glow difuso atrás do foguete (só quando ele já está subindo).
    const trail = trailRef.current;
    if (trail) {
      const rising = rocketTopPct < 74; // só mostra quando saiu do repouso
      const trailOpacity = reduced || !rising ? 0 : clamp((p - 0.18) * 1.8, 0, 0.5) * clamp(1 - launch * 1.2, 0, 1);
      trail.style.display = !pastEnd && trailOpacity > 0 ? "block" : "none";
      trail.style.top = `${rocketTopPct + 5}%`;
      trail.style.opacity = String(trailOpacity);
      trail.style.transform = `translateX(-50%) scaleY(${1 + p * 3})`;
    }

    // Seta inicial: some assim que rola.
    const hint = hintRef.current;
    if (hint) hint.style.opacity = String(clamp(1 - p * 5, 0, 1));
  });

  return (
    <>
      {/* Spacer = janela de scroll da transição (casa com SCROLL_SPAN_VH). */}
      <div style={{ minHeight: `${SCROLL_SPAN_VH * 100}svh` }} aria-hidden="true" />

      {/* LAYER 0: conteúdo revelado por trás do V (fixo, não rola). */}
      {revealContent != null && (
        <div
          ref={revealRef}
          className="fixed inset-0 h-[100svh] w-full overflow-hidden"
          style={{ zIndex: 5 }}
          aria-hidden="true"
        >
          {revealContent}
        </div>
      )}

      {/* LAYER 1: banner (céu noturno). A névoa (máscara) dissolve o céu de baixo p/ cima. */}
      <div
        ref={bannerRef}
        className="fixed inset-0 h-[100svh] w-full overflow-hidden"
        style={{
          zIndex: 30,
          maskImage: "linear-gradient(to bottom, #000 74%, rgba(0,0,0,0) 106%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 74%, rgba(0,0,0,0) 106%)",
          background:
            "radial-gradient(120% 90% at 50% 0%, #1e3a8a 0%, #15265a 45%, #0c1733 100%)",
          willChange: "opacity",
        }}
      >
        <div ref={starsRef} className="absolute inset-0" style={{ willChange: "transform" }}>
          {STARS.map((s) => (
            <span
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
              }}
            />
          ))}
        </div>


        <div
          ref={headerRef}
          className="absolute left-1/2 top-[36%] w-full max-w-3xl px-4"
          style={{ zIndex: 5, transform: "translate(-50%, -50%)", willChange: "transform, opacity" }}
        >
          <h1 className="mb-6 text-center text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            Procure o melhor preço
            <br />
            disponível na sua região.
          </h1>
          <BuscaCobertura hideTitle />
        </div>
      </div>

      {/* LAYER 2: rastro de propulsão (atrás do foguete). */}
      <div
        ref={trailRef}
        className="fixed left-1/2 z-[35] pointer-events-none"
        style={{
          display: "none",
          width: "42px",
          height: "120px",
          transform: "translateX(-50%)",
          transformOrigin: "top center",
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(191,219,254,0.55), rgba(147,197,253,0.18) 45%, rgba(147,197,253,0) 75%)",
          filter: "blur(10px)",
          willChange: "transform, opacity, top",
        }}
        aria-hidden="true"
      />

      {/* LAYER 3: foguete (na frente da névoa). Clicável → home. */}
      <div
        ref={rocketRef}
        className="fixed left-1/2 z-[40]"
        style={{
          top: "76%",
          transform: "translate(-50%, -50%) rotate(-18deg)",
          willChange: "transform, top, opacity",
        }}
      >
        <Link
          ref={rocketLinkRef}
          href="/"
          className={`block rounded-lg transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 ${
            reduced ? "" : "animate-rocket-float"
          }`}
          aria-label="Ir para a página inicial"
        >
          <Image
            src="/rocket.webp"
            alt="Foguete"
            width={180}
            height={180}
            className="drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 0 28px rgba(147,197,253,0.45))", display: "block" }}
            priority
          />
        </Link>
      </div>

      {/* Seta "role para baixo". */}
      <div
        ref={hintRef}
        className="fixed bottom-6 left-1/2 z-[40] -translate-x-1/2 pointer-events-none"
        style={{ willChange: "opacity" }}
        aria-hidden="true"
      >
        <svg
          className={`h-9 w-9 text-white/80 drop-shadow-lg ${reduced ? "" : "animate-bounce"}`}
          style={{ animationDuration: "1.6s" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </>
  );
}
