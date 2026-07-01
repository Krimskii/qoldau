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

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setRole } = useRoleStore();
  const navigate = useNavigate();

  const roles: UserRole[] = ['parent', 'child', 'tutor', 'specialist', 'overview'];

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    if (role === 'overview') {
      navigate('/overview');
    } else {
      navigate(`/${role}/home`);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[#F3F7F6] border border-line rounded-xl p-1">
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => handleRoleChange(role)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentRole === role
              ? 'bg-white text-teal-dark shadow-[0_3px_10px_rgba(0,0,0,0.04)]'
              : 'text-muted hover:text-ink'
          }`}
        >
          {roleLabels[role]}
        </button>
      ))}
    </div>
  );
};
