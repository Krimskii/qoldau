import React from 'react';
import { Sparkles } from 'lucide-react';

interface DemoBadgeProps {
  /** Текст метки. По умолчанию «Демо». */
  label?: string;
  /** Размер метки. */
  size?: 'sm' | 'md';
  /** Дополнительные CSS-классы. */
  className?: string;
}

export type { DemoBadgeProps };

/**
 * DemoBadge — явный маркер «демо» для mock-функциональности (v1.5+ E4).
 *
 * Используется в местах, где UI показывает mock-данные, которые пользователь
 * может принять за реальные (например, fake audio playback в CalmMode,
 * fallback на random labels в ChildSpeak, keyword-match бот в ParentAIChat).
 *
 * Это требование honest state: пользователь должен явно видеть, что
 * функциональность — демонстрационная, а не реальная.
 */
export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5';
  const iconSize = size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-yellow-soft text-yellow font-black uppercase tracking-wide ${sizeClasses} ${className}`}
      aria-label={`Демо: ${label ?? 'функция в демо-режиме'}`}
    >
      <Sparkles className={iconSize} aria-hidden="true" />
      {label ?? 'Демо'}
    </span>
  );
};

export default DemoBadge;