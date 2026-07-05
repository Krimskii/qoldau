import React from 'react';
import clsx from 'clsx';
import type { IconProps } from '@/components/icons';
import { triggerHaptic } from '@/lib/feedback/haptics';

/**
 * QoldauIconCard — универсальная плоская карточка с иконкой.
 *
 * Использование:
 * - AAC-карточки (ChildCards): 11 штук в сетке 3-4 колонки.
 * - Calm options (CalmMode): 6 опций.
 * - Choice варианты.
 *
 * Цвета фона берутся из спек-палитры:
 *   blue   → bg-[#EAF5FF]   text-[#1c6cb8]
 *   green  → bg-[#EAF8F0]   text-[#158647]
 *   purple → bg-[#F1EDFF]   text-[#5a3eb4]
 *   yellow → bg-[#FFF6DF]   text-[#9a7820]
 *   teal   → bg-[#DDF5F0]   text-[#00796F]
 *   coral  → bg-[#FFEAEA]   text-[#cc251d]
 */

export type QoldauIconColor = 'blue' | 'green' | 'purple' | 'yellow' | 'teal' | 'coral';

export type QoldauIconState = 'default' | 'pressed' | 'selected' | 'success';

export type QoldauIconSize = 'sm' | 'md' | 'lg';

const COLOR_MAP: Record<QoldauIconColor, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-white', text: 'text-[#1c6cb8]', border: 'border-[#1c6cb8]' },
  green: { bg: 'bg-white', text: 'text-[#158647]', border: 'border-[#158647]' },
  purple: { bg: 'bg-white', text: 'text-[#5a3eb4]', border: 'border-[#5a3eb4]' },
  yellow: { bg: 'bg-white', text: 'text-[#9a7820]', border: 'border-[#9a7820]' },
  teal: { bg: 'bg-white', text: 'text-[#00796F]', border: 'border-[#00796F]' },
  coral: { bg: 'bg-white', text: 'text-[#cc251d]', border: 'border-[#cc251d]' },
};

export { COLOR_MAP };

const SIZE_MAP: Record<QoldauIconSize, { container: string; iconSize: number; labelText: string; padding: string }> = {
  sm: { container: 'min-h-[88px]', iconSize: 40, labelText: 'text-sm', padding: 'p-2' },
  md: { container: 'min-h-[128px]', iconSize: 56, labelText: 'text-base', padding: 'p-2.5' },
  lg: { container: 'min-h-[160px]', iconSize: 72, labelText: 'text-lg', padding: 'p-3' },
};

interface QoldauIconCardProps {
  icon: React.FC<IconProps>;
  label: string;
  subtitle?: string;
  color?: QoldauIconColor;
  state?: QoldauIconState;
  size?: QoldauIconSize;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const QoldauIconCard: React.FC<QoldauIconCardProps> = ({
  icon: Icon,
  label,
  subtitle,
  color = 'blue',
  state = 'default',
  size = 'md',
  onClick,
  ariaLabel,
  disabled,
  className,
}) => {
  const palette = COLOR_MAP[color];
  const dims = SIZE_MAP[size];

  const handleClick = () => {
    // v1.5+ D1: единый паттерн — гаптик-tap (10ms) по умолчанию.
    triggerHaptic('tap');
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={clsx(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-200 ease-out',
        dims.container,
        dims.padding,
        palette.bg,
        palette.border,
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]',
        // v1.5+ D1: ring-подсветка при active (200ms).
        !disabled && 'qoldau-tap-ring',
        // pressed/selected/success states
        state === 'pressed' && 'scale-[0.96] opacity-90',
        state === 'selected' && 'ring-2 ring-offset-2 ring-teal/40 scale-[0.97]',
        state === 'success' && 'ring-2 ring-offset-2 ring-[#4EC28A]/50',
        // interactive
        !disabled && 'active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      <Icon size={dims.iconSize} className={palette.text} />
      <span className={clsx('font-black leading-tight text-center', dims.labelText, palette.text)}>
        {label}
      </span>
      {subtitle && (
        <span className={clsx('text-xs font-medium leading-tight text-center text-muted')}>
          {subtitle}
        </span>
      )}
    </button>
  );
};