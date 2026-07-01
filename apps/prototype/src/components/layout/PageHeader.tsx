import React from 'react';
import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  accent?: 'teal' | 'blue' | 'purple';
  className?: string;
}

/**
 * PageHeader — title in dark-navy, optional subtitle in muted.
 * Back chevron is a circular white button with soft shadow.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack,
  rightAction,
  accent = 'teal',
  className,
}) => {
  const navigate = useNavigate();
  return (
    <header className={clsx('flex items-start justify-between gap-3 mb-4', className)}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 mt-0.5 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft flex-shrink-0"
            aria-label="Назад"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1
            className={clsx(
              'text-2xl font-black text-ink leading-tight tracking-tight',
              accent === 'blue' && 'text-blue',
              accent === 'purple' && 'text-purple'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted mt-1 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </header>
  );
};