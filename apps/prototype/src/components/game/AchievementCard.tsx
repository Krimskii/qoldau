import React from 'react';
import clsx from 'clsx';
import { type AchievementProgress } from '@/lib/game/achievementRules';
import { COLOR_MAP } from '@/components/ui/QoldauIconCard';

/**
 * AchievementCard — мягкая карточка достижения для ChildProgress.
 *
 * Без давления: даже невыполненные показываются без негатива —
 * просто со словом «Скоро!».
 */

interface AchievementCardProps {
  achievement: AchievementProgress;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  className,
}) => {
  const { rule, done, count } = achievement;
  const palette = COLOR_MAP[rule.color];

  return (
    <div
      className={clsx(
        'rounded-2xl border-2 min-h-[110px] flex flex-col items-center justify-center gap-2 p-3 transition-shadow',
        done
          ? `${palette.bg} ${palette.border} shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]`
          : 'border-line opacity-60 bg-white',
        className,
      )}
      role="status"
      aria-label={done ? `Достижение: ${rule.label}` : `Ещё не выполнено: ${rule.label}`}
    >
      <rule.Icon size={40} className={done ? palette.text : 'text-muted'} />
      <span className="text-sm font-bold text-ink text-center leading-tight">
        {rule.label}
      </span>
      {done ? (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4EC28A] to-[#1e7a52] flex items-center justify-center text-white text-xs font-black shadow-sm">
            ✓
          </div>
          {count > 1 && (
            <span className="text-xs font-bold text-muted">×{count}</span>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted">Скоро!</span>
      )}
    </div>
  );
};