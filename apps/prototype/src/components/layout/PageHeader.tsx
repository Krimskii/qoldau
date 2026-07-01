import React from 'react';
import clsx from 'clsx';
import { BackButton } from '@/components/navigation/BackButton';
import { getFallbackPath } from '@/config/navigation';
import { useLocation } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Override fallback path (например, для child UI: '/child/home'). */
  fallbackPath?: string;
  /** Override label для back chip ("Домой" vs "Назад"). */
  backLabel?: string;
  rightAction?: React.ReactNode;
  accent?: 'teal' | 'blue' | 'purple';
  className?: string;
}

/**
 * PageHeader — title в dark-navy, optional subtitle, optional back.
 *
 * Back теперь безопасен: использует BackButton с fallback через navigation config,
 * поэтому пользователь НИКОГДА не оказывается в тупике.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack,
  fallbackPath,
  backLabel,
  rightAction,
  accent = 'teal',
  className,
}) => {
  const location = useLocation();
  const resolvedFallback = fallbackPath ?? getFallbackPath(location.pathname);

  return (
    <header className={clsx('flex items-start justify-between gap-3 mb-4', className)}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {showBack && (
          <BackButton
            fallbackPath={resolvedFallback}
            label={backLabel}
            className="mt-0.5"
          />
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