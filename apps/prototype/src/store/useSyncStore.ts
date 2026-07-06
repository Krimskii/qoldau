/**
 * useSyncStore (v1.6 E9.2) — состояние синхронизации.
 *
 * Хранит:
 * - status: текущий статус (idle/syncing/offline/error/demo)
 * - lastSyncedAt: per-child ISO timestamp последнего успешного pull
 * - lastPushedAt: per-child ISO timestamp последнего успешного push
 * - lastError: последняя ошибка (для UI)
 * - pendingCount: сколько локальных изменений ждут push (для UI)
 *
 * Persist в localStorage (qoldau-sync-v1) — чтобы при перезагрузке не
 * качать всё заново. При logout всё чистится.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SyncStatus =
  | 'demo'        // нет jwt (VITE_ENABLE_SYNC=false или не залогинен)
  | 'idle'        // залогинен, всё синхронизировано
  | 'syncing'     // идёт pull/push
  | 'offline'     // нет сети или backend недоступен
  | 'error';      // последняя попытка упала

export interface SyncMeta {
  lastSyncedAt?: string;
  lastPushedAt?: string;
}

export interface SyncStoreState {
  status: SyncStatus;
  /** Per-child metadata. Ключ — childId. */
  perChild: Record<string, SyncMeta>;
  lastError: string | null;
  /** Количество локальных событий с updatedAt > lastPushedAt[childId]. */
  pendingCount: number;

  // Actions
  setStatus: (status: SyncStatus) => void;
  setError: (message: string | null) => void;
  setPendingCount: (n: number) => void;
  /** Записать успешный sync для child. */
  recordSynced: (childId: string, ts: string) => void;
  /** Записать успешный push для child. */
  recordPushed: (childId: string, ts: string) => void;
  /** Полная очистка (logout). */
  reset: () => void;
}

export const useSyncStore = create<SyncStoreState>()(
  persist(
    (set) => ({
      status: 'demo',
      perChild: {},
      lastError: null,
      pendingCount: 0,

      setStatus: (status) => set({ status }),
      setError: (message) => set({ lastError: message }),
      setPendingCount: (n) => set({ pendingCount: n }),

      recordSynced: (childId, ts) =>
        set((state) => ({
          perChild: {
            ...state.perChild,
            [childId]: {
              ...state.perChild[childId],
              lastSyncedAt: ts,
            },
          },
        })),

      recordPushed: (childId, ts) =>
        set((state) => ({
          perChild: {
            ...state.perChild,
            [childId]: {
              ...state.perChild[childId],
              lastPushedAt: ts,
            },
          },
        })),

      reset: () =>
        set({
          status: 'demo',
          perChild: {},
          lastError: null,
          pendingCount: 0,
        }),
    }),
    {
      name: 'qoldau-sync-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        perChild: state.perChild,
        // status/lastError/pendingCount — runtime, не персистим.
      }),
    },
  ),
);