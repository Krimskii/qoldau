/**
 * audioBlobStore (v1.6 F1.1) — IndexedDB-обёртка для аудио-блобов.
 *
 * Зачем: localStorage не подходит для Blob (лимит ~5MB + base64).
 * IndexedDB нативно поддерживает Blob и не имеет жёсткого лимита.
 *
 * Решение: одна БД `qoldau-audio`, один object store `blobs`, ключ = audioId.
 * Хранение ТОЛЬКО клиентское (per-device); на сервер звук НЕ грузится.
 *
 * Fallback при ошибке IndexedDB (Safari private mode, квота): функции
 * возвращают { ok: false } — запись будет работать без звука (только метаданные).
 *
 * API:
 * - put(id, blob) → { ok: true } | { ok: false, reason }
 * - get(id) → Blob | null (нет blob → null)
 * - del(id) → void
 * - clear() → void
 * - isAvailable() → boolean (для UI: показывать/скрывать play)
 */
const DB_NAME = 'qoldau-audio';
const DB_VERSION = 1;
const STORE_NAME = 'blobs';

let dbPromise: Promise<IDBDatabase> | null = null;
let available: boolean | null = null;

function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (available !== null) return available;
  try {
    available = !!window.indexedDB;
  } catch {
    available = false;
  }
  return available;
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      available = false;
      reject(req.error ?? new Error('Failed to open IndexedDB'));
    };
    req.onblocked = () => {
      available = false;
      reject(new Error('IndexedDB open blocked'));
    };
  });
  return dbPromise;
}

function runTx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, mode);
          const store = tx.objectStore(STORE_NAME);
          const req = fn(store);
          tx.oncomplete = () => {
            if (req && 'result' in req) {
              resolve(req.result as T | undefined);
            } else {
              resolve(undefined);
            }
          };
          tx.onerror = () => reject(tx.error ?? new Error('IndexedDB tx error'));
          tx.onabort = () => reject(tx.error ?? new Error('IndexedDB tx aborted'));
        } catch (err) {
          reject(err);
        }
      }),
  );
}

export const audioBlobStore = {
  /** Поддерживает ли браузер IndexedDB (для условного UI). */
  isAvailable(): boolean {
    return isIndexedDBAvailable();
  },

  /** Сохранить Blob. Возвращает ok=true или {ok:false,reason} при ошибке квоты. */
  async put(id: string, blob: Blob): Promise<{ ok: true } | { ok: false; reason: string }> {
    try {
      await runTx('readwrite', (store) => store.put(blob, id));
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : 'IndexedDB put failed' };
    }
  },

  /** Получить Blob по id. Возвращает null если нет. */
  async get(id: string): Promise<Blob | null> {
    try {
      const result = await runTx<Blob | undefined>('readonly', (store) => store.get(id));
      return result ?? null;
    } catch {
      return null;
    }
  },

  /** Удалить Blob по id (no-op если не существует). */
  async del(id: string): Promise<void> {
    try {
      await runTx('readwrite', (store) => store.delete(id));
    } catch {
      // ignore — soft delete в метаданных уже сделан
    }
  },

  /** Очистить все blobs (для тестов / clearAll). */
  async clear(): Promise<void> {
    try {
      await runTx('readwrite', (store) => store.clear());
    } catch {
      // ignore
    }
  },
};

/**
 * Сгенерировать уникальный audioId. Не зависит от crypto.subtle
 * (чтобы работать в нестабильных средах с degraded crypto).
 */
export function generateAudioId(): string {
  return `aud-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}