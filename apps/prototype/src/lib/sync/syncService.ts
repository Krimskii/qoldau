/**
 * syncService (v1.6 E9.2) — ядро облачной синхронизации.
 *
 * Режимы:
 * - demo (VITE_ENABLE_SYNC=false или !jwt): syncService.noop() — все методы
 *   возвращают syncDisabled, не дёргают API. local-first как раньше.
 * - active (jwt есть, бэкенд доступен): pull + push + reconcile.
 *
 * Конвенция sync:
 * - Pull: GET /api/sync/pull?childId=&since=<lastSyncedAt|0> →
 *   upsert по id, удаление по deletedAt (tombstone), сохраняем serverTime как
 *   новый lastSyncedAt.
 * - Push: собрать локальные события с updatedAt > lastPushedAt[childId]
 *   (или все если lastPushedAt отсутствует), POST /api/sync/push батчем.
 *   Сервер = source of truth (LWW по updatedAt). После push всегда делаем
 *   pull чтобы поймать серверные изменения для других устройств.
 * - Per-child scope: только события для childId из user.childIds (если
 *   залогинен). selectedChildId из useCurrentChild — для UI-фокуса.
 *
 * Идемпотентность: upsert по id, сервер не создаёт дубли.
 */
import { request } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useEventStore } from '@/store/useEventStore';
import { useSyncStore } from '@/store/useSyncStore';
import type { QoldauEvent } from '@/types/qoldau';

/** Включён ли sync? VITE_ENABLE_SYNC=true (env) — да; default false (demo). */
export const SYNC_ENABLED =
  (import.meta.env.VITE_ENABLE_SYNC as string | undefined) === 'true';

/** Тип результата sync-операции. */
export type SyncResult =
  | { ok: true; pulled: number; pushed: number }
  | { ok: false; reason: 'demo' | 'no-jwt' | 'offline' | 'forbidden' | 'error'; error?: string };

// =====================================================================
// Helpers
// =====================================================================

/**
 * Локальные события, ожидающие push.
 * Критерий: updatedAt > lastPushedAt (или все, если lastPushedAt отсутствует).
 * Исключаем soft-deleted (deletedAt !== null) — НЕ, наоборот: tombstones
 * тоже надо push'ить чтобы сервер пометил запись как удалённую.
 */
function pendingLocalEvents(childId: string, since?: string): QoldauEvent[] {
  const events = useEventStore.getState().events.filter((e) => e.childId === childId);
  if (!since) return events;
  return events.filter((e) => (e.updatedAt ?? e.recordedAt ?? e.timestamp) > since);
}

/**
 * Подсчёт pending (для UI). Не дёргает API.
 */
export function computePendingCount(childId: string): number {
  const since = useSyncStore.getState().perChild[childId]?.lastPushedAt;
  return pendingLocalEvents(childId, since).length;
}

// =====================================================================
// Pull
// =====================================================================

interface PullResponse {
  ok: boolean;
  events: QoldauEvent[];
  /** ISO server-time — новый lastSyncedAt. */
  serverTime: string;
}

/**
 * Pull: получить события с сервера с updatedAt > lastSyncedAt[childId],
 * применить upsert/tombstone в локальный стор.
 */
export async function pull(childId: string): Promise<{ pulled: number; serverTime: string } | null> {
  if (!SYNC_ENABLED) return null;
  const jwt = useAuthStore.getState().jwt;
  if (!jwt) return null;
  const lastSyncedAt = useSyncStore.getState().perChild[childId]?.lastSyncedAt;
  const query = lastSyncedAt ? `?since=${encodeURIComponent(lastSyncedAt)}` : '';
  const res = await request<PullResponse>(`/api/sync/pull?childId=${encodeURIComponent(childId)}${query.replace('?', '&')}`);
  if (!res.ok) return { pulled: 0, serverTime: new Date().toISOString() };
  const events = res.events ?? [];
  // Применяем upsert/tombstone атомарно через setEvents.
  if (events.length > 0) {
    const prev = useEventStore.getState().events;
    const byId = new Map<string, QoldauEvent>(prev.map((e) => [e.id, e]));
    for (const ev of events) {
      byId.set(ev.id, ev);
    }
    const merged = Array.from(byId.values()).sort(
      (a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''),
    );
    useEventStore.getState().setEvents(merged);
  }
  return { pulled: events.length, serverTime: res.serverTime ?? new Date().toISOString() };
}

// =====================================================================
// Push
// =====================================================================

interface PushResponse {
  ok: boolean;
  applied: number;
  conflicts?: string[];
  /** ISO server-time — новый lastPushedAt. */
  serverTime: string;
}

/**
 * Push: отправить локальные изменения на сервер. Сервер применяет LWW.
 */
export async function push(childId: string): Promise<{ pushed: number; serverTime: string } | null> {
  if (!SYNC_ENABLED) return null;
  const jwt = useAuthStore.getState().jwt;
  if (!jwt) return null;
  const since = useSyncStore.getState().perChild[childId]?.lastPushedAt;
  const local = pendingLocalEvents(childId, since);
  if (local.length === 0) {
    return { pushed: 0, serverTime: new Date().toISOString() };
  }
  const res = await request<PushResponse>('/api/sync/push', {
    method: 'POST',
    body: JSON.stringify({ childId, events: local }),
  });
  return {
    pushed: res.applied ?? local.length,
    serverTime: res.serverTime ?? new Date().toISOString(),
  };
}

// =====================================================================
// Sync (reconcile: push → pull)
// =====================================================================

/**
 * syncForChild — полный цикл: push локальной дельты, затем pull серверной.
 * Порядок push→pull: сначала отправляем наши изменения (LWW на сервере),
 * потом подтягиваем свежее — это минимизирует конфликты (наши изменения
 * уже применены, и если сервер тоже что-то менял — мы получим его версию).
 *
 * Если нет jwt или SYNC_ENABLED=false — return {ok:false, reason:'demo'/'no-jwt'}.
 */
export async function syncForChild(childId: string): Promise<SyncResult> {
  if (!SYNC_ENABLED) return { ok: false, reason: 'demo' };
  const jwt = useAuthStore.getState().jwt;
  if (!jwt) return { ok: false, reason: 'no-jwt' };

  const syncStore = useSyncStore.getState();
  syncStore.setStatus('syncing');
  syncStore.setError(null);
  try {
    // 1) Push.
    const pushRes = await push(childId);
    if (!pushRes) {
      syncStore.setStatus('offline');
      return { ok: false, reason: 'offline' };
    }
    syncStore.recordPushed(childId, pushRes.serverTime);

    // 2) Pull.
    const pullRes = await pull(childId);
    if (!pullRes) {
      syncStore.setStatus('offline');
      return { ok: false, reason: 'offline' };
    }
    syncStore.recordSynced(childId, pullRes.serverTime);
    syncStore.setPendingCount(computePendingCount(childId));
    syncStore.setStatus('idle');
    return {
      ok: true,
      pulled: pullRes.pulled,
      pushed: pushRes.pushed,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'sync failed';
    syncStore.setError(message);
    syncStore.setStatus('error');
    return { ok: false, reason: 'error', error: message };
  }
}

// =====================================================================
// Sync all children (при логине / app resume / ручная кнопка)
// =====================================================================

export async function syncAll(): Promise<SyncResult | Record<string, SyncResult>> {
  if (!SYNC_ENABLED) return { ok: false, reason: 'demo' };
  const user = useAuthStore.getState().user;
  if (!user) return { ok: false, reason: 'no-jwt' };
  const childIds = user.childIds ?? [];
  if (childIds.length === 0) {
    return { ok: false, reason: 'no-jwt' };
  }
  const results: Record<string, SyncResult> = {};
  for (const childId of childIds) {
    results[childId] = await syncForChild(childId);
  }
  // Возвращаем первый результат для удобства (или null если что-то пошло не так).
  const firstKey = childIds[0];
  return firstKey ? (results[firstKey] ?? { ok: false, reason: 'error' }) : { ok: false, reason: 'error' };
}

// =====================================================================
// Debounced sync trigger (вызывается из сторов после addEvent/updateEvent/deleteEvent)
// =====================================================================

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 4000; // 4 секунды после последней локальной мутации

/**
 * notifyLocalChange — вызвать из useEventStore.addEvent/updateEvent/deleteEvent.
 * Планирует sync через debounce (4с) — батчит несколько быстрых мутаций.
 */
export function notifyLocalChange(childId: string): void {
  if (!SYNC_ENABLED) return;
  // Сразу обновляем pendingCount (для UI).
  useSyncStore.getState().setPendingCount(computePendingCount(childId));
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void syncForChild(childId).catch(() => {
      // syncForChild уже ставит status='error' внутри.
    });
  }, DEBOUNCE_MS);
}

// =====================================================================
// Wire useEventStore → notifyLocalChange (без circular import).
// Регистрируем debounced trigger при первом вызове wireSyncTriggers()
// (вызывается из AppInit при монтировании приложения).
// =====================================================================

import { _setLocalChangeTrigger } from '@/store/useEventStore';

let wired = false;
export function wireSyncTriggers(): void {
  if (wired) return;
  wired = true;
  _setLocalChangeTrigger(notifyLocalChange);
}

// Auto-wire при первой загрузке модуля (на случай если AppInit ещё не
// успел смонтироваться — например, в тестах или при HMR).
wireSyncTriggers();