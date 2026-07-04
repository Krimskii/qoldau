import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Запись голоса ребёнка — per-device (localStorage).
 *
 * Backend — stateless AI-прокси без БД (нет /api/recordings), поэтому записи
 * живут только на устройстве. На каждую запись также создаётся
 * `voice_observation` event для parent timeline (см. вызывающий код).
 */
export interface Recording {
  id: string;
  childId: string;
  /** Лейбл записи (распознанное слово, e.g. "Я хочу пить") */
  label: string;
  /** Длительность в секундах */
  durationSec: number;
  /** ISO 8601 */
  timestamp: string;
}

interface RecordingsState {
  recordings: Recording[];
  /** Всегда false — данные per-device (см. useEventStore.apiMode). */
  apiMode: boolean;
  /** Добавить запись, возвращает созданный объект (с id + timestamp) */
  addRecording: (r: Omit<Recording, 'id' | 'timestamp'>) => Recording;
  /** Удалить запись по id */
  removeRecording: (id: string) => void;
  /** Очистить все */
  clearAll: () => void;
}

export const useRecordingsStore = create<RecordingsState>()(
  persist(
    (set) => ({
      recordings: [],
      apiMode: false,

      addRecording: (r) => {
        const recording: Recording = {
          ...r,
          id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ recordings: [recording, ...state.recordings] }));
        return recording;
      },

      removeRecording: (id) => {
        set((state) => ({ recordings: state.recordings.filter((r) => r.id !== id) }));
      },

      clearAll: () => set({ recordings: [] }),
    }),
    {
      name: 'qoldau-recordings-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recordings: state.recordings }),
      version: 1,
    },
  ),
);
