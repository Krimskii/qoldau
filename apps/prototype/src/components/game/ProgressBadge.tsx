import React from 'react';
import clsx from 'clsx';
import type { IconProps } from '@/components/icons';
import { COLOR_MAP, type QoldauIconColor } from '@/components/ui/QoldauIconCard';

/**
 * ProgressBadge — мягкий badge для DailyProgressStrip.
 * Показывает одну способность с её состоянием (сделано / ещё нет).
 */

interface ProgressBadgeProps {
  Icon: React.FC<IconProps>;
  label: string;
  done: boolean;
  color?: QoldauIconColor;
  className?: string;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  Icon,
  label,
  done,
  color = 'teal',
  className,
}) => {
  const palette = COLOR_MAP[color];

  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-shadow',
        done
          ? `${palette.bg} ${palette.border}`
          : 'border-line bg-white opacity-60',
        className,
      )}
      aria-label={`${label}: ${done ? 'сделано' : 'ещё нет'}`}
    >
      <Icon size={26} className={done ? palette.text : 'text-muted'} />
      <span className={clsx('text-[11px] font-bold leading-tight text-center', done ? palette.text : 'text-muted')}>
        {label}
      </span>
    </div>
  );
};