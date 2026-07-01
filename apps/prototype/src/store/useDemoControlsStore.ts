import { create } from 'zustand';
import { resetDemoData } from '@/data/demoDataset';
import { useEventStore } from '@/store/useEventStore';

interface DemoControlsState {
  // Selected child for specialist view (across pages)
  selectedChildId: string;
  setSelectedChild: (childId: string) => void;

  // Reset demo data — re-seed event store
  resetEvents: () => number;
}

export const useDemoControlsStore = create<DemoControlsState>((set) => ({
  selectedChildId: 'child-alikhan',
  setSelectedChild: (childId) => set({ selectedChildId: childId }),

  resetEvents: () => {
    const fresh = resetDemoData();
    useEventStore.setState({ events: fresh });
    set({ selectedChildId: 'child-alikhan' });
    return fresh.length;
  },
}));