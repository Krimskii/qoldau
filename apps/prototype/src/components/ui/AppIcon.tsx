import React from 'react';
import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';

/**
 * AppIcon — единая обёртка над SVG/lucide/custom-иконками.
 *
 * Поддерживает:
 * - lucide-react иконку (component reference)
 * - custom SVG-компонент
 * - emoji fallback
 *
 * Поведение:
 * - aria-hidden=true если aria-label не передан (декоративная)
 * - aria-label + role=img если aria-label передан
 */
export interface AppIconProps {
  /** Компонент-иконка (SVG или lucide). Принимаем широкий тип чтобы работать с lucide ForwardRef. */
  component: React.ComponentType<Record<string, unknown>>;
  size?: number;
  /** Tailwind text-* для currentColor (например, text-teal, text-coral). */
  colorClass?: string;
  /** Абсолютный цвет (если нужен нестандартный). */
  color?: string;
  /** Толщина обводки для lucide. */
  strokeWidth?: number;
  /** a11y label. Если не передан — декоративная (aria-hidden). */
  ariaLabel?: string;
  /** Дополнительные классы. */
  className?: string;
  /** Заливка вместо обводки (для filled иконок). */
  filled?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({
  component: Component,
  size = 24,
  colorClass = 'text-ink',
  color,
  strokeWidth,
  ariaLabel,
  className = '',
  filled = false,
}) => {
  const style = color ? { color } : undefined;

  // Для filled — оборачиваем в span, чтобы применить color как fill.
  if (filled) {
    return (
      <span
        className={clsx('inline-flex items-center justify-center', className)}
        style={{ width: size, height: size, ...style }}
        role={ariaLabel ? 'img' : 'presentation'}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
      >
        <Component
          size={size}
          strokeWidth={strokeWidth ?? 0}
          className={clsx(colorClass, 'w-full h-full')}
        />
      </span>
    );
  }

  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={clsx(colorClass, className)}
      {...(style ? { style } : {})}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : 'presentation'}
    />
  );
};

/**
 * BackIcon — стандартизированная кнопка «назад» с AppIcon.
 * Используется внутри header.
 */
interface BackIconProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

export const BackIcon: React.FC<BackIconProps> = ({
  onClick,
  className = '',
  ariaLabel = 'Назад',
}) => (
  <button
    onClick={onClick}
    className={clsx(
      'w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft',
      className,
    )}
    aria-label={ariaLabel}
  >
    <ChevronLeft className="w-5 h-5 text-ink" />
  </button>
);