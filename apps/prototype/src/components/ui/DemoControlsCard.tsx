/**
 * DemoControlsCard (v0.6.8) — карточка сброса demo-данных на landing.
 *
 * Кнопка "Сбросить демо-данные" вызывает useDemoControlsStore.resetEvents().
 * Показывает последнее время сброса.
 */
import React, { useState } from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';
import { QoldauCard } from './QoldauCard';
import { AppIcon } from './AppIcon';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { formatTime } from '@/utils/dateFormat';

export const DemoControlsCard: React.FC = () => {
  const resetEvents = useDemoControlsStore((s) => s.resetEvents);
  const [lastReset, setLastReset] = useState<number | null>(null);
  const [resetCount, setResetCount] = useState<number | null>(null);

  const handleReset = () => {
    const count = resetEvents();
    setLastReset(Date.now());
    setResetCount(count);
  };

  return (
    <QoldauCard variant="elevated" padding="md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-soft flex items-center justify-center shrink-0">
          <AppIcon component={Sparkles} size={18} colorClass="text-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-ink">Demo-данные</h3>
          <p className="text-xs text-muted leading-relaxed mt-0.5">
            Сброс восстанавливает 3 ребёнка, 13 событий, родительскую роль.
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white text-xs font-bold shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <AppIcon component={RotateCcw} size={14} colorClass="text-white" />
              Сбросить
            </button>
            {lastReset && (
              <span className="text-[10px] text-muted flex items-center gap-1">
                <AppIcon component={Check} size={12} colorClass="text-teal" />
                {resetCount} событий · {formatTime(lastReset)}
              </span>
            )}
          </div>
        </div>
      </div>
    </QoldauCard>
  );
};