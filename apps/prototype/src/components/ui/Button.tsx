import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'font-bold rounded-xl transition-all',
        'focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2',
        {
          // Variants
          'bg-gradient-to-br from-teal to-teal-dark text-white shadow-card hover:shadow-card-soft':
            variant === 'primary',
          'bg-white border border-teal text-teal-dark hover:bg-teal-soft':
            variant === 'secondary',
          'bg-transparent text-teal-dark hover:bg-teal-soft': variant === 'ghost',
          'bg-[#F7FBFA] border border-line text-teal-dark hover:bg-teal-soft':
            variant === 'icon',
          // Sizes
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-3 text-base': size === 'md',
          'px-6 py-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
