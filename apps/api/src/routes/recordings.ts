/**
 * Recordings routes (v0.5.0) — uses Prisma repository.
 */
import { Router } from 'express';
import { recordingsRepo, type RecordingInput } from '../repositories/recordings.js';

export const recordingsRouter = Router();

/**
 * GET /api/recordings?childId=xxx
 */
recordingsRouter.get('/', async (req, res, next) => {
  try {
    const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
    const recordings = await recordingsRepo.list({ childId });
    res.json({ ok: true, count: recordings.length, recordings });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/recordings
 */
recordingsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<RecordingInput>;
    if (!body.childId || !body.label || typeof body.durationSec !== 'number') {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: childId, label, durationSec',
      });
    }
    const rec = await recordingsRepo.create(body as RecordingInput);
    res.status(201).json({ ok: true, recording: rec });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/recordings/:id
 */
recordingsRouter.delete('/:id', async (req, res, next) => {
  try {
    const ok = await recordingsRepo.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, error: 'Recording not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});