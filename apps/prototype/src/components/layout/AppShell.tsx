import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ChildTopBar } from './ChildTopBar';
import { useRoleStore } from '@/store/useRoleStore';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import type { UserRole } from '@/types/qoldau';

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

/**
 * AppShell — phone-like layout (v0.6.1).
 * - Mobile: full width, safe-area-inset-top padding для status bar.
 * - Desktop: max-width 430 (phone panel) для parent/child
 *           max-width 1100 (tablet) для specialist.
 * - Soft background, white cards, centered.
 *
 * v0.6.1: landing-страница /overview убрана. Корень → /parent/home.
 */
export const AppShell: React.FC<AppShellProps> = ({ children, showNav = true }) => {
  const { currentRole } = useRoleStore();
  const navigate = useNavigate();
  const { events } = useEventStore();

  // Нормализуем role: tutor/overview → specialist (после объединения ролей в v0.6.1).
  const normalizedRole: UserRole =
    currentRole === 'overview' || currentRole === 'tutor' ? 'specialist' : currentRole;

  const isSpecialist = normalizedRole === 'specialist';
  const isChild = normalizedRole === 'child';

  const notifCount = events.filter(
    (e) =>
      e.childId === DEMO_PRIMARY_CHILD.id &&
      (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist'),
  ).length;

  const maxWidthClass = isSpecialist ? 'max-w-[1100px]' : 'max-w-[430px]';

  // safe-area: top padding под status bar (iOS notch, Android status bar).
  const safeTopStyle: React.CSSProperties = {
    paddingTop: 'max(env(safe-area-inset-top), 0px)',
  };

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div
        className={`w-full ${maxWidthClass} bg-bg flex flex-col min-h-screen relative`}
      >
        {/* Header — child role gets avatar+brand TopBar, others get standard */}
        {isChild ? (
          <div style={safeTopStyle} className="bg-bg/85 backdrop-blur-md sticky top-0 z-30">
            <ChildTopBar />
          </div>
        ) : (
          <header
            style={safeTopStyle}
            className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft"
          >
            <div>
              <p className="text-xs text-muted leading-none mb-0.5">Qoldau AI</p>
              <p className="text-sm font-black text-ink leading-none">
                {normalizedRole === 'parent' ? 'Родитель' : 'Специалист'}
              </p>
            </div>
            <button
              onClick={() => navigate('/parent/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4 text-ink" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {Math.min(notifCount, 9)}
                </span>
              )}
            </button>
          </header>
        )}

        {/* Main content — no horizontal padding for child (ChildHome/Cards etc. manage their own) */}
        <main className={`flex-1 ${isChild ? '' : 'px-5'} ${showNav ? 'pb-28' : 'pb-8'} ${isChild ? 'pt-0' : 'pt-4'}`}>
          {children}
        </main>

        {showNav && <BottomNav role={normalizedRole} />}
      </div>
    </div>
  );
};