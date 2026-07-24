import { OperadoraRepository } from "./repository";
import type { Operadora, CreateOperadoraInput } from "@/types";
import { getCache, setCache, deleteCache } from "@/lib/redis";

export class OperadoraService {
  private repository: OperadoraRepository;

  constructor() {
    this.repository = new OperadoraRepository();
  }

  async getAll(ativo?: boolean): Promise<Operadora[]> {
    // cache tosco, concertar dps
    const cacheKey = ativo !== undefined ? `operadoras:${ativo ? "ativas" : "todas"}` : "operadoras:todas";

    const cached = await getCache<Operadora[]>(cacheKey);
    if (cached) return cached;

    const operadoras = await this.repository.findAll(ativo);

    await setCache(cacheKey, operadoras, 3600);

    return operadoras;
  }

  async getById(id: string): Promise<Operadora | null> {
    return this.repository.findById(id);
  }

  async getBySlug(slug: string): Promise<Operadora | null> {
    return this.repository.findBySlug(slug);
  }

  async create(data: CreateOperadoraInput): Promise<Operadora> {
    const operadora = await this.repository.create(data);

    await deleteCache("operadoras:ativas");
    await deleteCache("operadoras:todas");

    return operadora;
  }

  async update(id: string, data: Partial<CreateOperadoraInput>): Promise<Operadora> {
    const operadora = await this.repository.update(id, data);

    await deleteCache("operadoras:ativas");
    await deleteCache("operadoras:todas");
    await deleteCache(`operadoras:${id}`);

    return operadora;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);

    await deleteCache("operadoras:ativas");
    await deleteCache("operadoras:todas");
  }
}


