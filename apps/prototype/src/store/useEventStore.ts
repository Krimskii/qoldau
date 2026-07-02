import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QoldauEvent, EventType } from '@/types/qoldau';
import { DEMO_EVENTS, seedDemoEvents } from '@/data/demoScenario';
import { api, isApiAvailable } from '@/api/client';

interface ClarifyingAnswers {
  [question: string]: string;
}

interface EventState {
  events: QoldauEvent[];
  clarifyingAnswers: ClarifyingAnswers;
  /** Подключены ли мы к backend API (v0.4.0). */
  apiMode: boolean;
  /** Идёт ли загрузка с API (v0.6.3) — для skeleton. */
  isLoading: boolean;
  /** Текст последней ошибки (v0.6.3) — для offline-состояния. */
  error: string | null;

  // Actions
  setEvents: (events: QoldauEvent[]) => void;
  addEvent: (event: Omit<QoldauEvent, 'id'>) => QoldauEvent;
  addEvents: (events: Omit<QoldauEvent, 'id'>[]) => QoldauEvent[];
  updateEvent: (id: string, updates: Partial<QoldauEvent>) => void;
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

  /** Загрузить события с API (если доступен) — v0.4.0. */
  loadFromApi: () => Promise<void>;
}

const DEMO_BASE_DATE = '2026-07-01T10:30:00';

/**
 * useEventStore (v0.4.0) — теперь опционально синхронизируется с backend API.
 *
 * Если API доступен (VITE_API_BASE_URL задан и сервер отвечает):
 * - При mount: loadFromApi() подгружает события с сервера.
 * - Запись событий: оптимистично добавляем локально, POST на сервер в фоне.
 *
 * Если API недоступен: работает как раньше (localStorage + seed).
 */
export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      clarifyingAnswers: {},
      apiMode: false,
      isLoading: false,
      error: null,

      setEvents: (events) => set({ events }),

      addEvent: (eventData) => {
        const newEvent: QoldauEvent = {
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        };
        // Оптимистичное обновление UI
        set((state) => ({ events: [newEvent, ...state.events] }));
        // Фоновая синхронизация с API (неблокирующе)
        if (get().apiMode) {
          api.events.create(eventData as unknown as Record<string, unknown>).then((res) => {
            // Заменяем локальный id на серверный
            const serverId = (res as { event: { id: string } }).event.id;
            set((state) => ({
              events: state.events.map((e) => (e.id === newEvent.id ? { ...e, id: serverId } : e)),
            }));
          }).catch((err) => {
            if (import.meta.env.DEV) console.warn('[useEventStore] API create failed, kept local:', err);
          });
        }
        return newEvent;
      },

      addEvents: (eventsData) => {
        const newEvents = eventsData.map((eventData) => ({
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));
        set((state) => ({ events: [...newEvents, ...state.events] }));
        // POST каждое событие в API (fire-and-forget)
        if (get().apiMode) {
          eventsData.forEach((eventData, idx) => {
            api.events.create(eventData as unknown as Record<string, unknown>).catch(() => {
              // Игнорируем — событие уже локально
              void idx;
            });
          });
        }
        return newEvents;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
        if (get().apiMode) {
          api.events.update(id, updates as unknown as Record<string, unknown>).catch(() => {});
        }
      },

      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
        if (get().apiMode) {
          api.events.delete(id).catch(() => {});
        }
      },

      getEventsByType: (type) => get().events.filter((e) => e.type === type),

      getEventsByTypeAndDate: (types, date) =>
        get().events.filter((e) => types.includes(e.type) && e.timestamp.startsWith(date)),

      setClarifyingAnswer: (question, answer) =>
        set((state) => ({
          clarifyingAnswers: { ...state.clarifyingAnswers, [question]: answer },
        })),

      getClarifyingAnswer: (question) => get().clarifyingAnswers[question] || '',

      resetClarifyingAnswers: () => set({ clarifyingAnswers: {} }),

      ensureDemoEvents: () =>
        set((state) => ({ events: seedDemoEvents(state.events) })),

      clearAll: () => set({ events: [], clarifyingAnswers: {} }),

      loadFromApi: async () => {
        set({ isLoading: true, error: null });
        try {
          const available = await isApiAvailable();
          if (!available) {
            if (import.meta.env.DEV) console.info('[useEventStore] API unavailable, using local mock data');
            set({ isLoading: false, error: 'API недоступен' });
            return;
          }
          const res = await api.events.list();
          const remoteEvents = (res as { events: QoldauEvent[] }).events;
          set({ events: remoteEvents, apiMode: true, isLoading: false });
          if (import.meta.env.DEV) console.info(`[useEventStore] Loaded ${remoteEvents.length} events from API`);
        } catch (err) {
          if (import.meta.env.DEV) console.warn('[useEventStore] Failed to load from API, using local:', err);
          set({ isLoading: false, error: err instanceof Error ? err.message : String(err) });
        }
      },
    }),
    {
      name: 'qoldau-events-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        events: state.events,
        clarifyingAnswers: state.clarifyingAnswers,
      }),
      onRehydrateStorage: () => (state) => {
        // Hydrate: если событий нет — сидим демо. Затем пытаемся загрузить с API.
        if (state && state.events.length === 0) {
          state.events = seedDemoEvents(DEMO_EVENTS);
        }
        // Fire-and-forget API load (async, не блокирует UI)
        if (state) {
          state.loadFromApi();
        }
      },
      version: 2,
    },
  ),
);

export { DEMO_BASE_DATE };