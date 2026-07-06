/**
 * api/client 401-refresh tests (v1.6 E9.5) — отдельный файл без mock'ов
 * @/api/client. Мокаем глобальный fetch напрямую.
 *
 * Проверяем:
 * - 401 → вызов refreshHandler → retry с новым токеном.
 * - 401 + refresh fail → logout handler + throw.
 * - 401 без jwt (demo) → throw без logout.
 * - Параллельные 401 координируются через refreshInFlight.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Чистый import БЕЗ mock — нужен реальный модуль.
import * as client from '@/api/client';

// Polyfill fetch если нужно.
const realFetch = globalThis.fetch;

describe('api/client 401-refresh (E9.5)', () => {
  let mockedFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockedFetch = vi.fn();
    globalThis.fetch = mockedFetch as unknown as typeof fetch;
    // Регистрируем handlers — каждый тест переустанавливает.
    client.registerAuthGetter(() => null);
    client.register401Handler(() => {});
    client.registerRefreshHandler(async () => false);
    client.registerLogoutHandler(() => {});
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('401 → refresh handler → retry с обновлённым jwt → ok', async () => {
    let currentJwt = 'jwt-old';
    let refreshed = false;
    client.registerAuthGetter(() => currentJwt);
    client.registerRefreshHandler(async () => {
      refreshed = true;
      currentJwt = 'jwt-new';
      return true;
    });

    // Первый запрос → 401, второй (с jwt-new) → ok.
    mockedFetch
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, applied: 0, serverTime: 'T' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const result = await client.request<{ ok: boolean; applied: number }>(
      '/api/sync/pull?childId=x',
    );
    expect(result.ok).toBe(true);
    expect(result.applied).toBe(0);
    expect(refreshed).toBe(true);
    expect(mockedFetch).toHaveBeenCalledTimes(2);
    // Второй запрос — с обновлённым jwt.
    const secondCallInit = mockedFetch.mock.calls[1]?.[1] as RequestInit;
    const secondHeaders = secondCallInit.headers as Record<string, string>;
    expect(secondHeaders.Authorization).toBe('Bearer jwt-new');
  });

  it('401 + refresh fail → logout handler + throw ApiError(401)', async () => {
    let loggedOut = false;
    client.registerAuthGetter(() => 'jwt-old');
    client.registerRefreshHandler(async () => false);
    client.registerLogoutHandler(() => { loggedOut = true; });

    mockedFetch.mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 }),
    );

    await expect(client.request('/api/sync/pull?childId=x')).rejects.toThrow();
    expect(loggedOut).toBe(true);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it('401 без jwt (demo) → throw ApiError без logout', async () => {
    let loggedOut = false;
    // Нет jwt — getter возвращает null.
    client.registerAuthGetter(() => null);
    client.registerRefreshHandler(async () => true); // refresh всё равно не вызовется
    client.registerLogoutHandler(() => { loggedOut = true; });

    mockedFetch.mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 }),
    );

    await expect(client.request('/api/sync/pull?childId=x')).rejects.toThrow();
    expect(loggedOut).toBe(false);
  });

  it('параллельные 401 — refresh вызывается ОДИН раз (refreshInFlight координирует)', async () => {
    let refreshCount = 0;
    client.registerAuthGetter(() => 'jwt-old');
    client.registerRefreshHandler(async () => {
      refreshCount++;
      // Имитация latency.
      await new Promise((r) => setTimeout(r, 10));
      return true;
    });
    client.registerLogoutHandler(() => {});

    // 3 параллельных запроса → все получают 401 → все ждут ОДИН refresh →
    // каждый делает retry (тоже 401, нет success-мока для retry).
    // Главное — refresh вызван ОДИН раз для всех 3.
    for (let i = 0; i < 6; i++) {
      mockedFetch.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
    }

    const results = await Promise.allSettled([
      client.request('/api/a'),
      client.request('/api/b'),
      client.request('/api/c'),
    ]);
    expect(refreshCount).toBe(1);
    // Каждый запрос делает: original 401 → refresh → retry 401 = 2 fetches × 3 = 6.
    expect(mockedFetch).toHaveBeenCalledTimes(6);
    // Все упали (refresh не помог против 401 → 401 retry).
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
  });
});