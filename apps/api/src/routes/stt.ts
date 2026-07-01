/**
 * POST /api/stt/transcribe — mock Speech-to-Text (v0.4.0).
 *
 * Phase 1: возвращает фиксированный демо-транскрипт после задержки 1.5с.
 * Phase 2: заменяется на Whisper API / Web Speech API.
 *
 * Body: { audio: base64? } — в текущей реализации игнорируется.
 * Response: { ok, transcript, confidence, durationSec }
 */
import { Router } from 'express';

export const sttRouter = Router();

const DEMO_TRANSCRIPT =
  'Алихан поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.';

sttRouter.post('/transcribe', async (req, res) => {
  // Имитация работы STT-движка
  await new Promise((r) => setTimeout(r, 1500));

  res.json({
    ok: true,
    transcript: DEMO_TRANSCRIPT,
    confidence: 0.87,
    durationSec: 18,
    sttSource: 'mock',
  });
});

/**
 * GET /api/stt/health — для проверки доступности STT-эндпоинта.
 */
sttRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'stt',
    mode: 'mock',
    model: 'demo-transcript-v1',
    phase: 1,
  });
});