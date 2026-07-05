import React from 'react';
import clsx from 'clsx';
import type { IconProps } from '@/components/icons';
import { type QoldauIconColor } from '@/components/ui/QoldauIconCard';
import { COLOR_MAP } from '@/components/ui/QoldauIconCard';
import { triggerHaptic } from '@/lib/feedback/haptics';

/**
 * QoldauActionCard — крупная action-кнопка для child screens.
 *
 * Использование:
 * - ChildHome 6 actions (Хочу пить, Туалет, Помощь, Пауза, Любимые, Сказать).
 * - Любая крупная primary CTA на child UI.
 *
 * Минимальная высота — 110px (touch-target ≥ 100px).
 * Поддерживает pressed state и focus ring.
 */

export type QoldauActionState = 'default' | 'pressed' | 'selected';

interface QoldauActionCardProps {
  icon: React.FC<IconProps>;
  label: string;
  color?: QoldauIconColor;
  state?: QoldauActionState;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  /** Дополнительный класс — например, для span col-span-3 на choice row. */
  className?: string;
}

export const QoldauActionCard: React.FC<QoldauActionCardProps> = ({
  icon: Icon,
  label,
  color = 'blue',
  state = 'default',
  onClick,
  ariaLabel,
  disabled,
  className,
}) => {
  const palette = COLOR_MAP[color];

  const handleClick = () => {
    // v1.5+ D1: единый паттерн — haptic + (опц.) speak через родителя.
    triggerHaptic('tap');
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={clsx(
        'min-h-[128px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-3 transition-all duration-200 ease-out',
        palette.bg,
        palette.border,
        'text-[#173760] font-black text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px rgba(42,73,108,0.05)]',
        // qoldau-tap-ring — короткая подсветка-ring при active (200ms).
        !disabled && 'qoldau-tap-ring',
        state === 'pressed' && 'scale-[0.96] opacity-90',
        state === 'selected' && 'ring-2 ring-offset-2 ring-teal/40 scale-[0.97]',
        !disabled && 'active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      <Icon size={56} className={palette.text} />
      <span className="leading-tight text-center">{label}</span>
    </button>
  );
};