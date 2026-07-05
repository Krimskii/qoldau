/**
 * DataState (v1.5+ E6) — единый рендер 4 состояний данных.
 *
 * Используется на каждом data-экране:
 * - loading → skeleton (или кастомный fallback)
 * - error   → ErrorState с кнопкой retry
 * - empty   → EmptyState (или кастомный)
 * - data    → children
 *
 * Преимущество: единый паттерн для всех ролей, легко аудировать «голые» места.
 *
 * Использование:
 * ```tsx
 * <DataState
 *   isLoading={loading}
 *   error={error}
 *   isEmpty={items.length === 0}
 *   emptyState={{ title: t('...'), description: t('...') }}
 *   onRetry={() => refetch()}
 * >
 *   {items.map(...)}
 * </DataState>
 * ```
 */
import React from 'react';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { EventListSkeleton, CardSkeleton } from './Skeleton';
import type { IconInput } from './EmptyState';

export type LoadingVariant = 'list' | 'card' | 'inline';

export interface DataStateProps {
  /** Идёт загрузка — показываем skeleton. */
  isLoading?: boolean;
  /** Текст/объект ошибки — показываем ErrorState с onRetry. */
  error?: string | null;
  /** Данных нет (массив пустой, count=0 и т.п.). Показываем EmptyState. */
  isEmpty?: boolean;
  /** Колбэк «Повторить» — обязателен при error. */
  onRetry?: () => void;
  /** Кастомный skeleton (если list/card не подходит). */
  loadingFallback?: React.ReactNode;
  /** Какой skeleton использовать по умолчанию. */
  loadingVariant?: LoadingVariant;
  /** Сколько skeleton-карточек показать (для loadingVariant=list). */
  skeletonCount?: number;
  /** Кастомный empty-state контент (полностью заменяет EmptyState). */
  emptyFallback?: React.ReactNode;
  /** Параметры дефолтного EmptyState. */
  emptyState?: {
    icon?: IconInput;
    title: string;
    description?: string;
    action?: React.ReactNode;
    variant?: 'card' | 'plain';
  };
  /** Кастомный error-state контент. */
  errorFallback?: React.ReactNode;
  /** Параметры дефолтного ErrorState. */
  errorState?: {
    title?: string;
    description?: string;
    message?: string;
    icon?: IconInput;
    retryLabel?: string;
    action?: React.ReactNode;
    variant?: 'card' | 'plain';
  };
  /** Сами данные — children рендерятся только когда isLoading=false, error=null, isEmpty=false. */
  children: React.ReactNode;
}

export const DataState: React.FC<DataStateProps> = ({
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  loadingFallback,
  loadingVariant = 'list',
  skeletonCount = 3,
  emptyFallback,
  emptyState,
  errorFallback,
  errorState,
  children,
}) => {
  // 1. Loading — приоритет над error/empty
  if (isLoading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    if (loadingVariant === 'card') return <CardSkeleton />;
    return <EventListSkeleton count={skeletonCount} />;
  }

  // 2. Error
  if (error) {
    if (errorFallback) return <>{errorFallback}</>;
    return (
      <ErrorState
        {...(errorState ?? {})}
        message={errorState?.message ?? error}
        onRetry={onRetry}
      />
    );
  }

  // 3. Empty
  if (isEmpty) {
    if (emptyFallback) return <>{emptyFallback}</>;
    if (emptyState) {
      return <EmptyState {...emptyState} />;
    }
    return null;
  }

  // 4. Data
  return <>{children}</>;
};

export default DataState;