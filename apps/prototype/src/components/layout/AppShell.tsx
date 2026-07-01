import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { BottomNav } from './BottomNav';
import { useRoleStore } from '@/store/useRoleStore';
import { getUnreadCount } from '@/data/mockNotifications';

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, showNav = true }) => {
  const { currentRole } = useRoleStore();
  const navigate = useNavigate();
  const unreadCount = getUnreadCount();

  // Hide shell for overview page
  if (currentRole === 'overview') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <RoleSwitcher />
        <button
          onClick={() => navigate('/parent/profile')}
          className="relative w-9 h-9 rounded-xl bg-[#F7FBFA] border border-line flex items-center justify-center text-ink hover:bg-teal-soft transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pb-24">
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};
