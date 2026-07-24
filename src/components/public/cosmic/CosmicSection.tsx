import type { ReactNode } from "react";

interface CosmicSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  
  stars?: boolean;
  
  gradient?: boolean;
  maxWidth?: "3xl" | "6xl" | "7xl" | "2xl";
}

const MAX_W = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;


export function CosmicSection({
  children,
  id,
  className = "",
  stars = true,
  gradient = false,
  maxWidth = "7xl",
}: CosmicSectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-16 px-4 scroll-mt-4 ${className}`}
      style={{
        background: gradient
          ? "linear-gradient(160deg, #070b1c 0%, #0c1733 45%, #1e3a8a 100%)"
          : "var(--cosmos-bg)",
      }}
    >
      {stars && (
        <div className="cosmic-stars pointer-events-none absolute inset-0" aria-hidden="true" />
      )}
      <div className={`relative mx-auto ${MAX_W[maxWidth]}`}>{children}</div>
    </section>
  );
}
