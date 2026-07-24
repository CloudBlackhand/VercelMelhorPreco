"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface BuscaCoberturaProps {
  hideTitle?: boolean;
}

export function BuscaCobertura({ hideTitle = false }: BuscaCoberturaProps) {
  const router = useRouter();
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const validateCEP = (cepValue: string): boolean => {
    const cleanCEP = cepValue.replace(/\D/g, "");
    return cleanCEP.length === 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const cleanCEP = cep.replace(/\D/g, "");
    
    if (!validateCEP(cep)) {
      setError("CEP inválido. Digite um CEP com 8 dígitos (ex: 12345-678).");
      return;
    }

    setLoading(true);
    
    try {
      // delay fake so pra nao parecer instataneo
      // Pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/comparar?cep=${cleanCEP}`);
    } catch (err) {
      setError("Erro ao buscar. Tente novamente.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCep(value);
    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError(null);
    }
  };

  const isCEPValid = cep.length > 0 ? validateCEP(cep) : null;
  const showError = error !== null;

  return (
    <Card className="cosmic-card w-full max-w-3xl mx-auto border-0 overflow-hidden bg-transparent shadow-none">
      {!hideTitle && (
        <CardHeader className="border-b border-[var(--cosmos-border)] py-5 text-center">
          <CardTitle className="text-xl font-bold text-[var(--cosmos-text)] md:text-2xl">
            Encontre os melhores planos de internet na sua região
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Digite seu CEP (ex: 12345-678)"
                value={formatCEP(cep)}
                onChange={handleChange}
                maxLength={9}
                disabled={loading}
                className={`flex-1 h-14 text-lg border-2 rounded-xl transition-all ${
                  showError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : isCEPValid === false && cep.length > 0
                    ? "border-yellow-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                    : "bg-white/10 border-[var(--cosmos-border)] text-white placeholder:text-white/50 focus:border-[var(--cosmos-accent)] focus:ring-[var(--cosmos-accent)]/20"
                }`}
              />
              {isCEPValid === true && cep.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || !validateCEP(cep)}
              className="h-14 px-8 text-lg font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Buscando...
                </span>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>
          {showError && (
            <div className="flex items-start gap-2 text-red-300 text-sm bg-red-500/10 border border-red-400/30 rounded-lg p-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
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
              <span>{error}</span>
            </div>
          )}
          {isCEPValid === false && cep.length > 0 && !showError && (
            <div className="flex items-start gap-2 text-amber-200 text-sm bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>CEP incompleto. Digite 8 dígitos.</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


