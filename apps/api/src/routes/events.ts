import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { assertChildAccess } from '../middleware/requireChildAccess.js';
import { childrenRepo } from '../repositories/children.js';
import { eventsRepo, type EventInput } from '../repositories/events.js';
import { realtimeService } from '../services/realtimeService.js';

export const eventsRouter = Router();

eventsRouter.use(requireAuth);

eventsRouter.get('/', async (req, res, next) => {
  try {
    const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
    if (childId && !(await assertChildAccess(req.user!.id, childId, 'read'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const childIds = childId ? undefined : await childrenRepo.accessibleIds(req.user!.id);
    const events = await eventsRepo.list({ childId, childIds });
    res.json({ ok: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
});

eventsRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await eventsRepo.get(req.params.id);
    if (!event) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    if (!(await assertChildAccess(req.user!.id, event.childId, 'read'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    res.json({ ok: true, event });
  } catch (err) {
    next(err);
  }
});

eventsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<EventInput>;
    if (!body.childId || !body.type || !body.title || !body.description || !body.sourceRole) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: childId, type, title, description, sourceRole',
      });
    }
    if (!(await assertChildAccess(req.user!.id, body.childId, 'write'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const event = await eventsRepo.create(body as EventInput);
    realtimeService.broadcastEvent({ childId: event.childId, id: event.id });
    res.status(201).json({ ok: true, event });
  } catch (err) {
    next(err);
  }
});

eventsRouter.patch('/:id', async (req, res, next) => {
  try {
    const existing = await eventsRepo.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    if (!(await assertChildAccess(req.user!.id, existing.childId, 'write'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const updated = await eventsRepo.update(req.params.id, req.body as Partial<EventInput>);
    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    realtimeService.broadcastEventUpdate({ childId: updated.childId, id: updated.id });
    res.json({ ok: true, event: updated });
  } catch (err) {
    next(err);
  }
});

eventsRouter.delete('/:id', async (req, res, next) => {
  try {
    const event = await eventsRepo.get(req.params.id);
    if (!event) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    if (!(await assertChildAccess(req.user!.id, event.childId, 'write'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const ok = await eventsRepo.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    realtimeService.broadcastEventDelete({ childId: event.childId, id: event.id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
