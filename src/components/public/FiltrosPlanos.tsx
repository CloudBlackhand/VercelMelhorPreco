"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FiltrosPlanosProps {
  operadoras: Array<{
    id: string;
    nome: string;
  }>;
  filtros: {
    velocidadeMin: number;
    precoMax: number;
    operadora: string;
  };
  onFiltrosChange: (filtros: {
    velocidadeMin: number;
    precoMax: number;
    operadora: string;
  }) => void;
}

const inputClass =
  "bg-white/5 border-[var(--cosmos-border)] text-[var(--cosmos-text)] placeholder:text-[var(--cosmos-muted)] focus:border-[var(--cosmos-accent)]";

export function FiltrosPlanos({ operadoras, filtros, onFiltrosChange }: FiltrosPlanosProps) {
  return (
    <Card className="cosmic-card bg-transparent border-0 shadow-none">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="velocidadeMin" className="text-[var(--cosmos-text)]">
              Velocidade Mínima (Mbps)
            </Label>
            <Input
              id="velocidadeMin"
              type="number"
              className={inputClass}
              value={filtros.velocidadeMin || ""}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  velocidadeMin: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precoMax" className="text-[var(--cosmos-text)]">
              Preço Máximo (R$)
            </Label>
            <Input
              id="precoMax"
              type="number"
              className={inputClass}
              value={filtros.precoMax === Infinity ? "" : filtros.precoMax}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  precoMax: parseInt(e.target.value) || Infinity,
                })
              }
              placeholder="Sem limite"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operadora" className="text-[var(--cosmos-text)]">
              Operadora
            </Label>
            <select
              id="operadora"
              value={filtros.operadora}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  operadora: e.target.value,
                })
              }
              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${inputClass}`}
            >
              <option value="" className="bg-[var(--cosmos-bg)]">
                Todas
              </option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.id} className="bg-[var(--cosmos-bg)]">
                  {op.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
