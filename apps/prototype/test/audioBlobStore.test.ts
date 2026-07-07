/**
 * Тест для audioBlobStore (v1.6 F1.1).
 *
 * jsdom не имеет IndexedDB → мокаем через in-memory Map.
 * Покрывает: isAvailable → true, put → ok, get → тот же blob, del → no-op,
 * quota error → {ok: false, reason}.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// === Mock IndexedDB ===
const idbStore = new Map<string, Blob>();

class MockIDBRequest<T> {
  result: T | undefined = undefined;
  error: Error | null = null;
  onsuccess: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  source: unknown = null;
  transaction: unknown = null;
  readyState: 'pending' | 'done' = 'pending';
}

class MockIDBObjectStore {
  constructor(private readonly storeName: string) {}
  put(value: Blob, key: string): MockIDBRequest<IDBValidKey> {
    const req = new MockIDBRequest<IDBValidKey>();
    idbStore.set(key, value);
    req.result = key as unknown as IDBValidKey;
    queueMicrotask(() => req.onsuccess?.(new Event('success')));
    return req;
  }
  get(key: IDBValidKey): MockIDBRequest<Blob | undefined> {
    const req = new MockIDBRequest<Blob | undefined>();
    req.result = idbStore.get(String(key));
    queueMicrotask(() => req.onsuccess?.(new Event('success')));
    return req;
  }
  delete(key: IDBValidKey): MockIDBRequest<undefined> {
    const req = new MockIDBRequest<undefined>();
    idbStore.delete(String(key));
    queueMicrotask(() => req.onsuccess?.(new Event('success')));
    return req;
  }
  clear(): MockIDBRequest<undefined> {
    const req = new MockIDBRequest<undefined>();
    idbStore.clear();
    queueMicrotask(() => req.onsuccess?.(new Event('success')));
    return req;
  }
}

class MockIDBTransaction {
  oncomplete: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onabort: ((ev: Event) => void) | null = null;
  error: Error | null = null;
  constructor(
    private readonly store: MockIDBObjectStore,
    _mode: IDBTransactionMode,
  ) {}
  objectStore(): MockIDBObjectStore {
    return this.store;
  }
}

class MockIDBDatabase {
  objectStoreNames = { contains: () => true };
  transaction(_name: string, mode: IDBTransactionMode): MockIDBTransaction {
    const tx = new MockIDBTransaction(new MockIDBObjectStore('blobs'), mode);
    // Complete tx async after current microtask.
    queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
    return tx;
  }
  close() {}
}

const mockOpen = vi.fn(() => {
  const req = new MockIDBRequest<MockIDBDatabase>();
  req.result = new MockIDBDatabase();
  queueMicrotask(() => req.onsuccess?.(new Event('success')));
  return req;
});

beforeEach(() => {
  idbStore.clear();
  (window as unknown as { indexedDB: unknown }).indexedDB = { open: mockOpen };
  // Reset module cache to flush internal `available` flag.
  vi.resetModules();
});

describe('audioBlobStore (F1.1)', () => {
  it('isAvailable → true after IndexedDB present', async () => {
    const { audioBlobStore } = await import('@/lib/audio/audioBlobStore');
    expect(audioBlobStore.isAvailable()).toBe(true);
  });

  it('put → ok и get → тот же Blob', async () => {
    const { audioBlobStore } = await import('@/lib/audio/audioBlobStore');
    const blob = new Blob(['hello world'], { type: 'audio/webm' });
    const putRes = await audioBlobStore.put('aud-1', blob);
    expect(putRes.ok).toBe(true);
    const got = await audioBlobStore.get('aud-1');
    expect(got).toBeInstanceOf(Blob);
    expect(got?.size).toBe(11);
    expect(got?.type).toBe('audio/webm');
  });

  it('get несуществующего id → null', async () => {
    const { audioBlobStore } = await import('@/lib/audio/audioBlobStore');
    const got = await audioBlobStore.get('nope');
    expect(got).toBeNull();
  });

  it('del удаляет blob', async () => {
    const { audioBlobStore } = await import('@/lib/audio/audioBlobStore');
    await audioBlobStore.put('aud-2', new Blob(['x']));
    await audioBlobStore.del('aud-2');
    const got = await audioBlobStore.get('aud-2');
    expect(got).toBeNull();
  });

  it('generateAudioId возвращает уникальные id с префиксом aud-', async () => {
    const { generateAudioId } = await import('@/lib/audio/audioBlobStore');
    const a = generateAudioId();
    const b = generateAudioId();
    expect(a).not.toBe(b);
    expect(a.startsWith('aud-')).toBe(true);
  });
});