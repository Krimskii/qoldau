/**
 * sentry (v0.7.3) — Sentry integration для frontend.
 *
 * Opt-in: активируется только если `VITE_SENTRY_DSN` env задан.
 * Без DSN — no-op.
 *
 * Features:
 * - Error tracking (React error boundaries → Sentry)
 * - Performance tracing (browserTracingIntegration)
 * - Session replay (опционально через VITE_SENTRY_REPLAYS_SESSION_RATE)
 */
import * as Sentry from '@sentry/react';

let initialized = false;

interface SentryEnv {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionRate: number;
  replaysErrorRate: number;
}

function loadEnv(): SentryEnv {
  // Vite injects import.meta.env.* at build time
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim() ?? '';
  const environment = (import.meta.env.MODE as string) ?? 'development';
  const tracesSampleRate = environment === 'production' ? 0.1 : 1.0;
  const replaysSessionRate = Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_RATE ?? 0);
  const replaysErrorRate = Number(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_RATE ?? 1);
  return { dsn, environment, tracesSampleRate, replaysSessionRate, replaysErrorRate };
}

export const sentry = {
  init(): void {
    if (initialized) return;
    const env = loadEnv();
    if (!env.dsn) {
      console.info('[sentry] VITE_SENTRY_DSN not set — error tracking disabled');
      return;
    }
    Sentry.init({
      dsn: env.dsn,
      environment: env.environment,
      tracesSampleRate: env.tracesSampleRate,
      sendDefaultPii: false,
      integrations: [
        Sentry.browserTracingIntegration(),
        // Session Replay (опционально)
        ...(env.replaysSessionRate > 0
          ? [
              Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
              }),
            ]
          : []),
      ],
      replaysSessionSampleRate: env.replaysSessionRate,
      replaysOnErrorSampleRate: env.replaysErrorRate,
      initialScope: {
        tags: {
          service: 'qoldau-frontend',
        },
      },
    });
    initialized = true;
    console.info(`[sentry] initialized: env=${env.environment}, sampleRate=${env.tracesSampleRate}`);
  },

  /** Capture manual exception. */
  captureException(err: Error, context?: Record<string, unknown>): void {
    if (!initialized) return;
    Sentry.captureException(err, { extra: context });
  },

  /** Capture message. */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!initialized) return;
    Sentry.captureMessage(message, level);
  },

  /** Set user context (для magic-link auth). */
  setUser(user: { id: string; email: string; role: string } | null): void {
    if (!initialized) return;
    Sentry.setUser(user);
  },

  isEnabled(): boolean {
    return initialized;
  },
};

/** React Router hooks для Sentry (browser) — connect React Router v6. */
// Note: Sentry.reactRouterV6Instrumentation доступен в @sentry/react 7+,
// но в текущей версии API изменился. Используйте SentryErrorBoundary ниже.
// export const sentryRouterInstrumentation = Sentry.reactRouterV6Instrumentation;

/** ErrorBoundary component (Sentry-aware). */
export const SentryErrorBoundary = Sentry.ErrorBoundary;