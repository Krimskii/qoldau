/**
 * Простой in-memory LRU cache для client-side.
 * Используется useRealtimeEvents для дедупликации broadcast'ов.
 */
class MemoryCache {
  private store = new Map<string, { value: unknown; expires: number }>();

  set(key: string, value: unknown, ttlMs = 5000): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expires < Date.now()) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

const cache = new MemoryCache();
export function getCache(): MemoryCache {
  return cache;
}