/**
 * SyncStatusBadge (v1.6 E9.4) — компактный статус-индикатор sync.
 *
 * Состояния (5):
 * - demo: VITE_ENABLE_SYNC=false или нет jwt → «Демо»
 * - idle: залогинен, всё синхронизировано → «Синхронизировано»
 * - syncing: идёт pull/push → «Синхронизация…»
 * - offline: нет сети → «Офлайн»
 * - error: последняя попытка упала → «Ошибка · повторить»
 *
 * Используется в AppShell (header) и ParentProfile (settings).
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import { useSyncStore } from '@/store/useSyncStore';
import { SYNC_ENABLED } from '@/lib/sync/syncService';
import { useAuthStore } from '@/store/useAuthStore';

type Variant = 'demo' | 'idle' | 'syncing' | 'offline' | 'error';

interface SyncStatusBadgeProps {
  /** Если передан — клик (для retry на error). */
  onRetry?: () => void;
  /** Полный/компактный вариант (compact — только иконка). */
  variant?: 'full' | 'compact';
  /** Кастомный класс (для разных layout). */
  className?: string;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  onRetry,
  variant = 'full',
  className = '',
}) => {
  const { t } = useTranslation();
  const status = useSyncStore((s) => s.status);
  const error = useSyncStore((s) => s.lastError);
  const authStatus = useAuthStore((s) => s.status);
  const jwt = useAuthStore((s) => s.jwt);

  // Если sync выключен или нет jwt → demo.
  const effective: Variant =
    !SYNC_ENABLED || !jwt || authStatus !== 'authenticated'
      ? 'demo'
      : (status as Variant);

  const visual: Record<Variant, { Icon: typeof Cloud; bg: string; text: string; label: string }> = {
    demo: {
      Icon: CloudOff,
      bg: 'bg-bg',
      text: 'text-muted',
      label: t('sync.statusDemo', 'Демо (без входа)'),
    },
    idle: {
      Icon: Check,
      bg: 'bg-green-soft',
      text: 'text-green',
      label: t('sync.statusIdle', 'Синхронизировано'),
    },
    syncing: {
      Icon: Loader2,
      bg: 'bg-blue-soft',
      text: 'text-blue',
      label: t('sync.statusSyncing', 'Синхронизация…'),
    },
    offline: {
      Icon: CloudOff,
      bg: 'bg-yellow-soft',
      text: 'text-yellow',
      label: t('sync.statusOffline', 'Офлайн'),
    },
    error: {
      Icon: AlertCircle,
      bg: 'bg-coral-soft',
      text: 'text-coral',
      label: t('sync.statusError', 'Ошибка'),
    },
  };
  const v = visual[effective];
  const Icon = v.Icon;

  const handleClick = () => {
    if (effective === 'error' && onRetry) onRetry();
  };

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl ${v.bg} ${className}`}
        aria-label={v.label}
        title={error ? `${v.label}: ${error}` : v.label}
        onClick={handleClick}
        role={effective === 'error' ? 'button' : 'status'}
      >
        <Icon
          className={`w-4 h-4 ${v.text} ${effective === 'syncing' ? 'animate-spin' : ''}`}
        />
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${v.bg} ${className}`}
      onClick={handleClick}
      role={effective === 'error' ? 'button' : 'status'}
      title={error ? `${v.label}: ${error}` : v.label}
    >
      <Icon
        className={`w-3.5 h-3.5 ${v.text} ${effective === 'syncing' ? 'animate-spin' : ''}`}
      />
      <span className={`text-xs font-bold ${v.text}`}>{v.label}</span>
    </div>
  );
};