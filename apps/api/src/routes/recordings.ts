import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { assertChildAccess } from '../middleware/requireChildAccess.js';
import { childrenRepo } from '../repositories/children.js';
import { recordingsRepo, type RecordingInput } from '../repositories/recordings.js';

export const recordingsRouter = Router();

recordingsRouter.use(requireAuth);

recordingsRouter.get('/', async (req, res, next) => {
  try {
    const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
    if (childId && !(await assertChildAccess(req.user!.id, childId, 'read'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const childIds = childId ? undefined : await childrenRepo.accessibleIds(req.user!.id);
    const recordings = await recordingsRepo.list({ childId, childIds });
    res.json({ ok: true, count: recordings.length, recordings });
  } catch (err) {
    next(err);
  }
});

recordingsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<RecordingInput>;
    if (!body.childId || !body.label || typeof body.durationSec !== 'number') {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: childId, label, durationSec',
      });
    }
    if (!(await assertChildAccess(req.user!.id, body.childId, 'write'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const rec = await recordingsRepo.create(body as RecordingInput);
    res.status(201).json({ ok: true, recording: rec });
  } catch (err) {
    next(err);
  }
});

recordingsRouter.delete('/:id', async (req, res, next) => {
  try {
    const recording = await recordingsRepo.get(req.params.id);
    if (!recording) {
      return res.status(404).json({ ok: false, error: 'Recording not found' });
    }
    if (!(await assertChildAccess(req.user!.id, recording.childId, 'write'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const ok = await recordingsRepo.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, error: 'Recording not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
