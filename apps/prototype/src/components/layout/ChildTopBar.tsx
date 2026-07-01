import React from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { Bell2DIcon, Settings2DIcon } from '@/components/icons/child2d';

interface ChildTopBarProps {
  /** Кастомный action справа (например, назад на sub-странице). */
  rightAction?: React.ReactNode;
  /** Показывать ли кнопку настроек. */
  showSettings?: boolean;
  className?: string;
}

/**
 * ChildTopBar — заголовок для child screens (v0.3.15).
 *
 * Структура:
 * - Avatar: 46×46, gradient teal-300→teal-500, rounded 16px, белая буква
 *   (первая буква имени ребёнка) с shadow.
 * - Brand: "Qoldau AI" (12px) + "Алихан" (19px font-black).
 * - Top actions: 44×44 icon-buttons (bell с notification dot, settings).
 *
 * Sticky сверху без border (визуально часть экрана, не отдельный header).
 */
export const ChildTopBar: React.FC<ChildTopBarProps> = ({
  rightAction,
  showSettings = true,
  className,
}) => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const child = DEMO_PRIMARY_CHILD;
  const firstLetter = child.name.charAt(0).toUpperCase();

  const notifCount = events.filter(
    (e) =>
      e.childId === child.id &&
      (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist'),
  ).length;

  return (
    <header
      className={clsx('flex items-center gap-3 px-5 pt-4 pb-1.5', className)}
    >
      {/* Avatar */}
      <div
        className="w-[46px] h-[46px] rounded-2xl flex-none flex items-center justify-center text-white font-black text-lg shadow-card"
        style={{
          background: 'linear-gradient(140deg, #7fd1c9 0%, #1ba39a 100%)',
        }}
        aria-hidden="true"
      >
        {firstLetter}
      </div>

      {/* Brand */}
      <div className="leading-tight">
        <div className="text-xs text-ink-soft font-semibold">Qoldau AI</div>
        <div className="text-[19px] font-black text-ink">{child.name}</div>
      </div>

      {/* Top actions */}
      <div className="ml-auto flex gap-2.5">
        {rightAction}
        <button
          onClick={() => navigate('/parent/notifications')}
          className="relative w-11 h-11 rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Уведомления"
        >
          <Bell2DIcon size={22} />
          {notifCount > 0 && (
            <span
              className="absolute w-4 h-4 rounded-full bg-[#c95f5f] text-white text-[10px] font-bold flex items-center justify-center"
              style={{ transform: 'translate(11px, -11px)' }}
              aria-label={`${Math.min(notifCount, 9)} новых`}
            >
              {Math.min(notifCount, 9)}
            </span>
          )}
        </button>
        {showSettings && (
          <button
            onClick={() => navigate('/child/interface-guide')}
            className="w-11 h-11 rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
            aria-label="Что важно в интерфейсе"
          >
            <Settings2DIcon size={22} />
          </button>
        )}
      </div>
    </header>
  );
};