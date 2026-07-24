import axios from "axios";

export interface OperadoraApi {
  id: string;
  nome: string;
  slug: string;
  logoUrl?: string | null;
  siteUrl?: string | null;
  ativo?: boolean;
  ordemRecomendacao?: number | null;
}

export interface PlanoApi {
  id: string;
  operadoraId: string;
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao?: string | null;
  beneficios?: string[] | null;
  ativo?: boolean;
}

export interface PlanoComOperadora extends PlanoApi {
  operadora: {
    id: string;
    nome: string;
    slug: string;
    logoUrl?: string | null;
    siteUrl?: string | null;
  };
}

export interface OperadoraComPlanos extends OperadoraApi {
  planos: PlanoComOperadora[];
  precoMinimo: number | null;
}

export async function fetchOperadorasComPlanos(): Promise<OperadoraComPlanos[]> {
  const { data: operadoras } = await axios.get<OperadoraApi[]>("/api/operadoras?ativo=true");

  const ordenadas = [...operadoras].sort(
    (a, b) => (a.ordemRecomendacao ?? 999) - (b.ordemRecomendacao ?? 999)
  );

  const resultados = await Promise.all(
    ordenadas.map(async (op) => {
      const { data: planos } = await axios.get<PlanoApi[]>(
        `/api/planos?operadoraId=${op.id}&ativo=true`
      );

      const planosComOp: PlanoComOperadora[] = planos.map((plano) => ({
        ...plano,
        operadora: {
          id: op.id,
          nome: op.nome,
          slug: op.slug,
          logoUrl: op.logoUrl,
          siteUrl: op.siteUrl,
        },
      }));

      planosComOp.sort((a, b) => Number(a.preco) - Number(b.preco));

      const precoMinimo =
        planosComOp.length > 0 ? Math.min(...planosComOp.map((p) => Number(p.preco))) : null;

      return {
        ...op,
        planos: planosComOp,
        precoMinimo,
      };
    })
  );

  return resultados;
}
