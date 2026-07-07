/**
 * POST /api/stt/transcribe — Speech-to-Text (v0.6.3).
 *
 * Phase 1: mock (фиксированный transcript после 1.5с задержки).
 * Phase 2: opt-in Whisper API через WHISPER_API_KEY env.
 *
 * Body: { audio: base64-encoded file, language?: string, mimeType?: string }
 * Response: { ok, transcript, confidence, durationSec, sttSource }
 */
import { Router } from 'express';
import { sttService } from '../services/sttService.js';
import { sttRateLimit } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validateBody.js';
import { sttTranscribeBodySchema } from '../validation/requestSchemas.js';

export const sttRouter = Router();

sttRouter.post('/transcribe', sttRateLimit, validateBody(sttTranscribeBodySchema), async (req, res, next) => {
  try {
    const { audio = '', language, mimeType } = req.body as { audio?: string; language?: string; mimeType?: string };
    // Минимальная задержка 400мс для UX-консистентности.
    const t0 = Date.now();
    const result = await sttService.transcribe({ audio, language, mimeType });
    const elapsed = Date.now() - t0;
    if (elapsed < 400) {
      await new Promise((r) => setTimeout(r, 400 - elapsed));
    }
    res.json({ ok: true, ...result, sttSource: result.source });
  } catch (err) {
    next(err);
  }
});

sttRouter.get('/health', (_req, res) => {
  const status = sttService.status();
  res.json({
    ok: true,
    service: 'stt',
    enabled: status.enabled,
    mode: status.source,
    model: status.model,
  });
});
