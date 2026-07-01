import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { resetDemoData } from '@/data/demoDataset';
import { useEventStore } from '@/store/useEventStore';
import { useRoleStore } from '@/store/useRoleStore';

interface DemoControlsState {
  // Selected child for specialist view (across pages)
  selectedChildId: string;
  setSelectedChild: (childId: string) => void;

  // Reset demo data — clears persisted state across all stores,
  // re-seeds event store, restores default child + role.
  resetEvents: () => number;
}

const DEFAULT_CHILD_ID = 'child-alikhan';
const DEFAULT_ROLE = 'parent' as const;

export const useDemoControlsStore = create<DemoControlsState>()(
  persist(
    (set) => ({
      selectedChildId: DEFAULT_CHILD_ID,
      setSelectedChild: (childId) => set({ selectedChildId: childId }),

      resetEvents: () => {
        // 1. Clear EventStore (events + clarifyingAnswers) and re-seed.
        const fresh = resetDemoData();
        useEventStore.getState().clearAll();
        useEventStore.setState({ events: fresh });
        useEventStore.getState().resetClarifyingAnswers();

        // 2. Restore default selected child.
        set({ selectedChildId: DEFAULT_CHILD_ID });

        // 3. Restore default role (parent).
        useRoleStore.getState().setRole(DEFAULT_ROLE);

        return fresh.length;
      },
    }),
    {
      name: 'qoldau-demo-controls-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedChildId: state.selectedChildId }),
      version: 1,
    },
  ),
);