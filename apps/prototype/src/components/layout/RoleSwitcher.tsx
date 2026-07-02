import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/qoldau';
import { useRoleStore } from '@/store/useRoleStore';

const roleLabels: Record<UserRole, string> = {
  parent: 'Родитель',
  child: 'Ребёнок',
  tutor: 'Тьютор',
  specialist: 'Специалист',
  overview: 'Обзор',
};

/**
 * RoleSwitcher (v0.6.1) — переключатель ролей.
 *
 * v0.6.1: Тьютор и Специалист объединены в один таб «Специалист» (одинаковый
 * workflow: наблюдения + отчёты). Таб «Обзор» убран — landing-страница
 * больше не нужна, корень ведёт на /parent/home.
 *
 * Роли в RoleStore остаются все 5 (UserRole) для обратной совместимости,
 * но в UI показываются только 3.
 */
export const RoleSwitcher: React.FC = () => {
  const { currentRole, setRole } = useRoleStore();
  const navigate = useNavigate();

  // Табы в порядке: Родитель, Ребёнок, Специалист (включая тьютора).
  const tabs: Array<{ role: UserRole; label: string; path: string }> = [
    { role: 'parent', label: roleLabels.parent, path: '/parent/home' },
    { role: 'child', label: roleLabels.child, path: '/child/home' },
    { role: 'specialist', label: roleLabels.specialist, path: '/tutor/home' },
  ];

  const activeRole: UserRole = (tabs.some((t) => t.role === currentRole) ? currentRole : 'parent');

  const handleRoleChange = (tab: { role: UserRole; path: string }) => {
    setRole(tab.role);
    navigate(tab.path);
  };

  return (
    <div className="flex items-center gap-1 bg-[#F3F7F6] border border-line rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.role}
          onClick={() => handleRoleChange(tab)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeRole === tab.role
              ? 'bg-white text-teal-dark shadow-[0_3px_10px_rgba(0,0,0,0.04)]'
              : 'text-muted hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};