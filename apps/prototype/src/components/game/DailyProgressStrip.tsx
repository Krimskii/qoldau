import React from 'react';
import { ProgressBadge } from './ProgressBadge';
import type { AchievementProgress } from '@/lib/game/achievementRules';

/**
 * DailyProgressStrip — горизонтальная полоса мягкого прогресса.
 *
 * Содержит только **выполненные** достижения. Без streak, без "проигрышей".
 * Если ни одно не выполнено — компонент ничего не рендерит.
 */

interface DailyProgressStripProps {
  achievements: AchievementProgress[];
  className?: string;
}

export const DailyProgressStrip: React.FC<DailyProgressStripProps> = ({
  achievements,
  className,
}) => {
  const done = achievements.filter((a) => a.done);

  if (done.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto py-2 px-1 -mx-1 ${className ?? ''}`}
      role="list"
      aria-label="Что сегодня получилось"
    >
      {done.map((a) => (
        <div key={a.rule.id} role="listitem" className="flex-shrink-0">
          <ProgressBadge
            Icon={a.rule.Icon}
            label={a.rule.label}
            done
            color={a.rule.color}
          />
        </div>
      ))}
    </div>
  );
};