import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | 'default'
    | 'soft'
    | 'tinted-teal'
    | 'tinted-blue'
    | 'tinted-purple'
    | 'tinted-yellow'
    | 'tinted-coral'
    | 'tinted-green'
    | 'tinted-orange';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * Unified Card — white surface, soft shadow, large rounded.
 * Variants: default (white), soft (gray bg), tinted-* (pastel backgrounds).
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable,
}) => {
  const isInteractive = !!onClick || hoverable;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-shadow',
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',

        variant === 'default' && 'bg-white border border-line shadow-card-soft',
        variant === 'soft' && 'bg-bg border border-line-soft',
        variant === 'tinted-teal' && 'bg-teal-soft border border-teal/20',
        variant === 'tinted-blue' && 'bg-blue-soft border border-blue/20',
        variant === 'tinted-purple' && 'bg-purple-soft border border-purple/20',
        variant === 'tinted-yellow' && 'bg-yellow-soft border border-yellow/20',
        variant === 'tinted-coral' && 'bg-coral-soft border border-coral/20',
        variant === 'tinted-green' && 'bg-green-soft border border-green/20',
        variant === 'tinted-orange' && 'bg-[#FFEDEA] border border-coral/20',

        isInteractive && 'cursor-pointer hover:shadow-card',
        className
      )}
    >
      {children}
    </div>
  );
};