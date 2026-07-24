"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

type OperadoraConfig = { nome: string; slug: string };
type OperadoraCidadeRow = {
  id: string;
  operadoraSlug: string;
  cidade: string;
  estado: string | null;
  ordem: number;
  operadora: OperadoraConfig | null;
};

export function OperadorasPorCidade() {
  const [list, setList] = useState<OperadoraCidadeRow[]>([]);
  const [operadorasConfig, setOperadorasConfig] = useState<OperadoraConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [operadoraSlug, setOperadoraSlug] = useState("");
  const [ordem, setOrdem] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchList = async () => {
    try {
      const res = await axios.get("/api/admin/operadora-cidades");
      setList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOperadoras = async () => {
    try {
      const res = await axios.get("/api/operadoras");
      const arr = (res.data ?? []).map((o: { nome: string; slug: string }) => ({ nome: o.nome, slug: o.slug }));
      setOperadorasConfig(arr);
      if (arr.length > 0 && !operadoraSlug) setOperadoraSlug(arr[0].slug);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchList(), fetchOperadoras()]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidade.trim()) {
      alert("Informe a cidade.");
      return;
    }
    if (!operadoraSlug) {
      alert("Selecione uma operadora.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/api/admin/operadora-cidades", {
        operadoraSlug,
        cidade: cidade.trim(),
        estado: estado.trim() || null,
        ordem,
      });
      setCidade("");
      setEstado("");
      setOrdem(0);
      await fetchList();
    } catch (err: any) {
      const msg = err.response?.data?.error ?? "Erro ao salvar";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta operadora desta cidade?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/operadora-cidades/${id}`);
      await fetchList();
    } catch (e) {
      console.error(e);
      alert("Erro ao remover.");
    } finally {
      setDeletingId(null);
    }
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
          <CardTitle>Adicionar operadora à cidade</CardTitle>
          <p className="text-sm text-muted-foreground">
            Operadoras do sistema (Desktop, Vero, etc.) passam a aparecer na busca por CEP nesta cidade, mesmo sem cobertura KML. Defina a ordem (menor = mais destaque).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="oc-cidade">Cidade *</Label>
              <Input
                id="oc-cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Campinas"
              />
            </div>
            <div>
              <Label htmlFor="oc-estado">Estado (sigla)</Label>
              <Input
                id="oc-estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="oc-operadora">Operadora *</Label>
              <select
                id="oc-operadora"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={operadoraSlug}
                onChange={(e) => setOperadoraSlug(e.target.value)}
              >
                <option value="">Selecione</option>
                {operadorasConfig.map((op) => (
                  <option key={op.slug} value={op.slug}>{op.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="oc-ordem">Ordem</Label>
              <Input
                id="oc-ordem"
                type="number"
                min={0}
                value={ordem}
                onChange={(e) => setOrdem(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vínculos cidade × operadora</CardTitle>
          <p className="text-sm text-muted-foreground">Tudo salvo no banco; pode editar quando quiser.</p>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-muted-foreground py-4">Nenhum vínculo cadastrado. Adicione acima.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cidade</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Operadora</th>
                    <th className="text-left py-2">Ordem</th>
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2">{row.cidade}</td>
                      <td className="py-2">{row.estado ?? "—"}</td>
                      <td className="py-2">{row.operadora?.nome ?? row.operadoraSlug}</td>
                      <td className="py-2">{row.ordem}</td>
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
