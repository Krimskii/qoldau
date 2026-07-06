/**
 * Auth API client (v0.6.0 → v1.6 E9.1) — magic-link + refresh flow.
 *
 * Endpoints:
 * - auth.requestMagicLink(email) → { token, expiresAt, devMagicUrl }
 * - auth.verify(token) → { jwt, refreshToken, user {id,email,role,childIds} }
 * - auth.refresh(refreshToken) → { jwt, refreshToken, user }
 * - auth.logout(refreshToken) → { ok }
 * - auth.me() → { user } (требует Bearer JWT)
 *
 * v1.6 E9.1: добавлены refresh-токены (для обновления access JWT без
 * пере-логина), childIds в user (фильтр sync-скоупа).
 *
 * Все запросы идут через общий request() с auto-attach Authorization header
 * из localStorage (registerAuthGetter в api/client.ts).
 */

import { request, BASE_URL } from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  /** v1.6 E9.1: ребёнки, к которым у юзера есть доступ (для sync-скоупа). */
  childIds: string[];
}

const STORAGE_KEY = 'qoldau-auth-v2';

interface AuthState {
  jwt: string;
  /** v1.6 E9.1: refresh-токен для обновления access JWT. */
  refreshToken: string;
  user: AuthUser;
  expiresAt: number;
}

export function loadAuth(): AuthState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    // Backward-compat: v1 storage без refreshToken → null (принуждаем re-login).
    if (!parsed.refreshToken || !parsed.jwt || !parsed.user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (typeof parsed.expiresAt === 'number' && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed as AuthState;
  } catch {
    return null;
  }
}

export function saveAuth(state: AuthState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export const authApi = {
  baseUrl: BASE_URL,
  isAvailable: !!BASE_URL,

  async requestMagicLink(email: string): Promise<{
    ok: true;
    token: string;
    expiresAt: string;
    devMagicUrl: string;
  }> {
    return request('/api/auth/request-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verify(token: string): Promise<{
    ok: true;
    jwt: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    return request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /** v1.6 E9.1: обновить access JWT через refresh-токен. */
  async refresh(refreshToken: string): Promise<{
    ok: true;
    jwt: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    return request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /** v1.6 E9.1: revoke refresh-токен на сервере (best-effort). */
  async logout(refreshToken: string): Promise<{ ok: true }> {
    return request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async me(jwt: string): Promise<{ ok: true; user: AuthUser }> {
    return request('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${jwt}` },
    });
  },
};