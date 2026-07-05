import { Router } from 'express';
import { audioPipelineService } from './audioPipeline.service.js';
import { AudioPipelineError, type AudioIngestRequest } from './audioPipeline.types.js';
import { audioIngestRateLimit } from '../../middleware/rateLimit.js';
import { validateBody } from '../../middleware/validateBody.js';
import { audioIngestBodySchema } from '../../validation/requestSchemas.js';

export const audioRouter = Router();

/**
 * POST /api/audio/ingest
 *
 * Stateless AI proxy:
 * audioBase64 -> STT -> LLM parser -> parsed payload for local frontend storage.
 */
audioRouter.post('/ingest', audioIngestRateLimit, validateBody(audioIngestBodySchema), async (req, res) => {
  try {
    const result = await audioPipelineService.process(req.body as AudioIngestRequest);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof AudioPipelineError) {
      return res.status(err.status).json({
        ok: false,
        code: err.code,
        error: err.message,
      });
    }
    console.error('[audio] ingest failed:', {
      requestId: req.requestId ?? '-',
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(502).json({
      ok: false,
      code: 'AUDIO_PIPELINE_FAILED',
      error: 'Audio processing failed. Please try again.',
    });
  }
});

audioRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'audio-pipeline',
    mode: 'sync',
    maxAudioMb: Number(process.env.AUDIO_MAX_MB ?? 25),
    jsonBodyLimit: process.env.JSON_BODY_LIMIT_AUDIO ?? '35mb',
    rateLimitPerMin: Number(process.env.AUDIO_INGEST_RATE_LIMIT_PER_MIN ?? 10),
  });
});
