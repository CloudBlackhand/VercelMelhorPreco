import { NextRequest, NextResponse } from "next/server";
import { getOperadorasFromConfig } from "@/config/operadoras-planos";
import { getOperadoraRankingOverrides, getOperadoraAtivoOverrides } from "@/lib/operadora-ranking";

export const dynamic = "force-dynamic";

// lista operadoras do config; ordem e ativo vêm do admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ativo = searchParams.get("ativo");

    const [rankingOverrides, ativoOverrides] = await Promise.all([
      getOperadoraRankingOverrides(),
      getOperadoraAtivoOverrides(),
    ]);
    let operadoras = getOperadorasFromConfig(rankingOverrides, ativoOverrides);
    if (ativo === "true") operadoras = operadoras.filter((o) => o.ativo);
    if (ativo === "false") operadoras = operadoras.filter((o) => !o.ativo);

    return NextResponse.json(operadoras);
  } catch (error) {
    console.error("Error fetching operadoras:", error);
    return NextResponse.json(
      { error: "Erro ao buscar operadoras" },
      { status: 500 }
    );
  }
}


