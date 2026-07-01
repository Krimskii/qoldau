import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'food' | 'behavior' | 'toilet' | 'sensory';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, variant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-line rounded-2xl shadow-card-soft p-4',
        {
          'bg-[#EFFBF7] border-[#CBEFE8]': variant === 'food',
          'bg-[#F5F0FF] border-[#DDD1FF]': variant === 'behavior',
          'bg-[#EAF6FF] border-[#CAE7FF]': variant === 'toilet',
          'bg-[#FFF7EC] border-[#F3D9AE]': variant === 'sensory',
        },
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};