import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Ranking das operadoras, CEPs mais procurados e analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ordem das operadoras</CardTitle>
              <CardDescription>Defina qual operadora aparece primeiro na busca por CEP</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/ordem">
                <Button className="w-full">Definir ordem</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CEPs mais procurados</CardTitle>
              <CardDescription>Ver buscas por CEP e regiões mais consultadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics#ceps">
                <Button className="w-full">Ver CEPs e Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operadoras</CardTitle>
              <CardDescription>Lista de operadoras (config do sistema)</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/operadoras">
                <Button className="w-full" variant="outline">Ver operadoras</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Visitantes, buscas e CEPs mais procurados</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full" variant="outline">Ver Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operadoras por cidade</CardTitle>
              <CardDescription>Exibir operadoras do banco (ex.: Claro, Vivo) por cidade na busca por CEP</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/operadoras-por-cidade">
                <Button className="w-full" variant="outline">Configurar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags por plano e cidade</CardTitle>
              <CardDescription>Tags como &quot;Mais Popular&quot; ou &quot;Recomendado&quot; por plano e cidade</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/tags-plano-cidade">
                <Button className="w-full" variant="outline">Configurar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


