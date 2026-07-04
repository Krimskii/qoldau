import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QoldauEvent, EventType, EventSource } from '@/types/qoldau';
import { DEMO_EVENTS, seedDemoEvents } from '@/data/demoScenario';
import { getProfileMode } from '@/data/demoDataset';

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
    event: Omit<
      QoldauEvent,
      'id' | 'schemaVersion' | 'occurredAt' | 'recordedAt' | 'source' | 'timestamp'
    > & { timestamp?: string; source?: QoldauEvent['source'] },
  ) => QoldauEvent;
  addEvents: (
    events: Array<
      Omit<
        QoldauEvent,
        'id' | 'schemaVersion' | 'occurredAt' | 'recordedAt' | 'source' | 'timestamp'
      > & { timestamp?: string; source?: QoldauEvent['source'] }
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
        // v1.5+: гарантируем schemaVersion/occurredAt/recordedAt/source.
        // Если вызывающий код не передал их явно — проставляем дефолты.
        const now = new Date().toISOString();
        const partial = eventData as Partial<QoldauEvent> & { sourceRole: QoldauEvent['sourceRole'] };
        const newEvent: QoldauEvent = {
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          schemaVersion: partial.schemaVersion ?? 3,
          occurredAt: partial.occurredAt ?? partial.timestamp ?? now,
          recordedAt: partial.recordedAt ?? now,
          source: partial.source ?? defaultSourceFromRole(eventData.sourceRole),
          // timestamp остаётся обязательным (обратная совместимость).
          timestamp: partial.timestamp ?? partial.occurredAt ?? now,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
        return newEvent;
      },

      addEvents: (eventsData) => {
        const now = new Date().toISOString();
        const newEvents = eventsData.map((eventData) => {
          const partial = eventData as Partial<QoldauEvent> & { sourceRole: QoldauEvent['sourceRole'] };
          return {
            ...eventData,
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            schemaVersion: partial.schemaVersion ?? 3,
            occurredAt: partial.occurredAt ?? partial.timestamp ?? now,
            recordedAt: partial.recordedAt ?? now,
            source: partial.source ?? defaultSourceFromRole(eventData.sourceRole),
            timestamp: partial.timestamp ?? partial.occurredAt ?? now,
          } as QoldauEvent;
        });
        set((state) => ({ events: [...newEvents, ...state.events] }));
        return newEvents;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent: (id) => {
        // Soft-delete: помечаем, не удаляем. EventStorage.query фильтрует.
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, deleted: true } : e,
          ),
        }));
      },

      getEventsByType: (type) =>
        get().events.filter((e) => e.type === type && !e.deleted),

      getEventsByTypeAndDate: (types, date) =>
        get().events.filter(
          (e) =>
            types.includes(e.type) &&
            !e.deleted &&
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
      version: 3,
      // v1.5+ — миграция v2 → v3: добавляем обязательные поля
      // schemaVersion/occurredAt/recordedAt/source. Старые события не
      // теряются и не дублируются. v0/v1 не рассматриваем (устаревшие
      // до zustand-persist migrate).
      migrate: (persistedState: unknown, fromVersion: number) => {
        const state = (persistedState ?? {}) as {
          events?: QoldauEvent[];
          clarifyingAnswers?: Record<string, string>;
        };
        if (fromVersion < 3 && Array.isArray(state.events)) {
          state.events = state.events.map((e) => migrateEvent(e as unknown as Record<string, unknown>));
        }
        return state;
      },
    },
  ),
);

/**
 * Миграция одного события v0/v1/v2 → v3.
 * - timestamp сохраняется как fallback и как поле совместимости.
 * - occurredAt/recordedAt по умолчанию = timestamp (мы не знаем точнее).
 * - source выводится из sourceRole: child→child_ui, ai/voice_observation→voice,
 *   остальное→manual.
 */
function migrateEvent(e: Record<string, unknown>): QoldauEvent {
  const ts = (e.timestamp as string) ?? new Date().toISOString();
  const sourceRole = e.sourceRole as QoldauEvent['sourceRole'] | undefined;
  return {
    ...(e as unknown as QoldauEvent),
    schemaVersion: 3,
    occurredAt: (e.occurredAt as string) ?? ts,
    recordedAt: (e.recordedAt as string) ?? ts,
    source: (e.source as EventSource) ?? defaultSourceFromRole(sourceRole),
    timestamp: ts,
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
