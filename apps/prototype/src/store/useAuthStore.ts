/**
 * useAuthStore (v0.6.0) — JWT auth state.
 *
 * Без persist (JWT хранится в localStorage через `api/auth.ts`).
 * При загрузке автоматически подтягивает сохранённый state и опционально
 * проверяет через /api/auth/me (если backend доступен).
 */
import { create } from 'zustand';
import { authApi, loadAuth, saveAuth, clearAuth, type AuthUser } from '@/api/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

export interface AuthStoreState {
  status: AuthStatus;
  user: AuthUser | null;
  jwt: string | null;
  error: string | null;

  /** Инициализация из localStorage (вызывать на app start). */
  init: () => Promise<void>;
  /** Запросить magic-link по email. Возвращает devMagicUrl для тестирования. */
  requestMagicLink: (email: string) => Promise<{ devMagicUrl: string }>;
  /** Подтвердить токен из magic-link и залогиниться. */
  verifyAndLogin: (token: string) => Promise<AuthUser>;
  /** Выход. */
  logout: () => void;
  /** Получить заголовок Authorization для ручных fetch-вызовов. */
  getAuthHeader: () => Record<string, string>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'idle',
  user: null,
  jwt: null,
  error: null,

  init: async () => {
    set({ status: 'loading' });
    const saved = loadAuth();
    if (!saved) {
      set({ status: 'guest' });
      return;
    }
    set({ jwt: saved.jwt, user: saved.user, status: 'authenticated' });
    // Опциональная проверка JWT на сервере (не критично если упадёт).
    try {
      const result = await authApi.me(saved.jwt);
      if (result.ok) {
        set({ user: result.user });
      }
    } catch {
      // ignore — JWT мог истечь или backend недоступен
    }
  },

  requestMagicLink: async (email: string) => {
    if (!authApi.isAvailable) {
      throw new Error('Backend недоступен. Auth работает только при поднятом API.');
    }
    set({ error: null });
    try {
      const result = await authApi.requestMagicLink(email);
      return { devMagicUrl: result.devMagicUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'request failed';
      set({ error: message });
      throw err;
    }
  },

  verifyAndLogin: async (token: string) => {
    set({ error: null });
    try {
      const result = await authApi.verify(token);
      const expiresAt = Date.now() + 1000 * 60 * 60 * 8; // 8 часов (server TTL = 15 мин, но для UX)
      saveAuth({ jwt: result.jwt, user: result.user, expiresAt });
      set({ jwt: result.jwt, user: result.user, status: 'authenticated' });
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'verify failed';
      set({ error: message });
      throw err;
    }
  },

  logout: () => {
    clearAuth();
    set({ user: null, jwt: null, status: 'guest', error: null });
  },

  getAuthHeader: (): Record<string, string> => {
    const jwt = get().jwt;
    if (!jwt) return {};
    return { Authorization: `Bearer ${jwt}` };
  },
}));