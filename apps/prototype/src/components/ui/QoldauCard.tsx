import React from 'react';
import clsx from 'clsx';

export interface QoldauCardProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | 'default'
    | 'soft'
    | 'elevated'
    | 'tinted-teal'
    | 'tinted-blue'
    | 'tinted-purple'
    | 'tinted-yellow'
    | 'tinted-coral'
    | 'tinted-green'
    | 'tinted-warm'
    | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
  /** Поднять тень при hover (для primary CTA). */
  liftOnHover?: boolean;
  ariaLabel?: string;
}

/**
 * QoldauCard — единая карточка.
 *
 * - variant: цвет фона / границы
 * - padding: 0/sm/md/lg
 * - hoverable: cursor + hover state
 * - liftOnHover: тень увеличивается при hover
 *
 * Используется ВЕЗДЕ вместо inline `<div className="bg-white rounded-2xl ...">`.
 */
export const QoldauCard: React.FC<QoldauCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable,
  liftOnHover,
  ariaLabel,
}) => {
  const isInteractive = !!onClick || hoverable;

  const variantClass = clsx({
    'bg-white border border-line': variant === 'default',
    'bg-bg border border-line-soft': variant === 'soft',
    'bg-white border border-line shadow-card-hover': variant === 'elevated',
    'bg-teal-soft border border-teal/20': variant === 'tinted-teal',
    'bg-blue-soft border border-blue/20': variant === 'tinted-blue',
    'bg-purple-soft border border-purple/20': variant === 'tinted-purple',
    'bg-yellow-soft border border-yellow/20': variant === 'tinted-yellow',
    'bg-coral-soft border border-coral/20': variant === 'tinted-coral',
    'bg-green-soft border border-green/20': variant === 'tinted-green',
    'bg-bg border border-line': variant === 'tinted-warm',
    'bg-white/40 border-2 border-dashed border-line text-muted':
      variant === 'outline',
  });

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={clsx(
        'rounded-2xl transition-all duration-200 ease-out',
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',
        variantClass,
        isInteractive && 'cursor-pointer',
        hoverable && 'hover:shadow-card-hover',
        liftOnHover && 'hover:-translate-y-0.5 hover:shadow-card-hover',
        className,
      )}
    >
      {children}
    </div>
  );
};