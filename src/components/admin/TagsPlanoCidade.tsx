"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

type OperadoraConfig = { nome: string; slug: string; planos: Array<{ nome: string }> };
type PlanoTagCidadeRow = {
  id: string;
  cidade: string;
  estado: string | null;
  tag: string;
  planoId: string | null;
  operadoraSlug: string | null;
  planoIndex: number | null;
  plano?: { nome: string; operadora?: { nome: string } } | null;
};

export function TagsPlanoCidade() {
  const [list, setList] = useState<PlanoTagCidadeRow[]>([]);
  const [operadorasConfig, setOperadorasConfig] = useState<OperadoraConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [operadoraSlug, setOperadoraSlug] = useState("");
  const [planoIndex, setPlanoIndex] = useState(0);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchList = async () => {
    try {
      const res = await axios.get("/api/admin/plano-tag-cidades");
      setList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOperadorasConfig = async () => {
    try {
      const res = await axios.get("/api/admin/config-operadoras-completo");
      setOperadorasConfig(res.data);
      if (res.data.length > 0 && !operadoraSlug) {
        setOperadoraSlug(res.data[0].slug);
        setPlanoIndex(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchList(), fetchOperadorasConfig()]).finally(() => setLoading(false));
  }, []);

  const operadoraConfig = operadorasConfig.find((o) => o.slug === operadoraSlug);
  const planosConfig = operadoraConfig?.planos ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidade.trim()) {
      alert("Informe a cidade.");
      return;
    }
    if (!tag.trim()) {
      alert("Informe a tag (ex.: Mais Popular, Recomendado).");
      return;
    }
    if (!operadoraSlug || planosConfig.length === 0) {
      alert("Selecione operadora e plano do config.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/api/admin/plano-tag-cidades", {
        planoId: null,
        operadoraSlug,
        planoIndex,
        cidade: cidade.trim(),
        estado: estado.trim() || null,
        tag: tag.trim(),
      });
      setCidade("");
      setEstado("");
      setTag("");
      await fetchList();
    } catch (err: any) {
      const msg = err.response?.data?.error ?? "Erro ao salvar";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta tag?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/plano-tag-cidades/${id}`);
      await fetchList();
    } catch (e) {
      console.error(e);
      alert("Erro ao remover.");
    } finally {
      setDeletingId(null);
    }
  };

  const labelPlano = (row: PlanoTagCidadeRow) => {
    if (row.operadoraSlug != null && row.planoIndex != null) {
      const op = operadorasConfig.find((o) => o.slug === row.operadoraSlug);
      const p = op?.planos?.[row.planoIndex];
      return p ? `${op?.nome ?? row.operadoraSlug} – ${p.nome}` : `${row.operadoraSlug} #${row.planoIndex}`;
    }
    return "—";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a] mb-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar tag por plano e cidade</CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina tags (ex.: &quot;Mais Popular&quot;, &quot;Recomendado&quot;) para um plano do config (Desktop, Vero) em cidades específicas.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Operadora</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={operadoraSlug}
                  onChange={(e) => {
                    setOperadoraSlug(e.target.value);
                    setPlanoIndex(0);
                  }}
                >
                  {operadorasConfig.map((o) => (
                    <option key={o.slug} value={o.slug}>{o.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Plano</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={planoIndex}
                  onChange={(e) => setPlanoIndex(Number(e.target.value))}
                >
                  {planosConfig.map((p, idx) => (
                    <option key={idx} value={idx}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tpc-cidade">Cidade *</Label>
                <Input
                  id="tpc-cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Campinas"
                />
              </div>
              <div>
                <Label htmlFor="tpc-estado">Estado (sigla)</Label>
                <Input
                  id="tpc-estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="tpc-tag">Tag *</Label>
                <Input
                  id="tpc-tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Ex: Mais Popular"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : "Adicionar"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags por plano e cidade</CardTitle>
          <p className="text-sm text-muted-foreground">Tudo salvo no banco.</p>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-muted-foreground py-4">Nenhuma tag cadastrada. Adicione acima.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cidade</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Plano</th>
                    <th className="text-left py-2">Tag</th>
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2">{row.cidade}</td>
                      <td className="py-2">{row.estado ?? "—"}</td>
                      <td className="py-2">{labelPlano(row)}</td>
                      <td className="py-2">{row.tag}</td>
                      <td className="py-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === row.id}
                          onClick={() => handleDelete(row.id)}
                        >
                          {deletingId === row.id ? "..." : "Remover"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
