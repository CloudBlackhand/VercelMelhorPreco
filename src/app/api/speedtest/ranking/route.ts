import { NextResponse } from "next/server";
import { getOperadorasFromConfig } from "@/config/operadoras-planos";
import { getOperadoraRankingOverrides, getOperadoraAtivoOverrides } from "@/lib/operadora-ranking";

const TOP_N = 10;


export async function GET() {
  try {
    const [rankingOverrides, ativoOverrides] = await Promise.all([
      getOperadoraRankingOverrides(),
      getOperadoraAtivoOverrides(),
    ]);
    const operadoras = getOperadorasFromConfig(rankingOverrides, ativoOverrides)
      .filter((o) => o.ativo)
      .sort((a, b) => (a.ordemRecomendacao ?? 999) - (b.ordemRecomendacao ?? 999))
      .slice(0, TOP_N)
      .map((o, index) => ({
        posicao: index + 1,
        id: o.id,
        nome: o.nome,
        slug: o.slug,
        logoUrl: o.logoUrl,
      }));

    return NextResponse.json(operadoras);
  } catch (error) {
    console.error("Error fetching speedtest ranking:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ranking" },
      { status: 500 }
    );
  }
}
