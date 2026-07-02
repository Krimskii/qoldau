/**
 * Auth API client (v0.6.0) — magic-link flow.
 *
 * Endpoints:
 * - auth.requestMagicLink(email) → { token, expiresAt, devMagicUrl }
 * - auth.verify(token) → { jwt, user }
 * - auth.me() → { user } (требует Bearer JWT)
 *
 * Все запросы идут через общий request() с auto-attach Authorization header из localStorage.
 */

import { request, BASE_URL } from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

const STORAGE_KEY = 'qoldau-auth-v1';

interface AuthState {
  jwt: string;
  user: AuthUser;
  expiresAt: number;
}

export function loadAuth(): AuthState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (typeof parsed.expiresAt === 'number' && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
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

  async verify(token: string): Promise<{ ok: true; jwt: string; user: AuthUser }> {
    return request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async me(jwt: string): Promise<{ ok: true; user: AuthUser }> {
    return request('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${jwt}` },
    });
  },
};