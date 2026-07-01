import { create } from 'zustand';
import { QoldauEvent, EventType } from '@/types/qoldau';
import { DEMO_EVENTS, seedDemoEvents } from '@/data/demoScenario';

interface ClarifyingAnswers {
  [question: string]: string;
}

interface EventState {
  events: QoldauEvent[];
  clarifyingAnswers: ClarifyingAnswers;
  
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
}

const DEMO_BASE_DATE = '2026-07-01T10:30:00';

// Initialize store with full 60+ demo events
const initialEvents = seedDemoEvents(DEMO_EVENTS);

export const useEventStore = create<EventState>((set, get) => ({
  events: initialEvents,
  clarifyingAnswers: {},

  setEvents: (events) => set({ events }),

  addEvent: (eventData) => {
    const newEvent: QoldauEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    set((state) => ({
      events: [newEvent, ...state.events],
    }));
    return newEvent;
  },

  addEvents: (eventsData) => {
    const newEvents = eventsData.map((eventData) => ({
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    set((state) => ({
      events: [...newEvents, ...state.events],
    }));
    return newEvents;
  },

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),

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
}));

export { DEMO_BASE_DATE };