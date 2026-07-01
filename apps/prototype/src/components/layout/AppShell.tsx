import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useRoleStore } from '@/store/useRoleStore';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

/**
 * AppShell — phone-like layout.
 * - Mobile: full width
 * - Desktop: max-width 430 (phone panel) for parent/child/tutor
 *           max-width 1100 (tablet) for specialist
 * - Soft background, white cards, centered.
 */
export const AppShell: React.FC<AppShellProps> = ({ children, showNav = true }) => {
  const { currentRole } = useRoleStore();
  const navigate = useNavigate();
  const { events } = useEventStore();

  if (currentRole === 'overview') {
    return <>{children}</>;
  }

  const isSpecialist = currentRole === 'specialist';
  const isChild = currentRole === 'child';

  // Width strategy per role
  const maxWidthClass = isSpecialist
    ? 'max-w-[1100px]'
    : isChild
      ? 'max-w-[430px]'
      : 'max-w-[430px]';

  // Notifications — derive from event store (child/tutor/specialist events for current child)
  const notifCount = events.filter(
    (e) =>
      e.childId === DEMO_PRIMARY_CHILD.id &&
      (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist')
  ).length;

  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div
        className={`w-full ${maxWidthClass} bg-bg flex flex-col min-h-screen relative`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/overview')}
              className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
              aria-label="На главную"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path
                  d="M12 21s-7-4.5-9-9c-1.5-3.4 0.8-7.4 4.4-7.4 1.9 0 3.6 1.1 4.6 2.7 1-1.6 2.7-2.7 4.6-2.7 3.6 0 5.9 4 4.4 7.4-2 4.5-9 9-9 9Z"
                  fill="#071B3A"
                  fillOpacity="0.9"
                />
              </svg>
            </button>
            <div>
              <p className="text-xs text-muted leading-none mb-0.5">Qoldau AI</p>
              <p className="text-sm font-black text-ink leading-none">
                {currentRole === 'parent' && 'Родитель'}
                {currentRole === 'child' && 'Алихан'}
                {currentRole === 'tutor' && 'Тьютор'}
                {currentRole === 'specialist' && 'Специалист'}
              </p>
            </div>
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

        {/* Main content */}
        <main className={`flex-1 px-5 ${showNav ? 'pb-28' : 'pb-8'} pt-4`}>
          {children}
        </main>

        {showNav && <BottomNav role={currentRole} />}
      </div>
    </div>
  );
};