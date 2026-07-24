"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { HeroOverlay } from "./HeroOverlay";
import { HeroFallback } from "./HeroFallback";
import { hasWebGL } from "./webgl";
import {
  useScrollProgress,
  prefersReducedMotion,
  SCROLL_SPAN_VH,
} from "@/lib/hooks/useScrollProgress";

// Canvas 3D carregado só no cliente e em chunk separado (não pesa o resto do site).
const RocketScene = dynamic(
  () => import("./RocketScene").then((m) => m.RocketScene),
  { ssr: false },
);

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}


function isCompactViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}


export function RocketHero() {
  const [mode, setMode] = useState<"static" | "3d">("static");
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState(true);

  const activeRef = useRef(true);
  const progressRef = useRef(0);
  const boostRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // Decide o modo no cliente (evita mismatch de hidratação: SSR sempre estático).
  useEffect(() => {
    const syncCompact = () => setCompact(isCompactViewport());
    syncCompact();

    if (prefersReducedMotion()) return;
    if (!hasWebGL()) return;
    setMode("3d");

    window.addEventListener("resize", syncCompact, { passive: true });
    return () => window.removeEventListener("resize", syncCompact);
  }, []);

  useScrollProgress((p, raw) => {
    progressRef.current = p;

    const overlay = overlayRef.current;
    if (overlay) {
      const op = clamp(1 - p / 0.42, 0, 1);
      overlay.style.opacity = String(op);
      overlay.style.transform = `translate(-50%, calc(-50% - ${p * 70}px))`;
      overlay.style.pointerEvents = op < 0.1 ? "none" : "auto";
    }

    const container = containerRef.current;
    if (container) {
      const visible = raw < 1;
      container.style.opacity = visible ? String(clamp(1 - (p - 0.84) / 0.16, 0, 1)) : "0";
      container.style.visibility = visible ? "visible" : "hidden";
      container.style.pointerEvents = visible && p < 0.95 ? "auto" : "none";
    }

    const hint = hintRef.current;
    if (hint) hint.style.opacity = String(clamp(1 - p * 5, 0, 1));

    // Pausa o render do canvas quando o hero sai de tela (economia de GPU).
    const shouldActive = raw < 1.001;
    if (shouldActive !== activeRef.current) {
      activeRef.current = shouldActive;
      setActive(shouldActive);
    }
  });

  // "Acende" a chama quando qualquer campo do overlay (CEP) recebe foco.
  useEffect(() => {
    if (mode !== "3d") return;
    const el = overlayRef.current;
    if (!el) return;
    const on = () => {
      boostRef.current = 1;
    };
    const off = () => {
      boostRef.current = 0;
    };
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
    };
  }, [mode]);

  if (mode === "static") {
    return <HeroFallback />;
  }

  return (
    <>
      {/* Janela de scroll da narrativa do hero. */}
      <div style={{ minHeight: `${SCROLL_SPAN_VH * 100}svh` }} aria-hidden="true" />

      <div
        ref={containerRef}
        className="fixed inset-0 h-[100svh] w-full overflow-hidden"
        style={{ zIndex: 30, willChange: "opacity", background: "#070b1c" }}
      >
        {/* Cena 3D (fundo) — mantida montada para o hero voltar ao rolar pra cima */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <RocketScene progress={progressRef} boost={boostRef} active={active} compact={compact} />
        </div>

        {/* Overlay HTML: título + busca, sempre usável */}
        <div
          ref={overlayRef}
          className="absolute left-1/2 top-[36%] flex w-full max-w-3xl justify-center sm:top-[40%] md:top-[42%]"
          style={{
            zIndex: 10,
            transform: "translate(-50%, -50%)",
            willChange: "transform, opacity",
          }}
        >
          <HeroOverlay />
        </div>

        {/* Seta "role para baixo" */}
        <div
          ref={hintRef}
          className="absolute bottom-6 left-1/2 z-[20] -translate-x-1/2 pointer-events-none"
          aria-hidden="true"
        >
          <svg
            className="h-9 w-9 text-white/80 drop-shadow-lg animate-bounce"
            style={{ animationDuration: "1.6s" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </>
  );
}
