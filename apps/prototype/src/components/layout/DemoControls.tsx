import React from 'react';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { useToastStore } from '@/store/useToastStore';
import { useDemoStore } from '@/store/useDemoStore';
import { RefreshCw } from 'lucide-react';

export const DemoControls: React.FC = () => {
  const { resetEvents } = useDemoControlsStore();
  const { showToast } = useToastStore();
  const { endDemo } = useDemoStore();

  const handleReset = () => {
    const count = resetEvents();
    endDemo();
    showToast(`Демо-данные сброшены: ${count} событий`, 'success');
  };

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-2 text-sm font-bold text-muted hover:text-teal-dark transition-colors px-3 py-2 rounded-xl hover:bg-teal-soft"
      title="Сбросить демо-данные к исходному состоянию"
    >
      <RefreshCw className="w-4 h-4" />
      Сброс демо
    </button>
  );
};