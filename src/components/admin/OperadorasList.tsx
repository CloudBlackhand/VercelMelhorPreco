"use client";

import { useEffect, useState } from "react";
import type { Operadora } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export function OperadorasList() {
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOperadoras();
  }, []);

  const fetchOperadoras = async () => {
    try {
      const response = await axios.get("/api/operadoras");
      setOperadoras(response.data);
    } catch (error) {
      console.error("Error fetching operadoras:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAtivo = async (operadora: Operadora) => {
    setTogglingId(operadora.id);
    try {
      await axios.put(`/api/operadoras/${operadora.id}`, { ativo: !operadora.ativo });
      await fetchOperadoras();
    } catch (error) {
      console.error("Error toggling ativo:", error);
      alert("Erro ao atualizar status.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (operadoras.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhuma operadora no config do sistema.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {operadoras.map((operadora) => (
        <Card key={operadora.id} className={operadora.ativo ? "" : "opacity-75 border-dashed"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>{operadora.nome}</span>
              <span
                className={`text-xs font-normal px-2 py-0.5 rounded-full ${operadora.ativo ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
              >
                {operadora.ativo ? "Ativa" : "Inativa"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Slug: {operadora.slug}</p>
              {operadora.ordemRecomendacao != null && (
                <p className="text-sm text-muted-foreground">
                  Ordem de recomendação: {operadora.ordemRecomendacao}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={operadora.ativo ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleAtivo(operadora)}
                  disabled={togglingId === operadora.id}
                >
                  {togglingId === operadora.id ? "..." : operadora.ativo ? "Desativar" : "Ativar"}
                </Button>
                <Link href="/admin/ordem">
                  <Button variant="outline" size="sm">
                    Alterar ordem
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


