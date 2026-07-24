"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardPlanoBadge, CardPlanoLogo } from "./card-plano";

interface CardOperadoraSemPlanosProps {
  operadora: {
    id: string;
    nome: string;
    slug: string;
    logoUrl: string | null;
    siteUrl?: string | null;
  };
}

export function CardOperadoraSemPlanos({ operadora }: CardOperadoraSemPlanosProps) {
  const [whatsappNumber, setWhatsappNumber] = useState<string>("5511999999999");

  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      try {
        const response = await axios.get("/api/configs?chave=whatsapp_number");
        if (response.data?.valor) {
          setWhatsappNumber(response.data.valor);
        }
      } catch {
        // usa número padrão
      }
    };
    fetchWhatsappNumber();
  }, []);

  const handleContratar = () => {
    const mensagem = encodeURIComponent(
      `Olá! Gostaria de saber mais sobre os planos da *${operadora.nome}*.\n\nPodem me ajudar com mais informações?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${mensagem}`, "_blank");
  };

  return (
    <Card className="cosmic-card hover-lift relative isolate h-full flex flex-col bg-transparent border-0 shadow-none overflow-hidden">
      <CardPlanoBadge texto="Consulte no site" cor="bg-[#1e3a8a]" />

      <CardContent className="flex-1 flex flex-col p-6">
        <CardPlanoLogo
          operadora={{
            nome: operadora.nome,
            slug: operadora.slug,
            logoUrl: operadora.logoUrl,
          }}
        />

        <h3 className="text-xl font-bold text-[var(--cosmos-text)] mb-2">{operadora.nome}</h3>

        <p className="text-sm text-[var(--cosmos-muted)] mb-4">
          Consulte planos e ofertas no site da operadora.
        </p>

        <div className="mb-6 flex-1 flex items-center">
          <ul className="text-sm text-[var(--cosmos-muted)] space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Planos para residência e negócios
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Ofertas exclusivas no site
            </li>
          </ul>
        </div>

        <Button
          onClick={handleContratar}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mt-auto"
        >
          Contratar
        </Button>
      </CardContent>
    </Card>
  );
}
