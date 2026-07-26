import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlanosList } from "@/components/admin/PlanosList";

export default async function PlanosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Planos</h1>
          <p className="text-muted-foreground">Planos definidos no config do sistema (somente leitura)</p>
        </div>

        <PlanosList />
      </div>
    </div>
  );
}


