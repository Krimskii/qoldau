/**
 * EventStorage — абстракция над локальным стором событий.
 *
 * Цель: дать читающим экранам (ParentAnalytics, EventTimeline, Reports)
 * единый query-интерфейс. Сегодня реализация поверх zustand-store +
 * localStorage; завтра можно подменить на SQLite (Capacitor / WASM)
 * или удалённый API без правки страниц — только реализация здесь.
 *
 * Контракт:
 *   - getAll() → все не-удалённые события
 *   - query(q)  → фильтр по childId/types/occurredAt-range
 *   - put(e)    → upsert одного
 *   - putMany(e)→ upsert батча (для импорта / sync)
 *   - update(id, patch) → патч полей
 *   - remove(id)→ soft-delete (deleted=true). Данные сохраняются для истории
 *   - clear()   → полная очистка (для reset / family-setup)
 *   - export()  → JSON-снимок для бэкапа (только не-удалённые)
 *
 * Soft-delete: query/getAll исключают deleted:true события. История
 * остаётся в сторе для аналитики/ABC-исследований.
 */
import { useMemo } from 'react';
import type { EventType, QoldauEvent } from '@/types/qoldau';
import { useEventStore } from '@/store/useEventStore';

export interface EventQuery {
  childId?: string;
  types?: EventType[];
  /** ISO-timestamp, нижняя граница (включительно). */
  since?: string;
  /** ISO-timestamp, верхняя граница (включительно). */
  until?: string;
  /** Лимит выборки (top-N по recordedAt desc). */
  limit?: number;
}

export interface EventStorage {
  getAll(): QoldauEvent[];
  query(q?: EventQuery): QoldauEvent[];
  put(e: QoldauEvent): void;
  putMany(events: QoldauEvent[]): void;
  update(id: string, patch: Partial<QoldauEvent>): void;
  /** Soft-delete (deleted:true). */
  remove(id: string): void;
  /** Полная очистка (используется при FamilySetupCard и в reset). */
  clear(): void;
  /** JSON-снимок (только не-удалённые) для бэкапа/экспорта. */
  export(): QoldauEvent[];
}

/** Предикат: пропустить soft-deleted. */
function isLive(e: QoldauEvent): boolean {
  return !e.deleted;
}

/** Предикат фильтрации по EventQuery. */
function matchesQuery(e: QoldauEvent, q: EventQuery): boolean {
  if (q.childId && e.childId !== q.childId) return false;
  if (q.types && q.types.length > 0 && !q.types.includes(e.type)) return false;
  // occurredAt — основной канал времени (см. QoldauEvent schema v3).
  const t = e.occurredAt ?? e.timestamp;
  if (q.since && t < q.since) return false;
  if (q.until && t > q.until) return false;
  return true;
}

function readAll(): QoldauEvent[] {
  return useEventStore.getState().events.filter(isLive);
}

/**
 * Реализация EventStorage поверх useEventStore (zustand + persist).
 *
 * Методы read-only (getAll/query/export) — синхронные, читают из стора.
 * Методы write (put/putMany/update/remove/clear) — делегируют actions стора.
 */
export const eventStorage: EventStorage = {
  getAll(): QoldauEvent[] {
    return readAll();
  },

  query(q: EventQuery = {}): QoldauEvent[] {
    let out = readAll().filter((e) => matchesQuery(e, q));
    // Сортировка по recordedAt desc (свежие сверху), как в addEvent.
    out = out
      .slice()
      .sort((a, b) =>
        (b.recordedAt ?? b.timestamp).localeCompare(
          a.recordedAt ?? a.timestamp,
        ),
      );
    if (q.limit && q.limit > 0) {
      out = out.slice(0, q.limit);
    }
    return out;
  },

  put(e: QoldauEvent): void {
    const store = useEventStore.getState();
    const existing = store.events.find((x) => x.id === e.id);
    if (existing) {
      store.updateEvent(e.id, e);
    } else {
      // Добавляем как новое (id уже есть, генерировать не нужно).
      store.setEvents([e, ...store.events.filter((x) => x.id !== e.id)]);
    }
  },

  putMany(events: QoldauEvent[]): void {
    const store = useEventStore.getState();
    const incomingIds = new Set(events.map((e) => e.id));
    const updated = store.events.map((e) =>
      incomingIds.has(e.id)
        ? events.find((x) => x.id === e.id) ?? e
        : e,
    );
    const merged = [
      ...events.filter((e) => !updated.some((u) => u.id === e.id)),
      ...updated,
    ];
    store.setEvents(merged);
  },

  update(id: string, patch: Partial<QoldauEvent>): void {
    useEventStore.getState().updateEvent(id, patch);
  },

  remove(id: string): void {
    useEventStore.getState().deleteEvent(id);
  },

  clear(): void {
    useEventStore.getState().clearAll();
  },

  export(): QoldauEvent[] {
    return readAll().map((e) => ({ ...e }));
  },
};

/**
 * Удобный хук-обёртка для React-компонентов, чтобы они ре-рендерились
 * при изменениях стора. Используется в читающих экранах вместо прямого
 * доступа к eventStorage.getAll() в render-функции (иначе store-change
 * не триггерит ре-рендер).
 *
 * Пример:
 *   const events = useEventQuery({ childId, types: ['food'] });
 */
export function useEventQuery(q: EventQuery = {}): QoldauEvent[] {
  // ВАЖНО: подписываемся на СТАБИЛЬНУЮ ссылку `s.events` (меняется только при
  // реальном изменении стора). Фильтрацию/сортировку выносим в useMemo.
  // Если возвращать новый массив прямо из селектора — Zustand сравнивает по
  // ссылке (Object.is), видит «изменение» на каждом рендере → бесконечный
  // re-render (React #185: Maximum update depth exceeded).
  const events = useEventStore((s) => s.events);
  const { childId, types, since, until, limit } = q;
  const typesKey = types ? types.join(',') : '';
  return useMemo(() => {
    const list = events ?? [];
    return list
      .filter(isLive)
      .filter((e) => matchesQuery(e, { childId, types, since, until, limit }))
      .slice()
      .sort((a, b) =>
        (b.recordedAt ?? b.timestamp).localeCompare(
          a.recordedAt ?? a.timestamp,
        ),
      )
      .slice(0, limit && limit > 0 ? limit : Infinity);
    // typesKey представляет содержимое types как стабильную зависимость.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, childId, typesKey, since, until, limit]);
}