import { Router } from 'express';
import { audioPipelineService } from './audioPipeline.service.js';
import { AudioPipelineError, type AudioIngestRequest } from './audioPipeline.types.js';

export const audioRouter = Router();

/**
 * POST /api/audio/ingest
 *
 * Sync MVP audio pipeline:
 * audioBase64 -> STT -> LLM parser -> recording/events -> realtime broadcast.
 */
audioRouter.post('/ingest', async (req, res, next) => {
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
    next(err);
  }
});

audioRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'audio-pipeline',
    mode: 'sync',
    maxAudioMb: Number(process.env.AUDIO_MAX_MB ?? 25),
  });
});
