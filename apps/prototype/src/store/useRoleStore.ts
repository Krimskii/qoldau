import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@/types/qoldau';

interface RoleState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (role: UserRole, page: string) => boolean;
}

const rolePermissions: Record<UserRole, string[]> = {
  parent: ['parent'],
  child: ['child'],
  tutor: ['tutor', 'specialist'],
  specialist: ['specialist', 'tutor'],
  overview: ['parent'],
};

/**
 * v0.6.1: tutor и overview роли объединены в specialist.
 * Мигрируем старые значения, чтобы UI не ломался.
 */
function migrateRole(role: UserRole | string | undefined): UserRole {
  if (role === 'parent' || role === 'child' || role === 'specialist') return role;
  if (role === 'tutor' || role === 'overview') return 'specialist';
  return 'parent';
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      currentRole: 'parent',
      setRole: (role) => set({ currentRole: migrateRole(role) }),
      canAccess: (role, page) => {
        const allowedRoles = rolePermissions[role];
        return allowedRoles.some((r) => page.startsWith(`/${r}`));
      },
    }),
    {
      name: 'qoldau-role-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentRole: state.currentRole }),
      version: 2,
      migrate: (persistedState, _version) => {
        const state = persistedState as { currentRole?: UserRole | string } | null;
        if (state && typeof state.currentRole === 'string') {
          state.currentRole = migrateRole(state.currentRole);
        }
        return state as RoleState;
      },
    },
  ),
);