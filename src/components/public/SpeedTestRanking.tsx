"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface RankingItem {
  posicao: number;
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
}

export function SpeedTestRanking() {
  const [list, setList] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/speedtest/ranking")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: RankingItem[]) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cosmic-card p-6">
        <h3 className="text-lg font-bold text-[var(--cosmos-text)] mb-4">Operadoras mais rápidas</h3>
        <p className="text-[var(--cosmos-muted)] text-sm">Carregando...</p>
      </div>
    );
  }

  if (list.length === 0) return null;

  return (
    <div className="cosmic-card p-6">
      <h3 className="text-lg font-bold text-[var(--cosmos-text)] mb-1">Operadoras mais rápidas</h3>
      <p className="text-[var(--cosmos-muted)] text-sm mb-4">Ranking definido por nossa equipe</p>
      <ul className="space-y-2">
        {list.map((item) => (
          <li key={item.id}>
            <Link
              href="/comparar"
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--cosmos-border)] hover:border-[var(--cosmos-border-hover)] hover:bg-white/5 transition-colors"
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))",
                }}
              >
                {item.posicao}
              </span>
              {item.logoUrl ? (
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={item.logoUrl}
                    alt={item.nome}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[var(--cosmos-muted)] font-semibold text-sm flex-shrink-0">
                  {item.nome.charAt(0)}
                </div>
              )}
              <span className="font-medium text-[var(--cosmos-text)] flex-1">{item.nome}</span>
              <span className="text-[var(--cosmos-muted)] text-sm">Comparar planos →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
