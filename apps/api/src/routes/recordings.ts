import { Router } from 'express';
import { store, type RecordingInput } from '../db/memory.js';

export const recordingsRouter = Router();

/**
 * GET /api/recordings?childId=xxx
 */
recordingsRouter.get('/', (req, res) => {
  const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
  const recordings = store.listRecordings({ childId });
  res.json({ ok: true, count: recordings.length, recordings });
});

/**
 * POST /api/recordings
 * Body: { childId, label, durationSec }
 */
recordingsRouter.post('/', (req, res) => {
  const body = req.body as Partial<RecordingInput>;
  if (!body.childId || !body.label || typeof body.durationSec !== 'number') {
    return res.status(400).json({
      ok: false,
      error: 'Missing required fields: childId, label, durationSec',
    });
  }
  const rec = store.createRecording(body as RecordingInput);
  res.status(201).json({ ok: true, recording: rec });
});

/**
 * DELETE /api/recordings/:id
 */
recordingsRouter.delete('/:id', (req, res) => {
  const ok = store.deleteRecording(req.params.id);
  if (!ok) {
    return res.status(404).json({ ok: false, error: 'Recording not found' });
  }
  res.json({ ok: true });
});