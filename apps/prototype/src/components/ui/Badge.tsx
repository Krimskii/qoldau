import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'alt';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  return (
    <span
      className={clsx(
        'text-xs font-bold rounded-full px-2.5 py-1.5',
        {
          'bg-teal-soft text-teal-dark border border-[#BDEBE4]': variant === 'default',
          'bg-[#F7FBFF] text-[#27577E] border border-[#D9E9F8]': variant === 'alt',
        },
        className
      )}
    >
      {children}
    </span>
  );
};
