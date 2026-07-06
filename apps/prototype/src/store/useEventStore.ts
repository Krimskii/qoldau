import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QoldauEvent, EventType, EventSource } from '@/types/qoldau';
import { DEMO_EVENTS, seedDemoEvents } from '@/data/demoScenario';
import { getProfileMode } from '@/data/demoDataset';

/**
 * v1.6 E9.2: glue-функция для sync-триггера без circular-import.
 * syncService.registerEventTrigger(fn) устанавливает этот callback.
 * useEventStore вызывает notifyLocalChangeDebounced(childId) после мутаций.
 * Если callback не зарегистрирован (demo, syncService не загружен) —
 * noop (старое локальное поведение).
 */
type TriggerFn = (childId: string) => void;
let triggerFn: TriggerFn | null = null;
export function notifyLocalChangeDebounced(childId: string): void {
  triggerFn?.(childId);
}
export function _setLocalChangeTrigger(fn: TriggerFn | null): void {
  triggerFn = fn;
}

interface ClarifyingAnswers {
  [question: string]: string;
}

interface EventState {
  events: QoldauEvent[];
  clarifyingAnswers: ClarifyingAnswers;
  /**
   * Всегда false. Backend — stateless AI-прокси без БД и без /api/events;
   * лента событий живёт только на устройстве (localStorage). Поле сохранено
   * для обратной совместимости чтения (VoiceObservation) и как явный флаг
   * "данные per-device". Реальная синхронизация появится в v2.x (см. STRATEGY §6.4).
   */
  apiMode: boolean;

  // Actions
  setEvents: (events: QoldauEvent[]) => void;
  /**
   * v1.5+: поля schemaVersion/occurredAt/recordedAt/source/timestamp
   * автоматически заполняются дефолтами, если не переданы — вызывающий
   * код остаётся компактным.
   */
  addEvent: (
    // v1.6 E9.3: updatedAt/deletedAt опциональны — стор проставит
    // updatedAt=now и deletedAt=null если не переданы (не ломает существующие
    // вызовы addEvent со старым API).
    event: Omit<
      QoldauEvent,
      'id' | 'schemaVersion' | 'occurredAt' | 'recordedAt' | 'source' | 'timestamp' | 'updatedAt' | 'deletedAt'
    > & { timestamp?: string; source?: QoldauEvent['source']; updatedAt?: string; deletedAt?: string | null },
  ) => QoldauEvent;
  addEvents: (
    events: Array<
      Omit<
        QoldauEvent,
        'id' | 'schemaVersion' | 'occurredAt' | 'recordedAt' | 'source' | 'timestamp' | 'updatedAt' | 'deletedAt'
      > & { timestamp?: string; source?: QoldauEvent['source']; updatedAt?: string; deletedAt?: string | null }
    >,
  ) => QoldauEvent[];
  updateEvent: (id: string, updates: Partial<QoldauEvent>) => void;
  /**
   * Soft-delete: помечает событие как deleted=true. Данные остаются в сторе,
   * но {@link useEventQuery} (EventStorage) их не возвращает. История
   * сохраняется для аналитики/ABC.
   */
  deleteEvent: (id: string) => void;
  getEventsByType: (type: EventType) => QoldauEvent[];
  getEventsByTypeAndDate: (types: EventType[], date: string) => QoldauEvent[];
  setClarifyingAnswer: (question: string, answer: string) => void;
  getClarifyingAnswer: (question: string) => string;
  resetClarifyingAnswers: () => void;

  // Demo helpers
  ensureDemoEvents: () => void;
  /** Полный сброс — очищает events и answers, оставляет стор пустым. */
  clearAll: () => void;
}

const DEMO_BASE_DATE = '2026-07-01T10:30:00';

/**
 * useEventStore — единый источник правды для событий на устройстве (per-device).
 *
 * Данные хранятся в localStorage через persist. Backend не участвует: stateless
 * AI-прокси только распознаёт голос и не хранит ленту. Все CRUD-операции —
 * локальные и синхронные. Голосовой пайплайн (VoiceObservation) добавляет
 * распознанные события через addEvents().
 */
export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      clarifyingAnswers: {},
      apiMode: false,

      setEvents: (events) => set({ events }),

      addEvent: (eventData) => {
        // v1.5+ → v1.6 E9.3: гарантируем schemaVersion/occurredAt/recordedAt/source
        // + updatedAt. Если вызывающий код не передал их явно — проставляем дефолты.
        const now = new Date().toISOString();
        const partial = eventData as Partial<QoldauEvent> & { sourceRole: QoldauEvent['sourceRole'] };
        const newEvent: QoldauEvent = {
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          schemaVersion: partial.schemaVersion ?? 4,
          occurredAt: partial.occurredAt ?? partial.timestamp ?? now,
          recordedAt: partial.recordedAt ?? now,
          source: partial.source ?? defaultSourceFromRole(eventData.sourceRole),
          // timestamp остаётся обязательным (обратная совместимость).
          timestamp: partial.timestamp ?? partial.occurredAt ?? now,
          updatedAt: partial.updatedAt ?? now,
          deletedAt: partial.deletedAt ?? null,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
        // v1.6 E9.2: триггерим debounced sync (через subscribe в syncService —
        // здесь прямого импорта нет, чтобы избежать circular).
        notifyLocalChangeDebounced(newEvent.childId);
        return newEvent;
      },

      addEvents: (eventsData) => {
        const now = new Date().toISOString();
        const newEvents = eventsData.map((eventData) => {
          const partial = eventData as Partial<QoldauEvent> & { sourceRole: QoldauEvent['sourceRole'] };
          return {
            ...eventData,
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            schemaVersion: partial.schemaVersion ?? 4,
            occurredAt: partial.occurredAt ?? partial.timestamp ?? now,
            recordedAt: partial.recordedAt ?? now,
            source: partial.source ?? defaultSourceFromRole(eventData.sourceRole),
            timestamp: partial.timestamp ?? partial.occurredAt ?? now,
            updatedAt: partial.updatedAt ?? now,
            deletedAt: partial.deletedAt ?? null,
          } as QoldauEvent;
        });
        set((state) => ({ events: [...newEvents, ...state.events] }));
        // v1.6 E9.2: один триггер на пачку.
        if (newEvents[0]) notifyLocalChangeDebounced(newEvents[0].childId);
        return newEvents;
      },

      updateEvent: (id, updates) => {
        // v1.6 E9.3: любой update проставляет updatedAt = now (нужно для sync LWW).
        let childId: string | null = null;
        set((state) => ({
          events: state.events.map((e) => {
            if (e.id !== id) return e;
            childId = e.childId;
            return { ...e, ...updates, updatedAt: new Date().toISOString() };
          }),
        }));
        if (childId) notifyLocalChangeDebounced(childId);
      },

      deleteEvent: (id) => {
        // v1.6 E9.3: soft-delete через deletedAt (ISO), не boolean.
        let childId: string | null = null;
        set((state) => ({
          events: state.events.map((e) => {
            if (e.id !== id) return e;
            childId = e.childId;
            return { ...e, deletedAt: new Date().toISOString(), deleted: undefined, updatedAt: new Date().toISOString() };
          }),
        }));
        if (childId) notifyLocalChangeDebounced(childId);
      },

      getEventsByType: (type) =>
        get().events.filter((e) => e.type === type && !e.deletedAt),

      getEventsByTypeAndDate: (types, date) =>
        get().events.filter(
          (e) =>
            types.includes(e.type) &&
            !e.deletedAt &&
            e.timestamp.startsWith(date),
        ),

      setClarifyingAnswer: (question, answer) =>
        set((state) => ({
          clarifyingAnswers: { ...state.clarifyingAnswers, [question]: answer },
        })),

      getClarifyingAnswer: (question) => get().clarifyingAnswers[question] || '',

      resetClarifyingAnswers: () => set({ clarifyingAnswers: {} }),

      ensureDemoEvents: () =>
        set((state) => ({ events: seedDemoEvents(state.events) })),

      clearAll: () => set({ events: [], clarifyingAnswers: {} }),
    }),
    {
      name: 'qoldau-events-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        events: state.events,
        clarifyingAnswers: state.clarifyingAnswers,
      }),
      onRehydrateStorage: () => (state) => {
        // Если событий нет (первый запуск) И профиль в demo-режиме —
        // сидим демо-сценарий для onboarding. В real-режиме (пилотная
        // семья прошла FamilySetupCard) пустая лента остаётся пустой
        // до первой записи голосом / AAC / фразой. См. ticket
        // docs/tickets/MINIMAX_v1.0.x_real_family_clean_start.md.
        if (
          state &&
          state.events.length === 0 &&
          getProfileMode() !== 'real'
        ) {
          state.events = seedDemoEvents(DEMO_EVENTS);
        }
      },
      version: 4,
      // v1.5+ → v1.6 E9.3 — миграция v3 → v4: добавляем sync-поля
      // (updatedAt, deletedAt). Также работает v2 → v4: schemaVersion/occurredAt/
      // recordedAt/source + updatedAt/deletedAt. v0/v1 не рассматриваем.
      migrate: (persistedState: unknown, fromVersion: number) => {
        const state = (persistedState ?? {}) as {
          events?: QoldauEvent[];
          clarifyingAnswers?: Record<string, string>;
        };
        if (fromVersion < 4 && Array.isArray(state.events)) {
          state.events = state.events.map((e) =>
            migrateEvent(e as unknown as Record<string, unknown>, fromVersion)
          );
        }
        return state;
      },
    },
  ),
);

/**
 * Миграция одного события v0/v1/v2/v3 → v4.
 * - updatedAt: fallback к recordedAt (или timestamp для v0/v1).
 * - deletedAt: boolean deleted → ISO|null.
 */
function migrateEvent(e: Record<string, unknown>, _fromVersion: number): QoldauEvent {
  const ts = (e.timestamp as string) ?? new Date().toISOString();
  const sourceRole = e.sourceRole as QoldauEvent['sourceRole'] | undefined;
  const recordedAt = (e.recordedAt as string) ?? ts;
  const updatedAt = (e.updatedAt as string) ?? recordedAt;
  // deletedAt migration: v3 boolean → v4 ISO|null
  let deletedAt: string | null | undefined = e.deletedAt as string | null | undefined;
  if (deletedAt === undefined && e.deleted === true) {
    deletedAt = recordedAt;
  } else if (deletedAt === undefined) {
    deletedAt = null;
  }
  return {
    ...(e as unknown as QoldauEvent),
    schemaVersion: 4,
    occurredAt: (e.occurredAt as string) ?? ts,
    recordedAt,
    source: (e.source as EventSource) ?? defaultSourceFromRole(sourceRole),
    timestamp: ts,
    updatedAt,
    deletedAt,
  };
}

/**
 * Дефолтный EventSource на основе sourceRole.
 * Используется в addEvent/addEvents/migrate как fallback.
 */
function defaultSourceFromRole(
  role: QoldauEvent['sourceRole'] | undefined,
): EventSource {
  switch (role) {
    case 'child':
      return 'child_ui';
    case 'ai':
      return 'voice';
    case 'parent':
    case 'tutor':
    case 'specialist':
    case 'device':
    case undefined:
    default:
      return 'manual';
  }
}

export { DEMO_BASE_DATE, migrateEvent, defaultSourceFromRole };
