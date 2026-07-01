import React from 'react';
import clsx from 'clsx';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoleStore } from '@/store/useRoleStore';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

type TopBarVariant = 'compact' | 'child' | 'standard';

interface TopBarProps {
  /**
   * Variant:
   * - `compact`   — просто иконка бренда + title (используется в child экранах).
   * - `child`     — child-friendly: аватар-маскот + имя ребёнка + actions.
   * - `standard`  — стандартный: brand иконка + роль + bell (для parent/tutor/specialist).
   */
  variant?: TopBarVariant;
  /** Заголовок (используется в compact variant). */
  title?: string;
  /** Subtitle под заголовком. */
  subtitle?: string;
  /** Action-кнопка справа (icon, label или JSX). */
  rightAction?: React.ReactNode;
  /** Кастомная левая часть (например, кнопка назад). */
  leftSlot?: React.ReactNode;
  /** Показывать ли колокольчик (только для standard). */
  showBell?: boolean;
  className?: string;
}

/**
 * TopBar — единый заголовок приложения.
 *
 * Извлечён из AppShell для переиспользования:
 * - Child screens: `variant="child"` (маскот + имя + actions).
 * - Compact screen: `variant="compact"` (brand иконка + title).
 * - Standard: brand иконка + роль + bell (parent/tutor/specialist).
 *
 * Sticky сверху, мягкий blur фон, нижняя тонкая линия.
 */
export const TopBar: React.FC<TopBarProps> = ({
  variant = 'standard',
  title,
  subtitle,
  rightAction,
  leftSlot,
  showBell = true,
  className,
}) => {
  const { currentRole } = useRoleStore();
  const navigate = useNavigate();
  const { events } = useEventStore();

  const notifCount = events.filter(
    (e) =>
      e.childId === DEMO_PRIMARY_CHILD.id &&
      (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist'),
  ).length;

  // Compact (child screens): brand icon + title + actions
  if (variant === 'compact') {
    return (
      <header
        className={clsx(
          'sticky top-0 z-30 bg-bg/85 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft',
          className,
        )}
      >
        {leftSlot ?? (
          <button
            onClick={() => navigate('/overview')}
            className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
            aria-label="На главную"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 21s-7-4.5-9-9c-1.5-3.4 0.8-7.4 4.4-7.4 1.9 0 3.6 1.1 4.6 2.7 1-1.6 2.7-2.7 4.6-2.7 3.6 0 5.9 4 4.4 7.4-2 4.5-9 9-9 9Z"
                fill="#071B3A"
                fillOpacity="0.9"
              />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0 px-3 text-center">
          {title && (
            <h1 className="text-base font-black text-ink truncate">{title}</h1>
          )}
          {subtitle && (
            <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {showBell && (
            <button
              onClick={() => navigate('/parent/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4 text-ink" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {Math.min(notifCount, 9)}
                </span>
              )}
            </button>
          )}
        </div>
      </header>
    );
  }

  // Child variant: маскот-аватар + имя ребёнка + действия
  if (variant === 'child') {
    return (
      <header
        className={clsx(
          'sticky top-0 z-30 bg-bg/85 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft',
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/overview')}
            className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft flex-shrink-0"
            aria-label="На главную"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 21s-7-4.5-9-9c-1.5-3.4 0.8-7.4 4.4-7.4 1.9 0 3.6 1.1 4.6 2.7 1-1.6 2.7-2.7 4.6-2.7 3.6 0 5.9 4 4.4 7.4-2 4.5-9 9-9 9Z"
                fill="#071B3A"
                fillOpacity="0.9"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="text-xs text-muted leading-none mb-0.5">Qoldau AI</p>
            <p className="text-sm font-black text-ink leading-none truncate">
              {DEMO_PRIMARY_CHILD.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightAction}
          {showBell && (
            <button
              onClick={() => navigate('/parent/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4 text-ink" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {Math.min(notifCount, 9)}
                </span>
              )}
            </button>
          )}
        </div>
      </header>
    );
  }

  // Standard: brand иконка + роль + bell (для parent/tutor/specialist)
  return (
    <header
      className={clsx(
        'sticky top-0 z-30 bg-bg/85 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/overview')}
          className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
          aria-label="На главную"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path
              d="M12 21s-7-4.5-9-9c-1.5-3.4 0.8-7.4 4.4-7.4 1.9 0 3.6 1.1 4.6 2.7 1-1.6 2.7-2.7 4.6-2.7 3.6 0 5.9 4 4.4 7.4-2 4.5-9 9-9 9Z"
              fill="#071B3A"
              fillOpacity="0.9"
            />
          </svg>
        </button>
        <div>
          <p className="text-xs text-muted leading-none mb-0.5">Qoldau AI</p>
          <p className="text-sm font-black text-ink leading-none">
            {currentRole === 'parent' && 'Родитель'}
            {currentRole === 'child' && DEMO_PRIMARY_CHILD.name}
            {currentRole === 'tutor' && 'Тьютор'}
            {currentRole === 'specialist' && 'Специалист'}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/parent/notifications')}
        className="relative w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
        aria-label="Уведомления"
      >
        <Bell className="w-4 h-4 text-ink" />
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
            {Math.min(notifCount, 9)}
          </span>
        )}
      </button>
    </header>
  );
};