/**
 * sentry (v0.7.3) — Sentry integration для backend.
 *
 * Opt-in: активируется только если `SENTRY_DSN` env задан.
 * Без DSN — no-op, всё работает как раньше.
 *
 * Features:
 * - Error tracking (uncaughtException, unhandledRejection)
 * - HTTP request breadcrumbs
 * - Performance tracing (sentryTransactionsSampleRate: 0.1 в prod)
 */
import * as Sentry from '@sentry/node';
import type { Express, Request, Response, NextFunction } from 'express';

let initialized = false;

export const sentry = {
  /**
   * Инициализирует Sentry. Вызывать из index.ts САМЫМ ПЕРВЫМ,
   * до любых других middleware.
   */
  init(app: Express): void {
    const dsn = process.env.SENTRY_DSN?.trim();
    if (!dsn) {
      console.log('[sentry] SENTRY_DSN not set — error tracking disabled');
      return;
    }
    const environment = process.env.NODE_ENV ?? 'development';
    const tracesSampleRate = environment === 'production' ? 0.1 : 1.0;

    Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
      // Do not send child names, transcripts, audio payloads, cookies, or auth headers.
      sendDefaultPii: false,
      beforeSend(event) {
        if (event.request) {
          delete event.request.data;
          delete event.request.cookies;
          delete event.request.headers;
          delete event.request.query_string;
        }
        if (event.extra) {
          delete event.extra.audioBase64;
          delete event.extra.transcript;
          delete event.extra.childName;
          delete event.extra.childId;
        }
        return event;
      },
      integrations: [
        // Express request handler должен быть зарегистрирован ПОСЛЕ init
        // и ДО всех routes. Вызывающий код ответственен за порядок.
        Sentry.expressIntegration(),
      ],
      // Тэги для удобной фильтрации в Sentry UI
      initialScope: {
        tags: {
          service: 'qoldau-api',
          version: process.env.npm_package_version ?? '0.7.3',
        },
      },
    });

    // Request + Error handlers — Sentry v8+ API
    Sentry.setupExpressErrorHandler(app);

    initialized = true;
    console.log(`[sentry] initialized: env=${environment}, sampleRate=${tracesSampleRate}`);
  },

  /** Capture manual error. */
  captureException(err: Error, context?: Record<string, unknown>): void {
    if (!initialized) return;
    Sentry.captureException(err, { extra: context });
  },

  /** Capture message (non-error). */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!initialized) return;
    Sentry.captureMessage(message, level);
  },

  isEnabled(): boolean {
    return initialized;
  },
};

/** Express error handler middleware (Sentry-aware). */
export function sentryErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (sentry.isEnabled()) {
    // Sentry уже обработал через expressErrorHandler
  }
  // Пробрасываем дальше к финальному error handler в index.ts
  next(err);
}
