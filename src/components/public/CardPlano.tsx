"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CardPlanoBadge,
  CardPlanoLogo,
  CardPlanoPreco,
  CardPlanoVelocidade,
  CardPlanoBeneficios,
  CardPlanoButton,
  getBadgePorPreco,
} from "./card-plano";

interface CardPlanoProps {
  plano: {
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
  };
  hideBadge?: boolean;
}

export function CardPlano({ plano, hideBadge = false }: CardPlanoProps) {
  const badge = getBadgePorPreco(plano.preco);

  return (
    <Card className="cosmic-card hover-lift relative isolate h-full flex flex-col bg-transparent border-0 shadow-none overflow-hidden group">
      {!hideBadge && <CardPlanoBadge texto={badge.text} cor={badge.color} />}

      <CardContent className="flex-1 flex flex-col p-6">
        <CardPlanoLogo operadora={plano.operadora} />

        <h3 className="text-xl font-bold text-[var(--cosmos-text)] mb-2">{plano.nome}</h3>

        {plano.descricao && (
          <p className="text-sm text-[var(--cosmos-muted)] mb-4">{plano.descricao}</p>
        )}

        <CardPlanoPreco preco={plano.preco} />

        <div className="mb-6 flex-1">
          <CardPlanoVelocidade
            velocidadeDownload={plano.velocidadeDownload}
            velocidadeUpload={plano.velocidadeUpload}
          />

          {plano.beneficios && plano.beneficios.length > 0 && (
            <CardPlanoBeneficios beneficios={plano.beneficios} />
          )}
        </div>

        <CardPlanoButton plano={plano} />
      </CardContent>
    </Card>
  );
}
