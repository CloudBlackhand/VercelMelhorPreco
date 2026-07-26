export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OperadorasPorCidade } from "@/components/admin/OperadorasPorCidade";

export default async function OperadorasPorCidadePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Operadoras por cidade</h1>
            <p className="text-muted-foreground">
              Defina quais operadoras (do banco) aparecem em cada cidade na busca por CEP, mesmo sem cobertura KML. Tudo salvo no banco.
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Voltar ao painel</Button>
          </Link>
        </div>

        <OperadorasPorCidade />
      </div>
    </div>
  );
}
