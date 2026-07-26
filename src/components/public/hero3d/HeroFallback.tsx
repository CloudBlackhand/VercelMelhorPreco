"use client";

import Image from "next/image";
import { HeroOverlay } from "./HeroOverlay";


const STARS = Array.from({ length: 220 }, (_, i) => ({
  id: i,
  left: ((i * 13 + 7) % 98) + 1,
  top: ((i * 29 + 11) % 96) + 2,
  size: (i % 4) * 0.65 + 1,
  opacity: (i % 5) * 0.12 + 0.28,
}));


export function HeroFallback() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: "#070b1c" }}
    >
      <div className="cosmic-stars pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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

      <div className="relative z-10 mb-8 animate-rocket-float">
        <Image
          src="/rocket.webp"
          alt="Foguete"
          width={150}
          height={150}
          className="drop-shadow-2xl"
          style={{ filter: "drop-shadow(0 0 28px rgba(147,197,253,0.45))" }}
          priority
        />
      </div>

      <div className="relative z-10 flex w-full justify-center">
        <HeroOverlay />
      </div>
    </section>
  );
}
