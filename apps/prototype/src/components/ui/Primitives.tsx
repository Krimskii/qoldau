import React from 'react';
import clsx from 'clsx';
import { roleColors, type RoleKey } from '@/styles/tokens';

// =============================================================================
// PrimaryAction — главная кнопка действия на странице
// =============================================================================

export interface PrimaryActionProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  block?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const PrimaryAction: React.FC<PrimaryActionProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'lg',
  block = true,
  icon,
  iconRight,
  disabled,
  className,
}) => {
  const sizeClass = clsx({
    'h-10 px-4 text-sm': size === 'sm',
    'h-12 px-5 text-base': size === 'md',
    'h-14 px-6 text-base': size === 'lg',
    'h-16 px-8 text-lg': size === 'xl',
  });

  const variantClass = clsx({
    'bg-gradient-to-br from-teal to-teal-dark text-white shadow-card hover:shadow-card-hover':
      variant === 'primary',
    'bg-white border-2 border-teal/30 text-teal-dark hover:bg-teal-soft':
      variant === 'secondary',
    'bg-transparent text-muted hover:bg-teal-soft hover:text-teal-dark':
      variant === 'ghost',
    'bg-bg text-ink hover:bg-line-soft': variant === 'soft',
    'bg-gradient-to-br from-coral to-[#cc251d] text-white shadow-card hover:shadow-card-hover':
      variant === 'danger',
  });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all select-none',
        'focus:outline-none focus:ring-4 focus:ring-teal/15 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass,
        variantClass,
        block && 'w-full',
        className,
      )}
    >
      {icon}
      <span>{label}</span>
      {iconRight}
    </button>
  );
};

// =============================================================================
// RoleBadge — бейдж роли (parent / child / tutor / specialist)
// =============================================================================

export interface RoleBadgeProps {
  role: RoleKey;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

const ROLE_LABELS: Record<RoleKey, string> = {
  overview: 'Обзор',
  parent: 'Родитель',
  child: 'Ребёнок',
  tutor: 'Тьютор',
  specialist: 'Специалист',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className,
  label,
}) => {
  const color = roleColors[role] ?? roleColors.overview;
  const text = label ?? ROLE_LABELS[role] ?? role;
  const sizeClass = clsx({
    'h-6 px-2.5 text-[11px]': size === 'sm',
    'h-7 px-3 text-xs': size === 'md',
  });

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-bold border',
        sizeClass,
        className,
      )}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {text}
    </span>
  );
};

// =============================================================================
// EventTypeBadge — бейдж типа события (food / water / toilet / ...)
// =============================================================================

export interface EventTypeBadgeProps {
  eventType: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

import {
  eventTypeColors,
  eventTypeLabel,
  toneToColor,
  type EventTone,
} from '@/styles/tokens';

// Tон → фоновый tint (более прозрачный)
function toneToBg(tone: EventTone): string {
  switch (tone) {
    case 'coral':
      return '#FFEAEA';
    case 'blue':
      return '#EAF5FF';
    case 'purple':
      return '#F1EDFF';
    case 'yellow':
      return '#FFF6DF';
    case 'teal':
      return '#DDF5F0';
    case 'green':
      return '#EAF8F0';
  }
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({
  eventType,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const cfg = (eventTypeColors as Record<string, { tone: EventTone; emoji: string }>)[eventType];
  const tone: EventTone = cfg?.tone ?? 'blue';
  const emoji = cfg?.emoji ?? '•';
  const label = eventTypeLabel(eventType);
  const color = toneToColor(tone);
  const bg = toneToBg(tone);

  const sizeClass = clsx({
    'h-6 px-2 text-[11px]': size === 'sm',
    'h-7 px-2.5 text-xs': size === 'md',
  });

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-bold border',
        sizeClass,
        className,
      )}
      style={{
        backgroundColor: bg,
        borderColor: `${color}30`,
        color,
      }}
    >
      {showIcon && (
        <span className="text-sm leading-none" aria-hidden="true">
          {emoji}
        </span>
      )}
      {label}
    </span>
  );
};

// =============================================================================
// StatusBadge — бейдж статуса события (draft / needs_review / confirmed)
// =============================================================================

export interface EventStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  draft: { bg: '#F2F8F7', color: '#6B7C8F', border: '#DDE8EA' },
  needs_review: { bg: '#FFF6DF', color: '#9a7820', border: '#f0e2a7' },
  ai_parsed: { bg: '#EAF5FF', color: '#1c6cb8', border: '#cce6f7' },
  confirmed: { bg: '#EAF8F0', color: '#158647', border: '#ccebd9' },
  corrected: { bg: '#FFF6DF', color: '#9a7820', border: '#f0e2a7' },
  rejected: { bg: '#FFEAEA', color: '#cc251d', border: '#ffd9d3' },
};

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  const labelMap: Record<string, string> = {
    draft: 'Черновик',
    needs_review: 'Нужно подтвердить',
    ai_parsed: 'AI-наблюдение',
    confirmed: 'Подтверждено',
    corrected: 'Исправлено',
    rejected: 'Отклонено',
  };
  const label = labelMap[status] ?? status;

  const sizeClass = clsx({
    'h-6 px-2 text-[11px]': size === 'sm',
    'h-7 px-2.5 text-xs': size === 'md',
  });

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-bold border',
        sizeClass,
        className,
      )}
      style={{
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
        color: cfg.color,
      }}
    >
      {status === 'needs_review' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      )}
      {label}
    </span>
  );
};

// =============================================================================
// MobileFrame — desktop frame вокруг phone-layout
// =============================================================================

export interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
  /** Variant width: phone (430px) / tablet (900px). */
  variant?: 'phone' | 'tablet' | 'full';
  /** Показать ли desktop-обёртку (фон + центрирование). По умолчанию true. */
  withDesktopFrame?: boolean;
}

/**
 * MobileFrame — wrapper для phone/tablet layouts.
 *
 * На desktop: центрирует с тёплым фоном вокруг.
 * На mobile: full-width без рамки.
 */
export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  className,
  variant = 'phone',
  withDesktopFrame = true,
}) => {
  const maxWidthClass = clsx({
    'max-w-[430px]': variant === 'phone',
    'max-w-[900px]': variant === 'tablet',
    'max-w-none': variant === 'full',
  });

  if (!withDesktopFrame) {
    return (
      <div className={clsx('w-full', maxWidthClass, className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'min-h-screen bg-bg flex justify-center',
        // desktop chrome — мягкая тень вокруг phone panel
        'py-0 md:py-6',
        className,
      )}
    >
      <div
        className={clsx(
          'w-full bg-bg flex flex-col min-h-screen md:min-h-0 relative',
          'md:rounded-[32px] md:shadow-card-hover md:border md:border-line md:overflow-hidden',
          'md:my-auto',
          maxWidthClass,
        )}
      >
        {children}
      </div>
    </div>
  );
};