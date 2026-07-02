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
  overview: ['parent', 'child', 'tutor', 'specialist', 'overview'],
};

/**
 * v0.6.2: landing /overview возвращён, role='overview' означает «не выбрана роль».
 * Мигрируем старые значения: 'overview' в localStorage (от v0.6.1) → 'parent' (default).
 */
function migrateRole(role: UserRole | string | undefined): UserRole {
  if (role === 'parent' || role === 'child' || role === 'tutor' || role === 'specialist' || role === 'overview') {
    return role;
  }
  return 'overview';
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      currentRole: 'overview', // v0.6.2: по дефолту — landing
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
      version: 3,
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