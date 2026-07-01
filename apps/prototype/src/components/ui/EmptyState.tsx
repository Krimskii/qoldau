import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-16 h-16 rounded-full bg-teal-soft flex items-center justify-center text-3xl mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-ink mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-muted max-w-xs leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Skeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-line rounded-full"
        style={{ width: `${85 - i * 8}%` }}
      />
    ))}
  </div>
);