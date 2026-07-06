/**
 * SyncSection (v1.6 E9.4) — секция в ParentProfile для sync/auth.
 *
 * Показывает:
 * - Если demo (нет jwt) → кнопку «Войти для синхронизации» → /auth/login.
 * - Если залогинен → email, SyncStatusBadge, время последнего sync,
 *   pending count, кнопка «Синхронизировать сейчас», logout.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Cloud, Mail, RefreshCw, LogOut } from 'lucide-react';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { SyncStatusBadge } from '@/components/ui/SyncStatusBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStore } from '@/store/useSyncStore';
import { useCurrentChild } from '@/store/useCurrentChild';
import { syncForChild, SYNC_ENABLED } from '@/lib/sync/syncService';
import { formatDate } from '@/utils/dateFormat';

export const SyncSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const jwt = useAuthStore((s) => s.jwt);
  const logout = useAuthStore((s) => s.logout);
  const syncStatus = useSyncStore((s) => s.status);
  const perChild = useSyncStore((s) => s.perChild);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const { id: childId } = useCurrentChild();

  const isSignedIn = !!jwt && !!user && authStatus === 'authenticated';

  const handleLogin = () => navigate('/auth/login');
  const handleLogout = async () => {
    await logout();
    useSyncStore.getState().reset();
  };
  const handleSyncNow = async () => {
    if (childId) await syncForChild(childId);
  };

  const lastSyncedAt = childId ? perChild[childId]?.lastSyncedAt : undefined;
  const lastPushedAt = childId ? perChild[childId]?.lastPushedAt : undefined;

  // Если sync выключен в env — вообще не показываем (демо-сборка).
  if (!SYNC_ENABLED) {
    return (
      <QoldauCard variant="default" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-bg flex items-center justify-center flex-shrink-0">
            <Cloud className="w-5 h-5 text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink">Облачная синхронизация</p>
            <p className="text-xs text-muted">
              Доступно в dev-сборке. В production включится автоматически после подключения почты.
            </p>
          </div>
        </div>
      </QoldauCard>
    );
  }

  return (
    <QoldauCard variant="default" padding="md">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-soft flex items-center justify-center flex-shrink-0">
          <Cloud className="w-5 h-5 text-teal-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink">Облачная синхронизация</p>
          {isSignedIn && user ? (
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          ) : (
            <p className="text-xs text-muted mt-0.5">{t('sync.notSignedIn')}</p>
          )}
        </div>
        <SyncStatusBadge onRetry={handleSyncNow} variant="compact" />
      </div>

      {isSignedIn ? (
        <>
          {lastSyncedAt && (
            <p className="text-[11px] text-muted mb-1">
              {t('sync.lastSync')}: {formatDate(lastSyncedAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {lastPushedAt && lastPushedAt !== lastSyncedAt && (
                <> · push: {formatDate(lastPushedAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</>
              )}
            </p>
          )}
          {pendingCount > 0 && (
            <p className="text-[11px] text-yellow mb-2">
              {t('sync.pendingLabel')}: {pendingCount}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSyncNow}
              disabled={syncStatus === 'syncing'}
              className="flex-1 h-10 rounded-2xl bg-teal text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-teal-dark transition-colors active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {t('sync.syncNow')}
            </button>
            <button
              onClick={handleLogout}
              className="h-10 px-4 rounded-2xl bg-coral-soft text-coral text-sm font-black flex items-center justify-center gap-2 hover:bg-coral hover:text-white transition-colors active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="w-full h-11 rounded-2xl bg-teal text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-teal-dark transition-colors active:scale-[0.98]"
        >
          {t('auth.login')}
        </button>
      )}
    </QoldauCard>
  );
};