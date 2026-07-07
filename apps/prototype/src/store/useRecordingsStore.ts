import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Запись голоса ребёнка — per-device.
 *
 * v1.6 F1: запись — РЕАЛЬНАЯ (MediaRecorder + Blob). Аудио хранится в
 * IndexedDB (audioBlobStore), метаданные — в localStorage. Связь через
 * `audioId`. На сервер звук НЕ грузим (per-device приватность).
 *
 * На каждую запись также создаётся `voice_observation` event для parent
 * timeline (см. вызывающий код).
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
  /** v1.6 F1: ключ Blob в IndexedDB (audioBlobStore). null если blob не сохранён. */
  audioId: string | null;
  /** v1.6 F1: распознанный текст (от Web Speech API или /api/stt). */
  transcript?: string;
  /** MIME тип blob (audio/webm и т.п.). */
  mimeType?: string;
  /** Размер blob в байтах (для UI/лимитов). */
  sizeBytes?: number;
}

interface RecordingsState {
  recordings: Recording[];
  /** Всегда false — данные per-device (см. useEventStore.apiMode). */
  apiMode: boolean;
  /** Добавить запись, возвращает созданный объект (с id + timestamp). */
  addRecording: (r: Omit<Recording, 'id' | 'timestamp'>) => Recording;
  /** Удалить запись по id (метаданные). Blob нужно чистить отдельно. */
  removeRecording: (id: string) => void;
  /** Очистить все. */
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
      version: 2,
      // v1 → v2: добавлены audioId/transcript/mimeType/sizeBytes.
      // Старые записи без audioId получают null (blob потерян — UI скроет playback).
      migrate: (persistedState, fromVersion) => {
        if (fromVersion < 2 && persistedState && typeof persistedState === 'object') {
          const state = persistedState as { recordings?: Recording[] };
          if (Array.isArray(state.recordings)) {
            state.recordings = state.recordings.map((r) => ({
              ...r,
              audioId: r.audioId ?? null,
              transcript: r.transcript,
              mimeType: r.mimeType,
              sizeBytes: r.sizeBytes,
            }));
          }
        }
        return persistedState;
      },
    },
  ),
);
