"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";


const FADE_START = 0.45;

const FADE_RANGE = 0.4;


export function ScrollRevealFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useScrollProgress((p) => {
    const el = ref.current;
    if (!el) return;
    const opacity = p < FADE_START ? 0 : p >= 1 ? 1 : (p - FADE_START) / FADE_RANGE;
    el.style.opacity = String(Math.min(1, opacity));
  });

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
