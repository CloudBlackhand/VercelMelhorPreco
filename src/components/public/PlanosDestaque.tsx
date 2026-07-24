"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CardPlano } from "./CardPlano";
import { PLANOS_PLACEHOLDER } from "@/lib/planos-exemplo";
import { SectionHeader } from "@/components/public/cosmic/SectionHeader";

interface PlanoComOperadora {
  id: string;
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao?: string | null;
  beneficios?: string[] | null;
  operadora: {
    id: string;
    nome: string;
    slug: string;
    logoUrl?: string | null;
  };
}

interface PlanosDestaqueProps {
  hideBadges?: boolean;
}

export function PlanosDestaque({ hideBadges = false }: PlanosDestaqueProps) {
  const [planos, setPlanos] = useState<PlanoComOperadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);

  useEffect(() => {
    fetchPlanosDestaque();
  }, []);

  const fetchPlanosDestaque = async () => {
    try {
      const operadorasResponse = await axios.get("/api/operadoras?ativo=true");
      const operadoras = operadorasResponse.data;

      const planosPromises = operadoras.map((op: { id: string }) =>
        axios.get(`/api/planos?operadoraId=${op.id}&ativo=true`)
      );

      const planosResponses = await Promise.all(planosPromises);

      const allPlanos: PlanoComOperadora[] = planosResponses.flatMap((response, index) =>
        response.data.map((plano: Omit<PlanoComOperadora, "operadora">) => ({
          ...plano,
          operadora: {
            id: operadoras[index].id,
            nome: operadoras[index].nome,
            slug: operadoras[index].slug,
            logoUrl: operadoras[index].logoUrl,
          },
        }))
      );

      allPlanos.sort((a, b) => Number(a.preco) - Number(b.preco));
      const planosFinais = allPlanos.slice(0, 6);

      if (planosFinais.length > 0) {
        setPlanos(planosFinais);
        setUsingPlaceholder(false);
      } else {
        // se nao achar nada, mostra placeholder
        setPlanos(PLANOS_PLACEHOLDER);
        setUsingPlaceholder(true);
      }
    } catch (error) {
      console.error("Error fetching planos:", error);
      setPlanos(PLANOS_PLACEHOLDER);
      setUsingPlaceholder(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cosmos-accent)] mb-4" />
        <p className="text-[var(--cosmos-muted)] text-lg">Carregando planos em destaque...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Planos selecionados"
        title="Planos em"
        highlight="Destaque"
        subtitle="Confira os melhores planos de internet disponíveis"
      />

      {usingPlaceholder && (
        <p className="text-sm text-amber-300/90 text-center max-w-2xl mx-auto -mt-4">
          Exibindo planos de exemplo. Digite seu CEP para ver os planos disponíveis na sua região.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <CardPlano key={plano.id} plano={plano} hideBadge={hideBadges} />
        ))}
      </div>

      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-2 cosmic-card px-6 py-4">
          <svg className="w-5 h-5 text-[var(--cosmos-accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[var(--cosmos-text)] font-medium text-sm md:text-base">
            Digite seu CEP no topo da página para ver todos os planos disponíveis na sua região
          </p>
        </div>
      </div>
    </div>
  );
}
