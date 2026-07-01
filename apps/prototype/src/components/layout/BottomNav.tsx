import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, BarChart3, User, Utensils, Brain } from 'lucide-react';
import { useRoleStore } from '@/store/useRoleStore';

const navItems = {
  parent: [
    { icon: Home, label: 'Главная', path: '/parent/home' },
    { icon: Calendar, label: 'События', path: '/parent/events' },
    { icon: MessageCircle, label: 'Комм.', path: '/parent/ai-review' },
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
    { icon: MessageCircle, label: 'Голос', path: '/tutor/voice' },
    { icon: Brain, label: 'AI-разбор', path: '/tutor/ai-review' },
    { icon: User, label: 'Профиль', path: '/tutor/child-profile' },
  ],
  specialist: [
    { icon: Home, label: 'Главная', path: '/specialist/dashboard' },
    { icon: Calendar, label: 'События', path: '/specialist/events' },
    { icon: Brain, label: 'ABC', path: '/specialist/abc' },
    { icon: BarChart3, label: 'Отчёты', path: '/specialist/reports' },
  ],
};

export const BottomNav: React.FC = () => {
  const { currentRole } = useRoleStore();
  const location = useLocation();
  const navigate = useNavigate();

  const items = navItems[currentRole as keyof typeof navItems];
  if (!items) return null;

  return (
    <div className="mt-auto grid grid-cols-5 gap-1 border-t border-line pt-2.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 py-2 text-xs font-bold transition-colors ${
              isActive ? 'text-teal' : 'text-muted'
            }`}
          >
            <div
              className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center ${
                isActive ? 'bg-teal-soft' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
