import { NextRequest, NextResponse } from "next/server";
import { getOperadoraByIdFromConfig } from "@/config/operadoras-planos";
import {
  getOperadoraRankingOverrides,
  getOperadoraAtivoOverrides,
  setOperadoraOrdemBySlug,
  setOperadoraAtivoBySlug,
} from "@/lib/operadora-ranking";
import { requireAdmin } from "@/lib/auth/middleware";
import { z } from "zod";

const UpdateOperadoraSchema = z.object({
  ordemRecomendacao: z.number().int().min(0).nullable().optional(),
  ativo: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rankingOverrides, ativoOverrides] = await Promise.all([
      getOperadoraRankingOverrides(),
      getOperadoraAtivoOverrides(),
    ]);
    const operadora = getOperadoraByIdFromConfig(params.id, rankingOverrides, ativoOverrides);

    if (!operadora) {
      return NextResponse.json({ error: "Operadora não encontrada" }, { status: 404 });
    }

    return NextResponse.json(operadora);
  } catch (error) {
    console.error("Error fetching operadora:", error);
    return NextResponse.json(
      { error: "Erro ao buscar operadora" },
      { status: 500 }
    );
  }
}

// só ordem e ativo são editáveis, o resto vem do config
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    if (!params.id.startsWith("config-")) {
      return NextResponse.json({ error: "ID de operadora inválido" }, { status: 400 });
    }
    const slug = params.id.replace(/^config-/, "");
    const body = await request.json();
    const data = UpdateOperadoraSchema.parse(body);

    if (data.ordemRecomendacao !== undefined) {
      await setOperadoraOrdemBySlug(slug, data.ordemRecomendacao);
    }
    if (data.ativo !== undefined) {
      await setOperadoraAtivoBySlug(slug, data.ativo);
    }

    const [rankingOverrides, ativoOverrides] = await Promise.all([
      getOperadoraRankingOverrides(),
      getOperadoraAtivoOverrides(),
    ]);
    const operadora = getOperadoraByIdFromConfig(params.id, rankingOverrides, ativoOverrides);
    return NextResponse.json(operadora!);
  } catch (error) {
    console.error("Error updating operadora:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar operadora" },
      { status: 500 }
    );
  }
}


