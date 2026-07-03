/**
 * rateLimit (v0.6.3) — express-rate-limit для auth + AI endpoints.
 *
 * Auth: 10 запросов / 15 мин с одного IP (anti-bruteforce для magic-link).
 * AI: 30 запросов / мин с одного IP (anti-spam для парсинга).
 */
import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 мин
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Слишком много запросов. Подождите 15 минут.' },
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 мин
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Слишком много запросов к AI. Подождите минуту.' },
});

export const sttRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Слишком много STT-запросов. Подождите минуту.' },
});

export const audioIngestRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.AUDIO_INGEST_RATE_LIMIT_PER_MIN ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    code: 'AUDIO_RATE_LIMITED',
    error: 'Too many audio requests. Please wait a minute.',
  },
});
