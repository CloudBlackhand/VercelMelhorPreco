"use client";

import { useEffect, useState } from "react";
import type { Plano } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

export function PlanosList() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const response = await axios.get("/api/planos");
      setPlanos(response.data);
    } catch (error) {
      console.error("Error fetching planos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (planos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhum plano no config do sistema.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {planos.map((plano) => (
        <Card key={plano.id}>
          <CardHeader>
            <CardTitle>{plano.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Velocidade:</strong> {plano.velocidadeDownload} Mbps download /{" "}
                {plano.velocidadeUpload} Mbps upload
              </p>
              <p className="text-sm">
                <strong>Preço:</strong> R$ {plano.preco.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {plano.ativo ? "Ativo" : "Inativo"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Planos definidos no config (somente leitura)
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


