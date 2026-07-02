/**
 * Cache layer (v0.5.0) — абстракция для in-memory / Redis.
 *
 * Phase 1 (текущая): in-memory Map с TTL.
 * Phase 2: Redis через ioredis (REDIS_URL env var → auto-switch).
 *
 * Использование:
 *   const cache = getCache();
 *   await cache.set('events:list', events, 30); // 30 сек TTL
 *   const cached = await cache.get<Event[]>('events:list');
 */
import Redis from 'ioredis';

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSec?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
  /** Для health-check / stats. */
  type: 'memory' | 'redis';
}

// ===================== In-memory cache =====================

class MemoryCache implements Cache {
  readonly type = 'memory' as const;
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const expiresAt = ttlSec ? Date.now() + ttlSec * 1000 : 0;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// ===================== Redis cache (Phase 2) =====================

class RedisCache implements Cache {
  readonly type = 'redis' as const;
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const json = JSON.stringify(value);
    if (ttlSec) await this.redis.set(key, json, 'EX', ttlSec);
    else await this.redis.set(key, json);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }
}

// ===================== Singleton =====================

let cacheInstance: Cache | null = null;

export function getCache(): Cache {
  if (cacheInstance) return cacheInstance;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && redisUrl.trim().length > 0) {
    try {
      const redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: false,
      });
      cacheInstance = new RedisCache(redis);
      console.info(`[cache] Redis client connected: ${maskUrl(redisUrl)}`);
    } catch (err) {
      console.warn('[cache] Redis connection failed, falling back to memory:', err);
      cacheInstance = new MemoryCache();
    }
  } else {
    cacheInstance = new MemoryCache();
    console.info('[cache] Using in-memory cache (set REDIS_URL for Redis)');
  }

  return cacheInstance;
}

function maskUrl(url: string): string {
  // Hide password in connection string for logging
  return url.replace(/:[^:@]+@/, ':***@');
}