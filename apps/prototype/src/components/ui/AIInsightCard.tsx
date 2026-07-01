import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from './Card';

interface AIInsightCardProps {
  text: string;
  variant?: 'default' | 'warning' | 'success';
  title?: string;
}

/**
 * AIInsightCard — pastel teal card with Sparkles icon and cautious wording.
 * Used on most data-bearing pages. Always includes disclaimer.
 */
export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  text,
  variant = 'default',
  title = 'AI-наблюдение',
}) => {
  const variantClass =
    variant === 'warning'
      ? 'bg-yellow-soft border-yellow/20'
      : variant === 'success'
        ? 'bg-green-soft border-green/20'
        : 'bg-teal-soft border-teal/20';

  const iconBg =
    variant === 'warning'
      ? 'bg-yellow text-white'
      : variant === 'success'
        ? 'bg-green text-white'
        : 'bg-teal text-white';

  return (
    <Card variant="default" className={`${variantClass} border`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-card-soft`}
          aria-hidden="true"
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-muted uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-sm text-ink leading-relaxed">{text}</p>
        </div>
      </div>
    </Card>
  );
};