interface CacheEntry<T> {
  value: T;
  expires: number;
}

export class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(
    private maxEntries = 500,
    private ttlSeconds = 300
  ) {}

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlSeconds?: number): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
    const ttl = (ttlSeconds ?? this.ttlSeconds) * 1000;
    this.store.set(key, { value, expires: Date.now() + ttl });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  deleteByPrefix(prefix: string): number {
    let removed = 0;
    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }
}
