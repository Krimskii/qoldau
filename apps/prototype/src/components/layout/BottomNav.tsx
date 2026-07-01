import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  MessageCircle,
  BarChart3,
  User,
  Utensils,
  Brain,
  Plus,
  Mic,
  FileText,
} from 'lucide-react';
import { UserRole } from '@/types/qoldau';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  isCenter?: boolean;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  overview: [],
  parent: [
    { icon: Home, label: 'Главная', path: '/parent/home' },
    { icon: Calendar, label: 'События', path: '/parent/events' },
    { icon: Plus, label: '', path: '/parent/voice', isCenter: true },
    { icon: BarChart3, label: 'Аналитика', path: '/parent/analytics' },
    { icon: User, label: 'Профиль', path: '/parent/profile' },
  ],
  child: [
    { icon: Home, label: 'Главная', path: '/child/home' },
    { icon: Utensils, label: 'Карточки', path: '/child/cards' },
    { icon: MessageCircle, label: 'Сказать', path: '/child/speak' },
  ],
  tutor: [
    { icon: Home, label: 'Главная', path: '/tutor/home' },
    { icon: Brain, label: 'AI', path: '/tutor/ai-review' },
    { icon: FileText, label: 'Отчёт', path: '/tutor/report' },
    { icon: User, label: 'Профиль', path: '/tutor/child-profile' },
  ],
  specialist: [
    { icon: Home, label: 'Главная', path: '/specialist/dashboard' },
    { icon: Calendar, label: 'События', path: '/specialist/events' },
    { icon: Brain, label: 'ABC', path: '/specialist/abc' },
    { icon: BarChart3, label: 'Отчёты', path: '/specialist/reports' },
  ],
};

export const BottomNav: React.FC<{ role: UserRole }> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = NAV_BY_ROLE[role] ?? [];
  if (items.length === 0) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-3 pb-3 pt-2 pointer-events-none"
      aria-label="Нижняя навигация"
    >
      <div className="bg-white border border-line rounded-3xl shadow-card pointer-events-auto flex items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isCenter) {
            // Floating center button — круглая teal-кнопка с микрофоном
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-label="Добавить наблюдение"
                className="-mt-7 w-14 h-14 rounded-full bg-gradient-to-br from-teal to-teal-dark text-white shadow-card hover:shadow-card-hover transition-shadow flex items-center justify-center active:scale-95"
              >
                <Mic className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl min-w-[60px] transition-colors ${
                isActive ? 'text-teal' : 'text-muted hover:text-ink'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-teal-soft' : ''
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {item.label && <span className="text-[11px] font-bold leading-none">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};