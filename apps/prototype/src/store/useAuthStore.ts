/**
 * useAuthStore (v0.6.0 → v1.6 E9.1) — JWT + refresh-token auth state.
 *
 * Хранение через `api/auth.ts` (localStorage 'qoldau-auth-v2'). При загрузке
 * автоматически подтягивает сохранённый state и опционально проверяет через
 * /api/auth/me. v1.6: refresh-токен для обновления access JWT без
 * пере-логина + childIds в user для sync-скоупа.
 */
import { create } from 'zustand';
import { authApi, loadAuth, saveAuth, clearAuth, type AuthUser } from '@/api/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

export interface AuthStoreState {
  status: AuthStatus;
  user: AuthUser | null;
  jwt: string | null;
  /** v1.6 E9.1: refresh-токен (не передаётся в Authorization). */
  refreshToken: string | null;
  error: string | null;

  /** Инициализация из localStorage (вызывать на app start). */
  init: () => Promise<void>;
  /** Запросить magic-link по email. Возвращает devMagicUrl для тестирования. */
  requestMagicLink: (email: string) => Promise<{ devMagicUrl: string; token?: string }>;
  /** Подтвердить токен из magic-link и залогиниться. */
  verifyAndLogin: (token: string) => Promise<AuthUser>;
  /** v1.6 E9.1: обновить access JWT через refresh-токен. */
  refresh: () => Promise<boolean>;
  /** Выход (best-effort: ревокает refresh-токен на сервере, потом чистит локально). */
  logout: () => Promise<void>;
  /** Получить заголовок Authorization для ручных fetch-вызовов. */
  getAuthHeader: () => Record<string, string>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'idle',
  user: null,
  jwt: null,
  refreshToken: null,
  error: null,

  init: async () => {
    set({ status: 'loading' });
    const saved = loadAuth();
    if (!saved) {
      set({ status: 'guest' });
      return;
    }
    set({
      jwt: saved.jwt,
      refreshToken: saved.refreshToken,
      user: saved.user,
      status: 'authenticated',
    });
    // Опциональная проверка JWT на сервере (не критично если упадёт).
    try {
      const result = await authApi.me(saved.jwt);
      if (result.ok) {
        set({ user: result.user });
        // Refresh local copy с обновлёнными childIds/role.
        saveAuth({
          jwt: saved.jwt,
          refreshToken: saved.refreshToken,
          user: result.user,
          expiresAt: saved.expiresAt,
        });
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
      return { devMagicUrl: result.devMagicUrl, token: result.token };
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
      saveAuth({
        jwt: result.jwt,
        refreshToken: result.refreshToken,
        user: result.user,
        expiresAt,
      });
      set({
        jwt: result.jwt,
        refreshToken: result.refreshToken,
        user: result.user,
        status: 'authenticated',
      });
      return result.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'verify failed';
      set({ error: message });
      throw err;
    }
  },

  refresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return false;
    try {
      const result = await authApi.refresh(refreshToken);
      const expiresAt = Date.now() + 1000 * 60 * 60 * 8;
      saveAuth({
        jwt: result.jwt,
        refreshToken: result.refreshToken,
        user: result.user,
        expiresAt,
      });
      set({
        jwt: result.jwt,
        refreshToken: result.refreshToken,
        user: result.user,
      });
      return true;
    } catch {
      // Refresh не сработал — JWT/refresh истёк, нужно пере-логиниться.
      return false;
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    // Best-effort: ревокаем refresh на сервере (если доступен).
    if (refreshToken && authApi.isAvailable) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore — JWT уже мог истечь
      }
    }
    clearAuth();
    set({
      user: null,
      jwt: null,
      refreshToken: null,
      status: 'guest',
      error: null,
    });
  },

  getAuthHeader: (): Record<string, string> => {
    const jwt = get().jwt;
    if (!jwt) return {};
    return { Authorization: `Bearer ${jwt}` };
  },
}));