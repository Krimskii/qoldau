import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ChildTopBar } from './ChildTopBar';
import { ExitConfirmDialog } from './ExitConfirmDialog';
import { useRoleStore } from '@/store/useRoleStore';
import { useEventStore } from '@/store/useEventStore';
import { useSyncStore } from '@/store/useSyncStore';
import { useCurrentChild } from '@/store/useCurrentChild';
import { syncForChild } from '@/lib/sync/syncService';
import { SyncStatusBadge } from '@/components/ui/SyncStatusBadge';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import type { UserRole } from '@/types/qoldau';
import { applyTheme, loadTheme } from '@/utils/theme';
import { useChildSettingsStore, applyChildSettings } from '@/store/useChildSettingsStore';

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

/**
 * AppShell — phone-like layout (v0.7.1).
 * - Mobile: full width, safe-area-inset-top padding для status bar.
 * - Desktop: max-width 430 (phone panel) для parent/child
 *           max-width 1100 (tablet) для specialist.
 * - Soft background, white cards, centered.
 *
 * v0.7.1: i18n через useTranslation.
 */
export const AppShell: React.FC<AppShellProps> = ({ children, showNav = true }) => {
  const { t } = useTranslation();
  const { currentRole, setRole } = useRoleStore();
  const navigate = useNavigate();
  const { events } = useEventStore();
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  // v1.5+ D2: подписка на sensoryMode + auto-apply к <html> через applyChildSettings.
  const childSettings = useChildSettingsStore();

  // Тёмная тема не должна протекать в детский интерфейс (сенсорная безопасность,
  // SENSORY_SAFE_DESIGN_GUIDE.md требует нейтральный/светлый фон) — html.dark
  // персистентен между роутами, поэтому форсим светлую тему для child и
  // восстанавливаем реальную настройку пользователя при выходе из этой роли.
  useEffect(() => {
    if (currentRole === 'child') {
      document.documentElement.classList.remove('dark');
    } else {
      applyTheme(loadTheme());
    }
  }, [currentRole]);

  // v1.5+ D2: применяем настройки ребёнка (paused/calmVisual/highContrast/fontScale/sensoryMode)
  // к <html> при изменении. Старая версия (ChildTopBar) дублировала — теперь единая точка.
  useEffect(() => {
    applyChildSettings(childSettings);
  }, [
    childSettings.paused,
    childSettings.calmVisual,
    childSettings.highContrast,
    childSettings.fontScale,
    childSettings.sensoryMode,
  ]);

  // currentRole === 'overview' → пользователь на landing, не в роли.
  if (currentRole === 'overview') {
    return <>{children}</>;
  }

  // Нормализуем role для UI (все не-specialist роли — phone panel).
  const normalizedRole: UserRole = currentRole;

  const isSpecialist = normalizedRole === 'tutor' || normalizedRole === 'specialist';
  const isChild = normalizedRole === 'child';

  const notifCount = events.filter(
    (e) =>
      e.childId === DEMO_PRIMARY_CHILD.id &&
      (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist'),
  ).length;

  const maxWidthClass = isSpecialist ? 'max-w-[1100px]' : 'max-w-[430px]';

  // safe-area: top padding под status bar (iOS notch, Android status bar).
  // Минимум 12px — чтобы top bar не прилипал к верху на desktop/обычных браузерах,
  // где env(safe-area-inset-top) = 0. На iOS PWA/Android — больше из safe-area.
  const safeTopStyle: React.CSSProperties = {
    paddingTop: 'max(env(safe-area-inset-top), 12px)',
  };

  const handleExit = () => {
    setRole('overview');
    setExitConfirmOpen(false);
    navigate('/overview');
  };

  const handleSyncRetry = () => {
    if (useSyncStore.getState().status === 'error') {
      void syncForChild(useCurrentChild().id);
    }
  };

  const roleLabel = normalizedRole === 'parent' ? t('landing.roleParent') : t('landing.roleTutor');

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div
        className={`w-full ${maxWidthClass} bg-bg flex flex-col min-h-screen relative`}
      >
        {/* Header — child role gets avatar+brand TopBar, others get standard */}
        {isChild ? (
          <div style={safeTopStyle} className="bg-bg/85 backdrop-blur-md">
            <ChildTopBar />
          </div>
        ) : (
          <header
            style={safeTopStyle}
            className="bg-bg/85 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft"
          >
            <div>
              <p className="text-xs text-muted leading-none mb-0.5">Qoldau AI</p>
              <p className="text-sm font-black text-ink leading-none">
                {roleLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* v1.6 E9.4: compact sync badge в header. */}
              <SyncStatusBadge variant="compact" onRetry={handleSyncRetry} />
              <button
                onClick={() => navigate('/parent/notifications')}
                className="relative w-11 h-11 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
                aria-label={t('parent.notifications.title')}
              >
                <Bell className="w-4 h-4 text-ink" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {Math.min(notifCount, 9)}
                  </span>
                )}
              </button>
              {/* Кнопка выхода на landing (v0.6.11) — аналог ChildTopBar */}
              <button
                onClick={() => setExitConfirmOpen(true)}
                className="w-11 h-11 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-coral-soft hover:text-coral transition-colors shadow-card-soft"
                aria-label={t('nav.exit')}
                title={t('nav.exit')}
              >
                <LogOut className="w-4 h-4 text-ink-soft" />
              </button>
            </div>
          </header>
        )}

        {/* Main content — no horizontal padding for child (ChildHome/Cards etc. manage their own).
            v1.5+ D2: для child role оборачиваем в .child-root + data-sensory, чтобы
            CSS-vars и анимационный гейт из sensory.css применялись только к child UI.
            E8.3: pb-36 (144px) — BottomNav FAB выступает ~28px над баром, плюс
            safe-area-bottom. Раньше pb-28 было мало — FAB перекрывал контент. */}
        {isChild ? (
          <main
            data-sensory={childSettings.sensoryMode}
            className={`child-root flex-1 ${showNav ? 'pb-36' : 'pb-8'} pt-0`}
          >
            {children}
          </main>
        ) : (
          <main className={`flex-1 px-5 ${showNav ? 'pb-36' : 'pb-8'} pt-4`}>
            {children}
          </main>
        )}

        {showNav && <BottomNav role={normalizedRole} />}

        {/* Exit confirm dialog (parent/tutor) */}
        {exitConfirmOpen && (
          <ExitConfirmDialog
            title={t('exit.parentTitle')}
            hint={t('exit.parentHint')}
            stayLabel={t('exit.stay')}
            leaveLabel={t('exit.leave')}
            onStay={() => setExitConfirmOpen(false)}
            onLeave={handleExit}
          />
        )}
      </div>
    </div>
  );
};