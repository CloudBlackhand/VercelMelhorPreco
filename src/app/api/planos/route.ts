import { NextRequest, NextResponse } from "next/server";
import { getPlanosFromConfig } from "@/config/operadoras-planos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const operadoraId = searchParams.get("operadoraId") ?? undefined;
    const ativo = searchParams.get("ativo");

    let planos = getPlanosFromConfig(operadoraId || undefined);
    if (ativo === "true") planos = planos.filter((p) => p.ativo);
    if (ativo === "false") planos = planos.filter((p) => !p.ativo);

    return NextResponse.json(planos);
  } catch (error) {
    console.error("Error fetching planos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar planos" },
      { status: 500 }
    );
  }
}


