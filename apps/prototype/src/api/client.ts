/**
 * API client для frontend (v0.4.0).
 *
 * Использует fetch + baseURL из env (VITE_API_BASE_URL).
 * Если API недоступен (network/CORS/4xx/5xx) — fallback на in-memory mock.
 *
 * Stores вызывают api.events.list() / api.recordings.list() и т.д.
 * Если запрос упал — store использует локальный кеш (localStorage или в памяти).
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
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