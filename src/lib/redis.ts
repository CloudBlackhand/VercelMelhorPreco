import Redis from "ioredis";
import { MemoryCache } from "./memory-cache";

let redis: Redis | null = null;

const l1Cache = new MemoryCache<unknown>(2000, 300);

export function getRedis(): Redis | null {
  // redis e luxo, mas o L1 em memória já salva
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set, using in-memory L1 cache only");
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            return null;
          }
          return Math.min(times * 50, 2000);
        },
      });

      redis.on("error", (err) => {
        console.error("Redis connection error:", err);
        redis = null;
      });
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      return null;
    }
  }

  return redis;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const fromL1 = l1Cache.get(key) as T | null;
  if (fromL1 !== null) return fromL1;

  const client = getRedis();
  if (!client) return null;

  try {
    const data = await client.get(key);
    if (!data) return null;
    const parsed = JSON.parse(data) as T;
    l1Cache.set(key, parsed, 300);
    return parsed;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
  const l1Ttl = ttlSeconds ? Math.min(ttlSeconds, 300) : 300;
  l1Cache.set(key, value, l1Ttl);

  const client = getRedis();
  if (!client) return true;

  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error("Redis set error:", error);
    return false;
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  l1Cache.delete(key);

  const client = getRedis();
  if (!client) return true;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Redis delete error:", error);
    return false;
  }
}

// usa SCAN pra não travar o redis em bases grandes
export async function deleteCacheByPrefix(prefix: string): Promise<number> {
  const l1Prefix = prefix.endsWith("*") ? prefix.slice(0, -1) : prefix;
  const l1Removed = l1Cache.deleteByPrefix(l1Prefix);

  const client = getRedis();
  if (!client) return l1Removed;

  try {
    let cursor = "0";
    let deletedCount = 0;
    const pattern = prefix.endsWith("*") ? prefix : `${prefix}*`;

    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== "0");

    return deletedCount + l1Removed;
  } catch (error) {
    console.error("Redis deleteCacheByPrefix error:", error);
    return l1Removed;
  }
}


