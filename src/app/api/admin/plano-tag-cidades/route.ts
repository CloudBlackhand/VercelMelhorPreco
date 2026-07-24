import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  planoId: z.string().nullable().optional(),
  operadoraSlug: z.string().nullable().optional(),
  planoIndex: z.number().int().min(0).nullable().optional(),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().max(2).nullable().optional(),
  tag: z.string().min(1, "Tag é obrigatória"),
}).refine(
  (data) => (data.planoId != null) || (data.operadoraSlug != null && data.planoIndex != null),
  { message: "Informe planoId (plano do banco) ou operadoraSlug + planoIndex (plano do config)" }
);


export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const cidade = searchParams.get("cidade");
    const planoId = searchParams.get("planoId");

    const list = await prisma.planoTagCidade.findMany({
      where: {
        ...(cidade ? { cidade: { equals: cidade, mode: "insensitive" } } : {}),
        ...(planoId ? { planoId } : {}),
      },
      include: { plano: { include: { operadora: true } } },
      orderBy: [{ cidade: "asc" }, { estado: "asc" }, { tag: "asc" }],
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error listing plano-tag-cidades:", error);
    return NextResponse.json(
      { error: "Erro ao listar tags por plano/cidade" },
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

    if (data.planoId) {
      const plano = await prisma.plano.findUnique({
        where: { id: data.planoId },
      });
      if (!plano) {
        return NextResponse.json(
          { error: "Plano não encontrado" },
          { status: 404 }
        );
      }
    }

    const created = await prisma.planoTagCidade.create({
      data: {
        planoId: data.planoId ?? null,
        operadoraSlug: data.operadoraSlug?.trim().toLowerCase() ?? null,
        planoIndex: data.planoIndex ?? null,
        cidade: data.cidade.trim(),
        estado: data.estado?.trim() || null,
        tag: data.tag.trim(),
      },
      include: { plano: { include: { operadora: true } } },
    });

    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error creating plano-tag-cidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar tag" },
      { status: 500 }
    );
  }
}
