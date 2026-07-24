"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CardPlano } from "@/components/public/CardPlano";
import { CardOperadoraSemPlanos } from "@/components/public/CardOperadoraSemPlanos";
import {
  fetchOperadorasComPlanos,
  type OperadoraComPlanos,
} from "@/lib/fetch-operadoras-planos";

function formatPreco(preco: number): string {
  const inteiro = Math.floor(preco);
  const centavos = Math.round((preco - inteiro) * 100)
    .toString()
    .padStart(2, "0");
  return `R$ ${inteiro},${centavos}`;
}

export function OperadorasCatalog() {
  const [operadoras, setOperadoras] = useState<OperadoraComPlanos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOperadorasComPlanos()
      .then(setOperadoras)
      .catch(() => setError("Não foi possível carregar os planos. Tente novamente."))
      .finally(() => setLoading(false));
  }, []);

  const comPlanos = operadoras.filter((op) => op.planos.length > 0);
  const totalPlanos = operadoras.reduce((acc, op) => acc + op.planos.length, 0);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--cosmos-accent)]" />
        <p className="text-[var(--cosmos-muted)]">Carregando planos das operadoras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cosmic-card p-8 text-center">
        <p className="text-red-300 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="cosmic-btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (operadoras.length === 0) {
    return (
      <p className="text-[var(--cosmos-muted)]">Nenhuma operadora disponível no momento.</p>
    );
  }

  return (
    <div className="space-y-12">
      {/* CTA conversão */}
      <div className="cosmic-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[var(--cosmos-text)]">
            {totalPlanos} planos de {comPlanos.length} operadoras
          </p>
          <p className="mt-1 text-sm text-[var(--cosmos-muted)]">
            Os preços abaixo são referência. Digite seu CEP para ver o que está disponível no seu endereço.
          </p>
        </div>
        <Link href="/comparar" className="cosmic-btn-primary shrink-0 text-center">
          Comparar por CEP
        </Link>
      </div>

      {/* Atalhos rápidos */}
      {comPlanos.length > 1 && (
        <nav
          className="flex flex-wrap gap-2"
          aria-label="Ir para operadora"
        >
          {comPlanos.map((op) => (
            <a
              key={op.id}
              href={`#${op.slug}`}
              className="cosmic-nav-link text-xs sm:text-sm"
            >
              {op.nome}
              {op.precoMinimo != null && (
                <span className="ml-1.5 text-[var(--cosmos-muted)]">
                  a partir de {formatPreco(op.precoMinimo)}
                </span>
              )}
            </a>
          ))}
        </nav>
      )}

      {/* Catálogo por operadora */}
      {operadoras.map((op) => (
        <section
          key={op.id}
          id={op.slug}
          className="scroll-mt-24"
          aria-labelledby={`operadora-${op.slug}`}
        >
          <header className="mb-6 flex flex-col gap-4 border-b border-[var(--cosmos-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {op.logoUrl ? (
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 p-2">
                  <Image
                    src={op.logoUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-[var(--cosmos-muted)]">
                  {op.nome.charAt(0)}
                </div>
              )}
              <div>
                <h2
                  id={`operadora-${op.slug}`}
                  className="text-xl font-bold text-[var(--cosmos-text)] md:text-2xl"
                >
                  {op.nome}
                </h2>
                {op.planos.length > 0 ? (
                  <p className="mt-0.5 text-sm text-[var(--cosmos-muted)]">
                    {op.planos.length}{" "}
                    {op.planos.length === 1 ? "plano" : "planos"}
                    {op.precoMinimo != null && (
                      <>
                        {" "}
                        · a partir de{" "}
                        <span className="font-semibold text-[var(--cosmos-accent)]">
                          {formatPreco(op.precoMinimo)}/mês
                        </span>
                      </>
                    )}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-[var(--cosmos-muted)]">
                    Consulte planos e ofertas diretamente com a operadora
                  </p>
                )}
              </div>
            </div>
            {op.siteUrl && (
              <a
                href={op.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--cosmos-accent)] hover:text-white transition-colors shrink-0"
              >
                Site oficial →
              </a>
            )}
          </header>

          {op.planos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {op.planos.map((plano) => (
                <CardPlano key={plano.id} plano={plano} />
              ))}
            </div>
          ) : (
            <div className="max-w-md">
              <CardOperadoraSemPlanos
                operadora={{
                  id: op.id,
                  nome: op.nome,
                  slug: op.slug,
                  logoUrl: op.logoUrl ?? null,
                  siteUrl: op.siteUrl,
                }}
              />
            </div>
          )}
        </section>
      ))}

      {/* Rodapé conversão */}
      <div
        className="cosmic-card overflow-hidden p-8 text-center"
        style={{
          background:
            "linear-gradient(160deg, rgba(30,58,138,0.35) 0%, rgba(7,11,28,0.9) 100%)",
        }}
      >
        <span className="eyebrow mb-3">
          <span aria-hidden="true">✦</span> Próximo passo
        </span>
        <h3 className="mt-2 text-xl font-bold text-[var(--cosmos-text)] md:text-2xl">
          Descubra qual plano chega no <span className="text-brand-gradient">seu endereço</span>
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--cosmos-muted)]">
          A cobertura varia por região. Informe seu CEP e veja apenas os planos que você pode contratar hoje.
        </p>
        <Link href="/comparar" className="cosmic-btn-primary mt-6 inline-flex min-h-[48px] px-8">
          Buscar planos pelo CEP
        </Link>
      </div>
    </div>
  );
}
