import React from 'react';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';
import { ChevronDown } from 'lucide-react';

export const ChildSelector: React.FC = () => {
  const { selectedChildId, setSelectedChild } = useDemoControlsStore();
  const selected = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  return (
    <div className="bg-white border border-line rounded-2xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DDF5F0] to-[#E8F3FF] border border-line flex items-center justify-center font-bold text-teal-dark flex-shrink-0">
        {selected.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted">Ребёнок</p>
        <p className="text-sm font-bold truncate">
          {selected.name}, {selected.age} лет
        </p>
      </div>
      <div className="relative">
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="appearance-none bg-teal-soft text-teal-dark font-bold text-xs pl-3 pr-7 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal"
          aria-label="Выбрать ребёнка"
        >
          {DEMO_CHILDREN.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.age} лет
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-teal-dark absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};