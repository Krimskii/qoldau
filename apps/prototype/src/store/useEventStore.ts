import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QoldauEvent, EventType } from '@/types/qoldau';
import { DEMO_EVENTS, seedDemoEvents } from '@/data/demoScenario';

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
        const newEvent: QoldauEvent = {
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
        return newEvent;
      },

      addEvents: (eventsData) => {
        const newEvents = eventsData.map((eventData) => ({
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));
        set((state) => ({ events: [...newEvents, ...state.events] }));
        return newEvents;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
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
    }),
    {
      name: 'qoldau-events-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        events: state.events,
        clarifyingAnswers: state.clarifyingAnswers,
      }),
      onRehydrateStorage: () => (state) => {
        // Если событий нет (первый запуск) — сидим демо-сценарий для onboarding.
        if (state && state.events.length === 0) {
          state.events = seedDemoEvents(DEMO_EVENTS);
        }
      },
      version: 2,
    },
  ),
);

export { DEMO_BASE_DATE };
