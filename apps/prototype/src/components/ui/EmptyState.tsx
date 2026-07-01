import React from 'react';
import { CloudMascot } from '@/components/illustrations/CloudMascot';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /**
   * Если true — вместо эмодзи показывается CloudMascot (mood="sleepy" по умолчанию).
   * Используется для спокойных пустых состояний на child screens.
   */
  useCloud?: boolean;
  /** Настроение CloudMascot, если useCloud=true. */
  cloudMood?: 'calm' | 'happy' | 'sleepy';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  description,
  action,
  useCloud = false,
  cloudMood = 'sleepy',
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    {useCloud ? (
      <div className="mb-4">
        <CloudMascot mood={cloudMood} />
      </div>
    ) : (
      <div className="w-16 h-16 rounded-full bg-teal-soft flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
    )}
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