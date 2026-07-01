import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'icon' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  block?: boolean;
}

/**
 * Unified Button — primary teal, secondary outline, ghost, danger, success.
 * Sizes: sm/md/lg/xl. Block for full-width.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      block,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all select-none',
          'focus:outline-none focus:ring-4 focus:ring-teal/15 active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Sizes
          size === 'sm' && 'h-9 px-3 text-sm',
          size === 'md' && 'h-11 px-5 text-sm',
          size === 'lg' && 'h-13 px-6 text-base',
          size === 'xl' && 'h-16 px-8 text-lg',

          // Variants
          variant === 'primary' &&
            'bg-gradient-to-br from-teal to-teal-dark text-white shadow-card hover:shadow-card-hover',
          variant === 'secondary' &&
            'bg-white border-2 border-teal/30 text-teal-dark hover:bg-teal-soft',
          variant === 'outline' &&
            'bg-white border-2 border-line text-ink hover:border-teal hover:text-teal-dark',
          variant === 'ghost' &&
            'bg-transparent text-muted hover:bg-teal-soft hover:text-teal-dark',
          variant === 'danger' &&
            'bg-gradient-to-br from-coral to-[#cc251d] text-white shadow-card hover:shadow-card-hover',
          variant === 'success' &&
            'bg-gradient-to-br from-green to-[#3DA876] text-white shadow-card hover:shadow-card-hover',
          variant === 'icon' &&
            'bg-white border border-line text-ink hover:bg-teal-soft hover:text-teal-dark w-11 h-11 p-0',

          block && 'w-full',

          className
        )}
        {...rest}
      >
        {icon}
        {children}
        {iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';