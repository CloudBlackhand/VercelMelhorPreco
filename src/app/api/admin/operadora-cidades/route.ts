import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { OPERADORAS_PLANOS } from "@/config/operadoras-planos";
import { z } from "zod";

const CreateSchema = z.object({
  operadoraSlug: z.string().min(1, "Operadora é obrigatória"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().max(2).nullable().optional(),
  ordem: z.number().int().min(0).optional(),
});

function operadoraFromSlug(slug: string): { nome: string; slug: string } | null {
  const op = OPERADORAS_PLANOS.find((o) => o.slug.toLowerCase() === slug.toLowerCase());
  return op ? { nome: op.nome, slug: op.slug } : null;
}


export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const cidade = searchParams.get("cidade");
    const estado = searchParams.get("estado");

    const list = await prisma.operadoraCidade.findMany({
      where: {
        ...(cidade ? { cidade: { equals: cidade, mode: "insensitive" } } : {}),
        ...(estado ? { estado: { equals: estado, mode: "insensitive" } } : {}),
      },
      orderBy: [{ cidade: "asc" }, { estado: "asc" }, { ordem: "asc" }],
    });

    const withOperadora = list.map((row) => ({
      ...row,
      operadora: operadoraFromSlug(row.operadoraSlug),
    }));

    return NextResponse.json(withOperadora);
  } catch (error) {
    console.error("Error listing operadora-cidades:", error);
    return NextResponse.json(
      { error: "Erro ao listar operadoras por cidade" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = CreateSchema.parse(body);

    const slugNorm = data.operadoraSlug.trim().toLowerCase();
    const op = OPERADORAS_PLANOS.find((o) => o.slug.toLowerCase() === slugNorm);
    if (!op) {
      return NextResponse.json(
        { error: "Operadora não encontrada no config. Use o slug de uma operadora do sistema (ex.: desktop, vero)." },
        { status: 404 }
      );
    }

    const created = await prisma.operadoraCidade.create({
      data: {
        operadoraSlug: op.slug,
        cidade: data.cidade.trim(),
        estado: data.estado?.trim() || null,
        ordem: data.ordem ?? 0,
      },
    });

    return NextResponse.json({
      ...created,
      operadora: { nome: op.nome, slug: op.slug },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error creating operadora-cidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar vínculo operadora-cidade" },
      { status: 500 }
    );
  }
}
