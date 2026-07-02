/**
 * Skeleton (v0.6.3) — loading placeholder.
 *
 * Используется для списков, карточек и т.д. во время загрузки.
 * Subtle pulse animation через Tailwind animate-pulse.
 */
import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | '2xl' | '3xl';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, width, height, rounded = 'lg' }) => {
  const roundedClass = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }[rounded];

  return (
    <div
      className={clsx('bg-line-soft animate-pulse', roundedClass, className)}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * EventCardSkeleton — placeholder под одну карточку события.
 */
export const EventCardSkeleton: React.FC = () => (
  <div className="bg-white border border-line rounded-3xl p-4 shadow-card-soft">
    <div className="flex items-start gap-3">
      <Skeleton width={48} height={48} rounded="2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="100%" height={12} />
      </div>
    </div>
  </div>
);

/**
 * EventListSkeleton — список из N event-card skeleton'ов.
 */
export const EventListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * CardSkeleton — универсальный placeholder для QoldauCard.
 */
export const CardSkeleton: React.FC = () => (
  <div className="bg-white border border-line rounded-3xl p-5 shadow-card-soft space-y-3">
    <Skeleton width="40%" height={20} />
    <Skeleton width="100%" height={14} />
    <Skeleton width="80%" height={14} />
  </div>
);