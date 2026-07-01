import { create } from 'zustand';
import { QoldauEvent } from '@/types/qoldau';
import { mockEvents } from '@/data/mockChild';

interface EventState {
  events: QoldauEvent[];
  setEvents: (events: QoldauEvent[]) => void;
  addEvent: (event: QoldauEvent) => void;
  updateEvent: (id: string, updates: Partial<QoldauEvent>) => void;
  getEventsByType: (type: QoldauEvent['type']) => QoldauEvent[];
  getEventsByDate: (date: string) => QoldauEvent[];
}

export const useEventStore = create<EventState>((set, get) => ({
  events: mockEvents,
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  getEventsByType: (type) => get().events.filter((e) => e.type === type),
  getEventsByDate: (date) =>
    get().events.filter((e) => e.timestamp.startsWith(date)),
}));
