import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ChildTopBar } from './ChildTopBar';
import { useRoleStore } from '@/store/useRoleStore';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import type { UserRole } from '@/types/qoldau';
import { applyTheme, loadTheme } from '@/utils/theme';

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

        {/* Main content — no horizontal padding for child (ChildHome/Cards etc. manage their own) */}
        <main className={`flex-1 ${isChild ? '' : 'px-5'} ${showNav ? 'pb-28' : 'pb-8'} ${isChild ? 'pt-0' : 'pt-4'}`}>
          {children}
        </main>

        {showNav && <BottomNav role={normalizedRole} />}

        {/* Exit confirm dialog (parent/tutor) — аналог ChildTopBar */}
        {exitConfirmOpen && (
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center px-5 bg-ink/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={t('exit.parentTitle')}
            onClick={() => setExitConfirmOpen(false)}
          >
            <div
              className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-card-hover"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-coral-soft">
                <LogOut className="w-7 h-7 text-coral" />
              </div>
              <h3 className="text-lg font-black text-ink text-center mb-1">
                {t('exit.parentTitle')}
              </h3>
              <p className="text-sm text-muted text-center mb-5 leading-relaxed">
                {t('exit.parentHint')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setExitConfirmOpen(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
                >
                  {t('exit.stay')}
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition-transform active:scale-[0.97] bg-gradient-to-br from-coral to-[#cc251d] shadow-card hover:shadow-card-hover"
                >
                  {t('exit.leave')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};