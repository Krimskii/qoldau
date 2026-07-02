import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, isApiAvailable } from '@/api/client';

/**
 * Запись голоса ребёнка (v0.3.23 → v0.4.0).
 *
 * v0.3.23: хранится в localStorage, синхронизируется с API при наличии.
 * v0.4.0: при доступном backend — записи хранятся на сервере, локально — кеш.
 *
 * На каждую запись также создаётся `voice_observation` event для parent timeline.
 */
export interface Recording {
  id: string;
  childId: string;
  /** Лейбл записи (мок-распознанное слово, e.g. "Я хочу пить") */
  label: string;
  /** Длительность в секундах */
  durationSec: number;
  /** ISO 8601 */
  timestamp: string;
}

interface RecordingsState {
  recordings: Recording[];
  /** Подключены ли к backend (v0.4.0). */
  apiMode: boolean;
  /** Добавить запись, возвращает созданный объект (с id + timestamp) */
  addRecording: (r: Omit<Recording, 'id' | 'timestamp'>) => Recording;
  /** Удалить запись по id */
  removeRecording: (id: string) => void;
  /** Очистить все */
  clearAll: () => void;
  /** Загрузить с API (v0.4.0). */
  loadFromApi: () => Promise<void>;
}

export const useRecordingsStore = create<RecordingsState>()(
  persist(
    (set, get) => ({
      recordings: [],
      apiMode: false,

      addRecording: (r) => {
        const recording: Recording = {
          ...r,
          id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        // Оптимистичное обновление
        set((state) => ({ recordings: [recording, ...state.recordings] }));
        // Фоновая синхронизация с API
        if (get().apiMode) {
          api.recordings.create(r as unknown as Record<string, unknown>).catch((err) => {
            if (import.meta.env.DEV) console.warn('[useRecordingsStore] API create failed, kept local:', err);
          });
        }
        return recording;
      },

      removeRecording: (id) => {
        set((state) => ({ recordings: state.recordings.filter((r) => r.id !== id) }));
        if (get().apiMode) {
          api.recordings.delete(id).catch(() => {});
        }
      },

      clearAll: () => set({ recordings: [] }),

      loadFromApi: async () => {
        try {
          const available = await isApiAvailable();
          if (!available) return;
          const res = await api.recordings.list();
          const remote = (res as { recordings: Recording[] }).recordings;
          set({ recordings: remote, apiMode: true });
          if (import.meta.env.DEV) console.info(`[useRecordingsStore] Loaded ${remote.length} recordings from API`);
        } catch (err) {
          if (import.meta.env.DEV) console.warn('[useRecordingsStore] Failed to load from API:', err);
        }
      },
    }),
    {
      name: 'qoldau-recordings-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recordings: state.recordings }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loadFromApi();
        }
      },
      version: 1,
    },
  ),
);