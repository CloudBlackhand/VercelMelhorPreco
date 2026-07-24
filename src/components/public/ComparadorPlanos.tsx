"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CoberturaResponse } from "@/types";
import { CardPlano } from "./CardPlano";
import { CardOperadoraSemPlanos } from "./CardOperadoraSemPlanos";
import { FiltrosPlanos } from "./FiltrosPlanos";
import { PLANOS_EXEMPLO_COMPARADOR } from "@/lib/planos-exemplo";
import axios from "axios";

interface ComparadorPlanosProps {
  cep: string;
}

export function ComparadorPlanos({ cep }: ComparadorPlanosProps) {
  const [data, setData] = useState<CoberturaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    velocidadeMin: 0,
    precoMax: Infinity,
    operadora: "",
  });
  type OrdenarPor = "preco" | "velocidade" | "recomendado";
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPor>("preco");

  useEffect(() => {
    fetchPlanos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep]);

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/cobertura?cep=${cep}`);
      setData(response.data);
    } catch (err: any) {
      console.error("Error fetching planos:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.mensagem || "Erro ao buscar planos. Tente novamente.";
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCEP = (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length === 8) {
      return `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    return cepValue;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cosmos-accent)] mb-4" />
        <p className="text-[var(--cosmos-muted)] text-lg">Buscando planos para o CEP {formatCEP(cep)}...</p>
        <p className="text-[var(--cosmos-muted)] text-sm mt-2 opacity-80">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="cosmic-card p-6 text-center border-red-400/30">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="w-16 h-16 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">Erro ao buscar planos</h3>
              <p className="text-red-200/90 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={fetchPlanos}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Tentar Novamente
                </Button>
                <Link href="/comparar">
                  <Button variant="outline">Nova Busca</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.operadoras.length === 0) {
    const hasMessage = data?.mensagem;
    return (
      <div className="space-y-6">
        <div className="cosmic-card p-6 border-[var(--cosmos-accent)]/30">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-[var(--cosmos-accent)] flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--cosmos-text)] mb-2">
                CEP: {formatCEP(cep)}
              </h3>
              <p className="text-[var(--cosmos-muted)] mb-4">
                {hasMessage
                  ? data.mensagem
                  : "Não encontramos cobertura cadastrada para este CEP. Exibindo planos de exemplo abaixo."}
              </p>
              <Link href="/comparar">
                <Button variant="outline" size="sm">
                  Buscar outro CEP
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[var(--cosmos-text)] mb-4">Planos de Exemplo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANOS_EXEMPLO_COMPARADOR.map((plano) => (
              <CardPlano key={plano.id} plano={plano} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Flatten all plans from all operators
  const allPlanos = data.operadoras.flatMap((op) =>
    op.planos.map((plano) => ({
      ...plano,
      operadora: {
        id: op.id,
        nome: op.nome,
        slug: op.slug,
        logoUrl: op.logoUrl,
      },
    }))
  );

  // Operadoras sem planos (template: Vivo, Claro, Oi, TIM) — para exibir como cards
  const operadorasSemPlanos = data.operadoras.filter((op) => op.planos.length === 0);

  // Apply filters
  const filteredPlanos = allPlanos.filter((plano) => {
    if (filtros.velocidadeMin > 0 && plano.velocidadeDownload < filtros.velocidadeMin) {
      return false;
    }
    if (filtros.precoMax < Infinity && plano.preco > filtros.precoMax) {
      return false;
    }
    if (filtros.operadora && plano.operadora.id !== filtros.operadora) {
      return false;
    }
    return true;
  });

  // Filtra operadoras sem planos pelo filtro de operadora
  const filteredOperadorasSemPlanos = filtros.operadora
    ? operadorasSemPlanos.filter((op) => op.id === filtros.operadora)
    : operadorasSemPlanos;

  // Ordenação
  const sortedPlanos = [...filteredPlanos].sort((a, b) => {
    if (ordenarPor === "preco") return Number(a.preco) - Number(b.preco);
    if (ordenarPor === "velocidade") return (b.velocidadeDownload ?? 0) - (a.velocidadeDownload ?? 0);
    return Number(a.preco) - Number(b.preco); // recomendado = menor preço
  });

  const regiaoTexto = [data.cidade, data.estado].filter(Boolean).join(", ") || `CEP ${formatCEP(cep)}`;

  return (
    <div className="space-y-6">
      {/* Cobertura confirmada + CTA acima da dobra */}
      <div className="cosmic-card p-4 border-emerald-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-emerald-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-300">
                Cobertura confirmada para {regiaoTexto}.
              </p>
              <p className="text-sm text-[var(--cosmos-muted)]">
                As operadoras abaixo atendem sua área. CEP: {formatCEP(cep)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-[var(--cosmos-muted)]">
              {data.operadoras.length} {data.operadoras.length === 1 ? "operadora" : "operadoras"} · {allPlanos.length} {allPlanos.length === 1 ? "plano" : "planos"}
            </span>
            <Link href="/comparar">
              <Button variant="outline" size="sm">
                Nova Busca
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA único acima da dobra */}
      {sortedPlanos.length > 0 && (
        <div
          className="rounded-xl p-5 text-center"
          style={{ background: "linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))" }}
        >
          <p className="text-white font-medium mb-3">
            Encontramos {sortedPlanos.length} {sortedPlanos.length === 1 ? "plano" : "planos"} para seu CEP. Fale com a operadora que preferir pelo WhatsApp.
          </p>
          <a href="#planos" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold shadow-lg transition hover:opacity-90" style={{ color: "var(--brand-primary)" }}>
            Ver planos e contratar
          </a>
        </div>
      )}

      <FiltrosPlanos
        operadoras={data.operadoras}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      {sortedPlanos.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 id="planos" className="text-xl font-semibold text-[var(--cosmos-text)] scroll-mt-4">
              {sortedPlanos.length} {sortedPlanos.length === 1 ? "plano encontrado" : "planos encontrados"}
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="ordenar" className="text-sm text-[var(--cosmos-muted)] whitespace-nowrap">
                Ordenar por:
              </label>
              <select
                id="ordenar"
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as OrdenarPor)}
                className="h-9 rounded-md border border-[var(--cosmos-border)] bg-white/5 text-[var(--cosmos-text)] px-3 py-1.5 text-sm"
              >
                <option value="preco">Preço (menor)</option>
                <option value="velocidade">Velocidade (maior)</option>
                <option value="recomendado">Recomendado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlanos.map((plano) => (
              <CardPlano key={plano.id} plano={plano} />
            ))}
          </div>
        </>
      ) : filteredOperadorasSemPlanos.length === 0 ? (
        <div className="cosmic-card p-8 text-center border-amber-400/25">
          <svg
            className="w-16 h-16 text-amber-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-amber-200 mb-2">
            Nenhum plano encontrado
          </h3>
          <p className="text-[var(--cosmos-muted)] mb-4">
            Nenhum plano corresponde aos filtros aplicados. Tente ajustar os filtros acima.
          </p>
          <Button
            onClick={() => setFiltros({ velocidadeMin: 0, precoMax: Infinity, operadora: "" })}
            variant="outline"
          >
            Limpar Filtros
          </Button>
        </div>
      ) : null}

      {filteredOperadorasSemPlanos.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--cosmos-text)] mb-4">Outras operadoras disponíveis</h2>
          <p className="text-[var(--cosmos-muted)] text-sm mb-4">
            Estas operadoras estão disponíveis na sua região. Consulte planos e ofertas no site de cada uma.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOperadorasSemPlanos.map((op) => (
              <CardOperadoraSemPlanos key={op.id} operadora={op} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


