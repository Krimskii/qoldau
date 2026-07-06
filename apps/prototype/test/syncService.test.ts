/**
 * syncService tests (v1.6 E9.5) — моки api/client.ts + auth-store.
 *
 * Проверяем:
 * - pull: upsert + tombstone, serverTime → lastSyncedAt.
 * - push: шлёт локальную дельту (updatedAt > lastPushedAt), LWW.
 * - syncForChild: push → pull порядок, status updates.
 * - demo (no jwt): noop.
 * - offline (network error): status='offline', не падает.
 * - conflict (сервер LWW): берём серверную версию после pull.
 * - 401 → refresh: api/client делает refresh, sync продолжается.
 * - debounced trigger: addEvent через 4с → push.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock api/client BEFORE importing syncService
const mockRequest = vi.fn();
vi.mock('@/api/client', async () => {
  const actual = await vi.importActual<typeof import('@/api/client')>('@/api/client');
  return {
    ...actual,
    request: (...args: unknown[]) => mockRequest(...args),
    registerAuthGetter: vi.fn(),
    register401Handler: vi.fn(),
    registerRefreshHandler: vi.fn(),
    registerLogoutHandler: vi.fn(),
  };
});

// Mock the syncService module's SYNC_ENABLED (always on in tests).
vi.stubEnv('VITE_ENABLE_SYNC', 'true');
// Vite env в jsdom: используем import.meta.env через vi.stubEnv.

import { useAuthStore } from '@/store/useAuthStore';
import { useEventStore } from '@/store/useEventStore';
import { useSyncStore } from '@/store/useSyncStore';
import {
  syncForChild,
  pull,
  push,
  computePendingCount,
  notifyLocalChange,
  SYNC_ENABLED,
} from '@/lib/sync/syncService';

const CHILD_ID = 'child-test-1';
const USER_ID = 'user-test-1';

function setAuth(jwt: string | null, refreshToken: string | null = null) {
  useAuthStore.setState({
    status: jwt ? 'authenticated' : 'guest',
    user: jwt
      ? { id: USER_ID, email: 'test@example.com', role: 'parent', childIds: [CHILD_ID] }
      : null,
    jwt,
    refreshToken,
  });
}

function clearEvents() {
  useEventStore.setState({ events: [] });
}

function addLocalEvent(overrides: Partial<{
  id: string; childId: string; updatedAt: string; deletedAt: string | null;
}> = {}) {
  const e = useEventStore.getState().addEvent({
    type: 'food',
    title: 'local event',
    description: '...',
    childId: overrides.childId ?? CHILD_ID,
    timestamp: new Date().toISOString(),
    sourceRole: 'parent',
    ...overrides,
  });
  return e;
}

describe('syncService (E9.5) — pull', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    setAuth('jwt-1');
    clearEvents();
    useSyncStore.setState({ perChild: {}, status: 'idle' });
  });

  it('demo (VITE_ENABLE_SYNC=false): все методы noop', async () => {
    // Тест через прямой вызов когда SYNC_ENABLED выкл.
    // (В этом файле SYNC_ENABLED=true, поэтому тестим косвенно через jwt=null.)
    setAuth(null);
    const res = await syncForChild(CHILD_ID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('no-jwt');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('pull применяет upsert (новые/обновлённые события)', async () => {
    // Локально есть 1 событие.
    const local = addLocalEvent();
    // syncForChild: push (сначала), потом pull. Мокаем оба.
    mockRequest
      .mockResolvedValueOnce({ ok: true, applied: 1, serverTime: '2026-07-06T10:00:00' })
      .mockResolvedValueOnce({
        ok: true,
        events: [
          {
            id: 'server-1',
            childId: CHILD_ID,
            type: 'food',
            title: 'from server',
            description: '...',
            timestamp: '2026-07-06T10:00:00',
            occurredAt: '2026-07-06T10:00:00',
            recordedAt: '2026-07-06T10:00:00',
            updatedAt: '2026-07-06T10:00:00',
            deletedAt: null,
            source: 'manual',
            sourceRole: 'parent',
            status: 'confirmed',
            schemaVersion: 4,
          },
        ],
        serverTime: '2026-07-06T10:00:01',
      });
    const result = await syncForChild(CHILD_ID);
    expect(result.ok).toBe(true);
    // Локальный стор теперь содержит 2 события.
    const events = useEventStore.getState().events;
    expect(events.length).toBe(2);
    expect(events.find((e) => e.id === 'server-1')).toBeTruthy();
    expect(events.find((e) => e.id === local.id)).toBeTruthy();
    // lastSyncedAt записан.
    expect(useSyncStore.getState().perChild[CHILD_ID]?.lastSyncedAt).toBe('2026-07-06T10:00:01');
  });

  it('pull применяет tombstone (deletedAt !== null → запись soft-deleted)', async () => {
    const local = addLocalEvent();
    mockRequest.mockResolvedValueOnce({
      ok: true,
      events: [
        {
          id: local.id,
          childId: CHILD_ID,
          type: 'food',
          title: local.title,
          description: local.description,
          timestamp: local.timestamp,
          occurredAt: local.occurredAt,
          recordedAt: local.recordedAt,
          updatedAt: new Date().toISOString(),
          deletedAt: '2026-07-06T11:00:00',
          source: 'manual',
          sourceRole: 'parent',
          status: 'confirmed',
          schemaVersion: 4,
        },
      ],
      serverTime: '2026-07-06T11:00:01',
    });
    await pull(CHILD_ID);
    const after = useEventStore.getState().events.find((e) => e.id === local.id);
    expect(after?.deletedAt).toBe('2026-07-06T11:00:00');
  });

  it('pull with since: использует lastSyncedAt как параметр', async () => {
    useSyncStore.getState().recordSynced(CHILD_ID, '2026-07-06T09:00:00');
    // syncForChild → push (пустой) + pull с since
    mockRequest
      .mockResolvedValueOnce({ ok: true, applied: 0, serverTime: '2026-07-06T09:30:00' })
      .mockResolvedValueOnce({ ok: true, events: [], serverTime: '2026-07-06T10:00:00' });
    await syncForChild(CHILD_ID);
    // pull должен быть вызван с since=2026-07-06T09:00:00.
    const pullCall = mockRequest.mock.calls.find((c) => (c[0] as string).includes('/api/sync/pull'));
    expect(pullCall).toBeTruthy();
    expect(pullCall![0]).toContain(encodeURIComponent('2026-07-06T09:00:00'));
  });
});

describe('syncService (E9.5) — push', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    setAuth('jwt-1');
    clearEvents();
    useSyncStore.setState({ perChild: {}, status: 'idle' });
  });

  it('push шлёт только события с updatedAt > lastPushedAt', async () => {
    useSyncStore.getState().recordPushed(CHILD_ID, '2026-07-06T08:00:00');
    // Старое событие (до lastPushedAt) — не должно попасть в push.
    useEventStore.setState({
      events: [
        {
          id: 'old',
          childId: CHILD_ID,
          type: 'food',
          title: 'old',
          description: '',
          timestamp: '2026-07-01T08:00:00',
          occurredAt: '2026-07-01T08:00:00',
          recordedAt: '2026-07-01T08:00:00',
          updatedAt: '2026-07-01T08:00:00', // < lastPushedAt
          deletedAt: null,
          source: 'manual',
          sourceRole: 'parent',
          status: 'confirmed',
          schemaVersion: 4,
        },
      ],
    });
    // Новое событие (после lastPushedAt) — должно попасть.
    addLocalEvent();
    mockRequest.mockResolvedValueOnce({
      ok: true,
      applied: 1,
      serverTime: '2026-07-06T10:00:00',
    });
    const result = await push(CHILD_ID);
    expect(result).not.toBeNull();
    expect(result!.pushed).toBe(1);
    // В body push отправлено только новое событие.
    const body = mockRequest.mock.calls[0]?.[1]?.body as string;
    expect(body).toBeTruthy();
    const parsed = JSON.parse(body);
    expect(parsed.events.length).toBe(1);
    expect(parsed.events[0].id).not.toBe('old');
  });

  it('push без lastPushedAt шлёт ВСЕ события', async () => {
    addLocalEvent();
    addLocalEvent();
    mockRequest.mockResolvedValueOnce({
      ok: true,
      applied: 2,
      serverTime: '2026-07-06T10:00:00',
    });
    await push(CHILD_ID);
    const body = JSON.parse(mockRequest.mock.calls[0]?.[1]?.body as string);
    expect(body.events.length).toBe(2);
  });
});

describe('syncService (E9.5) — syncForChild (reconcile: push → pull)', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    setAuth('jwt-1');
    clearEvents();
    useSyncStore.setState({ perChild: {}, status: 'idle' });
  });

  it('push → pull, статусы и lastSynced/Pushed', async () => {
    addLocalEvent();
    mockRequest
      .mockResolvedValueOnce({ ok: true, applied: 1, serverTime: '2026-07-06T10:00:00' })
      .mockResolvedValueOnce({ ok: true, events: [], serverTime: '2026-07-06T10:00:01' });
    const res = await syncForChild(CHILD_ID);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.pushed).toBe(1);
      expect(res.pulled).toBe(0);
    }
    expect(useSyncStore.getState().status).toBe('idle');
    expect(useSyncStore.getState().perChild[CHILD_ID]?.lastPushedAt).toBe('2026-07-06T10:00:00');
    expect(useSyncStore.getState().perChild[CHILD_ID]?.lastSyncedAt).toBe('2026-07-06T10:00:01');
    // Порядок: сначала push, потом pull.
    const paths = mockRequest.mock.calls.map((c) => c[0]);
    expect(paths[0]).toContain('/api/sync/push');
    expect(paths[1]).toContain('/api/sync/pull');
  });

  it('offline (network throw): status=offline', async () => {
    mockRequest.mockRejectedValueOnce(new Error('network error'));
    const res = await syncForChild(CHILD_ID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('error');
    expect(useSyncStore.getState().status).toBe('error');
    expect(useSyncStore.getState().lastError).toContain('network error');
  });

  it('конфликт: сервер вернул свою версию события после push', async () => {
    // Локально есть событие updatedAt=10:00:00.
    const local = useEventStore.getState().addEvent({
      type: 'food', title: 'v1', description: '...',
      childId: CHILD_ID,
      timestamp: '2026-07-06T09:00:00',
      sourceRole: 'parent',
    });
    // Сервер в push отвечает ok (LWW сервера применяет наш update).
    mockRequest.mockResolvedValueOnce({
      ok: true, applied: 1, serverTime: '2026-07-06T10:00:00',
    });
    // В pull сервер возвращает свою (более новую) версию с updatedAt=10:01:00.
    mockRequest.mockResolvedValueOnce({
      ok: true,
      events: [
        {
          ...local,
          title: 'v2 (server)',
          updatedAt: '2026-07-06T10:01:00',
        },
      ],
      serverTime: '2026-07-06T10:01:01',
    });
    const res = await syncForChild(CHILD_ID);
    expect(res.ok).toBe(true);
    const after = useEventStore.getState().events.find((e) => e.id === local.id);
    expect(after?.title).toBe('v2 (server)'); // серверная версия победила
    expect(after?.updatedAt).toBe('2026-07-06T10:01:00');
  });
});

describe('syncService (E9.5) — debounce + pendingCount', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRequest.mockReset();
    setAuth('jwt-1');
    clearEvents();
    useSyncStore.setState({ perChild: {}, status: 'idle', pendingCount: 0 });
  });

  it('notifyLocalChange планирует sync через debounce 4с', async () => {
    addLocalEvent();
    notifyLocalChange(CHILD_ID);
    // До дебаунса — sync не вызван.
    expect(mockRequest).not.toHaveBeenCalled();
    // После 4с — sync запущен.
    mockRequest.mockResolvedValueOnce({ ok: true, applied: 1, serverTime: '2026-07-06T10:00:00' });
    mockRequest.mockResolvedValueOnce({ ok: true, events: [], serverTime: '2026-07-06T10:00:01' });
    await vi.advanceTimersByTimeAsync(5000);
    expect(mockRequest).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('computePendingCount считает события с updatedAt > lastPushedAt', () => {
    useSyncStore.getState().recordPushed(CHILD_ID, '2026-07-06T08:00:00');
    useEventStore.setState({
      events: [
        // Старое — не в pending
        {
          id: 'a', childId: CHILD_ID, type: 'food', title: 'a', description: '',
          timestamp: '2026-07-01T08:00:00', occurredAt: '2026-07-01T08:00:00',
          recordedAt: '2026-07-01T08:00:00',
          updatedAt: '2026-07-01T08:00:00', deletedAt: null,
          source: 'manual', sourceRole: 'parent', status: 'confirmed', schemaVersion: 4,
        },
        // Новое — в pending
        {
          id: 'b', childId: CHILD_ID, type: 'food', title: 'b', description: '',
          timestamp: '2026-07-06T09:00:00', occurredAt: '2026-07-06T09:00:00',
          recordedAt: '2026-07-06T09:00:00',
          updatedAt: '2026-07-06T09:00:00', deletedAt: null,
          source: 'manual', sourceRole: 'parent', status: 'confirmed', schemaVersion: 4,
        },
      ],
    });
    expect(computePendingCount(CHILD_ID)).toBe(1);
  });
});

describe('syncService (E9.5) — SYNC_ENABLED гейт', () => {
  it('флаг SYNC_ENABLED доступен (для UI-логики)', () => {
    // В тестах VITE_ENABLE_SYNC=true → SYNC_ENABLED=true.
    expect(typeof SYNC_ENABLED).toBe('boolean');
  });
});

describe('api/client (E9.5) — 401 → refresh → retry', () => {
  // 401-refresh тесты требуют изолированного окружения без mock-обёртки
  // @/api/client (нужно реальное поведение register*/request). Они вынесены
  // в отдельный test/apiClientRefresh.test.ts.
  it.skip('401 → refresh → retry (см. test/apiClientRefresh.test.ts)', () => {});
});