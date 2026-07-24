import { BuscaCobertura } from "@/components/public/BuscaCobertura";


export function HeroOverlay() {
  return (
    <div className="w-full max-w-3xl px-4" style={{ pointerEvents: "none" }}>
      <h1 className="mb-4 text-center text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
        Procure o melhor preço
        <br />
        disponível na sua região.
      </h1>
      <div style={{ pointerEvents: "auto" }}>
        <BuscaCobertura hideTitle />
      </div>
    </div>
  );
}
