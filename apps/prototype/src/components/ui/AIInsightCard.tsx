import React from 'react';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface AIInsightCardProps {
  text: string;
  variant?: 'default' | 'warning';
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ text, variant = 'default', className }) => {
  return (
    <div
      className={clsx(
        'rounded-2xl p-3 flex gap-2.5 items-start',
        {
          'bg-gradient-to-br from-[#EAF9F6] to-[#F8FCFB] border border-[#C7ECE5]':
            variant === 'default',
          'bg-gradient-to-br from-[#FFF8E8] to-[#FFFDF8] border border-[#F2D79C]':
            variant === 'warning',
        },
        className
      )}
    >
      <Sparkles className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', variant === 'default' ? 'text-teal' : 'text-yellow')} />
      <p className="text-xs text-ink-2 leading-relaxed">{text}</p>
    </div>
  );
};
