/**
 * EmptyState (v0.6.3) — empty list / no data placeholder.
 *
 * Поддерживает два варианта icon: Lucide-иконка (component) или emoji-строка.
 */
import React from 'react';
import { Inbox } from 'lucide-react';
import { QoldauCard } from './QoldauCard';
import { AppIcon } from './AppIcon';

type IconInput = typeof Inbox | string;

interface EmptyStateProps {
  icon?: IconInput;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function isEmoji(input: IconInput): input is string {
  return typeof input === 'string';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <QoldauCard variant="tinted-warm" padding="lg">
    <div className="flex flex-col items-center text-center gap-3 py-4">
      {icon ? (
        isEmoji(icon) ? (
          <div className="text-4xl">{icon}</div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-bg flex items-center justify-center">
            <AppIcon component={icon} size={32} colorClass="text-muted" />
          </div>
        )
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-bg flex items-center justify-center">
          <AppIcon component={Inbox} size={32} colorClass="text-muted" />
        </div>
      )}
      <h3 className="text-base font-black text-ink">{title}</h3>
      {description && (
        <p className="text-sm text-muted leading-relaxed max-w-xs">{description}</p>
      )}
      {action}
    </div>
  </QoldauCard>
);