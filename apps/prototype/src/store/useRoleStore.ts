import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@/types/qoldau';

interface RoleState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (role: UserRole, page: string) => boolean;
}

const rolePermissions: Record<UserRole, string[]> = {
  parent: ['parent', 'overview'],
  child: ['child', 'overview'],
  tutor: ['tutor', 'overview'],
  specialist: ['specialist', 'overview'],
  overview: ['overview'],
};

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      currentRole: 'parent',
      setRole: (role) => set({ currentRole: role }),
      canAccess: (role, page) => {
        const allowedRoles = rolePermissions[role];
        return allowedRoles.some((r) => page.startsWith(`/${r}`));
      },
    }),
    {
      name: 'qoldau-role-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentRole: state.currentRole }),
      version: 1,
    },
  ),
);