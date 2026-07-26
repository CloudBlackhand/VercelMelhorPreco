export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TagsPlanoCidade } from "@/components/admin/TagsPlanoCidade";

export default async function TagsPlanoCidadePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tags por plano e cidade</h1>
            <p className="text-muted-foreground">
              Defina tags (ex.: &quot;Mais Popular&quot;, &quot;Recomendado&quot;) para um plano em cidades específicas. Planos do banco ou do config (Desktop, Vero). Tudo salvo no banco.
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Voltar ao painel</Button>
          </Link>
        </div>

        <TagsPlanoCidade />
      </div>
    </div>
  );
}
