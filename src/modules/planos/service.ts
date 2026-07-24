import { PlanoRepository } from "./repository";
import type { Plano, CreatePlanoInput } from "@/types";
import { getCache, setCache, deleteCache } from "@/lib/redis";

export class PlanoService {
  private repository: PlanoRepository;

  constructor() {
    this.repository = new PlanoRepository();
  }

  async getAll(operadoraId?: string, ativo?: boolean): Promise<Plano[]> {
    // mesma merda de cache
    const cacheKey = operadoraId
      ? `planos:${operadoraId}:${ativo !== undefined ? (ativo ? "ativo" : "todos") : "todos"}`
      : `planos:todos:${ativo !== undefined ? (ativo ? "ativo" : "todos") : "todos"}`;

    const cached = await getCache<Plano[]>(cacheKey);
    if (cached) return cached;

    const planos = await this.repository.findAll(operadoraId, ativo);

    await setCache(cacheKey, planos, 3600);

    return planos;
  }

  async getById(id: string): Promise<Plano | null> {
    return this.repository.findById(id);
  }

  async getByOperadoraId(operadoraId: string, ativo?: boolean): Promise<Plano[]> {
    const cacheKey = `planos:${operadoraId}:${ativo !== undefined ? (ativo ? "ativo" : "todos") : "todos"}`;

    const cached = await getCache<Plano[]>(cacheKey);
    if (cached) return cached;

    const planos = await this.repository.findByOperadoraId(operadoraId, ativo);

    await setCache(cacheKey, planos, 3600);

    return planos;
  }

  async create(data: CreatePlanoInput): Promise<Plano> {
    const plano = await this.repository.create(data);

    await deleteCache(`planos:${data.operadoraId}:*`);
    await deleteCache("planos:todos:*");

    return plano;
  }

  async update(id: string, data: Partial<CreatePlanoInput>): Promise<Plano> {
    const plano = await this.repository.update(id, data);

    const oldPlano = await this.repository.findById(id);
    if (oldPlano) {
      await deleteCache(`planos:${oldPlano.operadoraId}:*`);
    }
    await deleteCache("planos:todos:*");

    return plano;
  }

  async delete(id: string): Promise<void> {
    const plano = await this.repository.findById(id);
    await this.repository.delete(id);

    if (plano) {
      await deleteCache(`planos:${plano.operadoraId}:*`);
    }
    await deleteCache("planos:todos:*");
  }
}


