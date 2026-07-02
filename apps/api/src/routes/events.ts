/**
 * Events routes (v0.5.0) — uses Prisma repository.
 */
import { Router } from 'express';
import { eventsRepo, type EventInput } from '../repositories/events.js';

export const eventsRouter = Router();

/**
 * GET /api/events?childId=xxx
 */
eventsRouter.get('/', async (req, res, next) => {
  try {
    const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
    const events = await eventsRepo.list({ childId });
    res.json({ ok: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/:id
 */
eventsRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await eventsRepo.get(req.params.id);
    if (!event) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    res.json({ ok: true, event });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events
 */
eventsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<EventInput>;
    if (!body.childId || !body.type || !body.title || !body.description || !body.sourceRole) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: childId, type, title, description, sourceRole',
      });
    }
    const event = await eventsRepo.create(body as EventInput);
    res.status(201).json({ ok: true, event });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/events/:id
 */
eventsRouter.patch('/:id', async (req, res, next) => {
  try {
    const updated = await eventsRepo.update(req.params.id, req.body as Partial<EventInput>);
    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    res.json({ ok: true, event: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/events/:id
 */
eventsRouter.delete('/:id', async (req, res, next) => {
  try {
    const ok = await eventsRepo.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, error: 'Event not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});