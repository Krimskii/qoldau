import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'teal' | 'blue' | 'purple' | 'yellow' | 'coral' | 'green' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

/**
 * Badge — small chip with color variants.
 * Used for status, source, confidence, tags.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  icon,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
        variant === 'default' && 'bg-bg text-ink-2 border border-line',
        variant === 'outline' && 'bg-white text-ink border border-line',
        variant === 'teal' && 'bg-teal-soft text-teal-dark',
        variant === 'blue' && 'bg-blue-soft text-blue',
        variant === 'purple' && 'bg-purple-soft text-purple',
        variant === 'yellow' && 'bg-yellow-soft text-yellow',
        variant === 'coral' && 'bg-coral-soft text-coral',
        variant === 'green' && 'bg-green-soft text-green',
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
};