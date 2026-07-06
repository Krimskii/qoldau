/**
 * API client для frontend (v0.4.0 → v1.5+ E7.5).
 *
 * Использует fetch + baseURL из env (VITE_API_BASE_URL).
 * Если API недоступен (network/CORS/4xx/5xx) — fallback на in-memory mock.
 *
 * v1.5+ E7.5 auth-ready:
 * - Authorization: Bearer <jwt> подмешивается автоматически из auth-стора
 *   (если есть jwt).
 * - На 401 (протух/нет токена) → мягкий редирект на /auth/login (НЕ белый
 *   экран). Только если VITE_REQUIRE_AUTH=true.
 * - На 403 → ApiError со статусом (caller сам решает показать ErrorState).
 * - В demo-режиме (VITE_REQUIRE_AUTH=false) — старое поведение, без
 *   принудительного логина.
 */

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/** Если true — на 401 редиректим на /auth/login. По умолчанию false (demo). */
export const REQUIRE_AUTH = (import.meta.env.VITE_REQUIRE_AUTH as string | undefined) === 'true';

export interface ApiOk<T> { ok: true; data?: T; [k: string]: unknown }
export interface ApiErr { ok: false; error: string; status?: number }
export type ApiResult<T> = ApiOk<T> | ApiErr;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Колбэк для получения текущего JWT из auth-стора. Lazy — чтобы не было цикла. */
let getJwtFn: (() => string | null) | null = null;
/** Колбэк для редиректа на /auth/login при 401 (вызывается из caller-роутера). */
let on401Fn: ((path: string) => void) | null = null;
/** v1.6 E9.1: колбэк refresh — auth-стор умеет обновить access JWT через
 *  refresh-токен. Возвращает Promise<boolean> (true если refresh удался). */
let refreshFn: (() => Promise<boolean>) | null = null;
/** v1.6 E9.1: колбэк logout — если refresh не удался, нужно почистить сессию
 *  и (опционально) редиректнуть. */
let onLogoutFn: (() => void | Promise<void>) | null = null;

/** Регистрирует getter текущего JWT. Вызывается один раз при инициализации auth-стора. */
export function registerAuthGetter(getter: () => string | null): void {
  getJwtFn = getter;
}

/** Регистрирует обработчик 401 (например, для мягкого редиректа на /auth/login). */
export function register401Handler(handler: (path: string) => void): void {
  on401Fn = handler;
}

/** Регистрирует refresh callback (v1.6 E9.1). */
export function registerRefreshHandler(handler: () => Promise<boolean>): void {
  refreshFn = handler;
}

/** Регистрирует logout callback (v1.6 E9.1). */
export function registerLogoutHandler(handler: () => void | Promise<void>): void {
  onLogoutFn = handler;
}

/**
 * Внутренний флаг: один запрос в процессе refresh — остальные ждут.
 * Иначе при нескольких параллельных 401 все одновременно вызовут refresh.
 */
let refreshInFlight: Promise<boolean> | null = null;

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const jwt = getJwtFn?.() ?? null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (jwt && !headers.Authorization) {
    headers.Authorization = `Bearer ${jwt}`;
  }
  let res = await fetch(url, {
    ...options,
    headers,
  });
  // v1.6 E9.1: 401 → попытка refresh → retry. Только ОДИН раз. Если refresh
  // не помог — logout и (если REQUIRE_AUTH) редирект.
  if (res.status === 401 && refreshFn && jwt) {
    if (!refreshInFlight) {
      refreshInFlight = refreshFn().finally(() => {
        // Сбрасываем через микротаск, чтобы pending запросы дождались.
        queueMicrotask(() => { refreshInFlight = null; });
      });
    }
    const refreshed = await refreshInFlight;
    if (refreshed) {
      const newJwt = getJwtFn?.() ?? null;
      if (newJwt) {
        headers.Authorization = `Bearer ${newJwt}`;
      }
      res = await fetch(url, { ...options, headers });
    } else {
      // Refresh не сработал — refresh-токен протух. Logout.
      if (onLogoutFn) {
        try { await onLogoutFn(); } catch { /* ignore */ }
      }
    }
  }
  if (!res.ok) {
    // v1.5+ E7.5: 401 → мягкий редирект на /auth/login (если REQUIRE_AUTH).
    if (res.status === 401) {
      if (REQUIRE_AUTH && on401Fn) {
        try { on401Fn(path); } catch { /* ignore */ }
      }
      throw new ApiError('Unauthorized', 401);
    }
    const text = await res.text().catch(() => '');
    throw new ApiError(text || res.statusText, res.status);
  }
  const json = (await res.json()) as ApiResult<T>;
  if (!json.ok) {
    throw new ApiError((json as ApiErr).error, res.status);
  }
  // Возвращаем весь JSON (caller сам вытащит нужное поле)
  return json as unknown as T;
}

/** Health check. Используется для определения — есть ли backend. */
export async function isApiAvailable(): Promise<boolean> {
  if (!BASE_URL) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  baseUrl: BASE_URL,

  // ===== Health =====
  health: () => request<{
    ok: boolean;
    service: string;
    version: string;
    phase: number;
    uptime: number;
    timestamp: string;
  }>('/api/health'),

  // ===== Events =====
  events: {
    list: (childId?: string) =>
      request<{ ok: boolean; count: number; events: unknown[] }>(
        `/api/events${childId ? `?childId=${encodeURIComponent(childId)}` : ''}`,
      ),
    get: (id: string) => request<{ ok: boolean; event: unknown }>(`/api/events/${id}`),
    create: (event: Record<string, unknown>) =>
      request<{ ok: boolean; event: unknown }>('/api/events', {
        method: 'POST',
        body: JSON.stringify(event),
      }),
    update: (id: string, patch: Record<string, unknown>) =>
      request<{ ok: boolean; event: unknown }>(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/events/${id}`, { method: 'DELETE' }),
  },

  // ===== Recordings =====
  recordings: {
    list: (childId?: string) =>
      request<{ ok: boolean; count: number; recordings: unknown[] }>(
        `/api/recordings${childId ? `?childId=${encodeURIComponent(childId)}` : ''}`,
      ),
    create: (rec: Record<string, unknown>) =>
      request<{ ok: boolean; recording: unknown }>('/api/recordings', {
        method: 'POST',
        body: JSON.stringify(rec),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/recordings/${id}`, { method: 'DELETE' }),
  },

  // ===== Children =====
  children: {
    list: () => request<{ ok: boolean; count: number; children: unknown[] }>('/api/children'),
    get: (id: string) => request<{ ok: boolean; child: unknown }>(`/api/children/${id}`),
  },

  // ===== STT (mock) =====
  stt: {
    transcribe: () =>
      request<{ ok: boolean; transcript: string; confidence: number; durationSec: number }>(
        '/api/stt/transcribe',
        { method: 'POST', body: JSON.stringify({}) },
      ),
  },

  // ===== AI parser (mock) =====
  ai: {
    parse: (transcript: string) =>
      request<{
        ok: boolean;
        events: unknown[];
        insight: string;
        clarificationQuestions: unknown[];
      }>('/api/ai/parse', {
        method: 'POST',
        body: JSON.stringify({ transcript }),
      }),
  },
};

export { ApiError };