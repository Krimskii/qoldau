import React from 'react';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { BackButton } from '@/components/navigation/BackButton';
import { getFallbackPath } from '@/config/navigation';

interface PageScaffoldProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  fallbackPath?: string;
  backLabel?: string;
  rightAction?: React.ReactNode;
  /** Mobile-safe bottom padding под BottomNav. По умолчанию true. */
  withBottomNav?: boolean;
  /** Variant — phone / tablet / full. По умолчанию phone. */
  variant?: 'phone' | 'tablet' | 'full';
  children: React.ReactNode;
  className?: string;
}

/**
 * PageScaffold — единая обёртка для страниц с header + bottom-safe layout.
 *
 * Использовать вместо inline `<div>` обёрток. Сейчас страницы используют
 * PageHeader + ручной flex layout. PageScaffold объединяет оба.
 */
export const PageScaffold: React.FC<PageScaffoldProps> = ({
  title,
  subtitle,
  showBack,
  fallbackPath,
  backLabel,
  rightAction,
  withBottomNav = true,
  variant = 'phone',
  children,
  className,
}) => {
  const location = useLocation();
  const resolvedFallback = fallbackPath ?? getFallbackPath(location.pathname);

  const variantPadding = {
    phone: 'px-4',
    tablet: 'px-6',
    full: 'px-6',
  }[variant];

  return (
    <div className={clsx('flex flex-col gap-4', variantPadding, className)}>
      {(title || showBack) && (
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {showBack && (
              <BackButton
                fallbackPath={resolvedFallback}
                label={backLabel}
                className="mt-0.5"
              />
            )}
            {title && (
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-black text-ink leading-tight tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted mt-1 leading-snug">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
        </header>
      )}
      <div className="flex-1">{children}</div>
      {withBottomNav && <div className="h-20" aria-hidden="true" />}
    </div>
  );
};