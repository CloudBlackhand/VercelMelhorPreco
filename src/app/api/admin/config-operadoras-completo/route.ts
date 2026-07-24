import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { OPERADORAS_PLANOS } from "@/config/operadoras-planos";


export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const list = OPERADORAS_PLANOS.map((op) => ({
    slug: op.slug,
    nome: op.nome,
    planos: op.planos.map((p) => ({ nome: p.nome })),
  }));
  return NextResponse.json(list);
}
