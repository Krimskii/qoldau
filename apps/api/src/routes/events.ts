import { Router } from 'express';
import { store, type EventInput } from '../db/memory.js';

export const eventsRouter = Router();

/**
 * GET /api/events?childId=xxx
 * Возвращает список событий (отсортирован по timestamp DESC).
 */
eventsRouter.get('/', (req, res) => {
  const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;
  const events = store.listEvents({ childId });
  res.json({ ok: true, count: events.length, events });
});

/**
 * GET /api/events/:id
 * Возвращает одно событие.
 */
eventsRouter.get('/:id', (req, res) => {
  const event = store.getEvent(req.params.id);
  if (!event) {
    return res.status(404).json({ ok: false, error: 'Event not found' });
  }
  res.json({ ok: true, event });
});

/**
 * POST /api/events
 * Создаёт новое событие.
 * Body: EventInput (без id/timestamp/status — генерируются на сервере).
 */
eventsRouter.post('/', (req, res) => {
  const body = req.body as Partial<EventInput>;
  if (!body.childId || !body.type || !body.title || !body.description || !body.sourceRole) {
    return res.status(400).json({
      ok: false,
      error: 'Missing required fields: childId, type, title, description, sourceRole',
    });
  }
  const event = store.createEvent(body as EventInput);
  res.status(201).json({ ok: true, event });
});

/**
 * PATCH /api/events/:id
 * Частично обновляет событие.
 */
eventsRouter.patch('/:id', (req, res) => {
  const updated = store.updateEvent(req.params.id, req.body as Partial<EventInput>);
  if (!updated) {
    return res.status(404).json({ ok: false, error: 'Event not found' });
  }
  res.json({ ok: true, event: updated });
});

/**
 * DELETE /api/events/:id
 * Удаляет событие.
 */
eventsRouter.delete('/:id', (req, res) => {
  const ok = store.deleteEvent(req.params.id);
  if (!ok) {
    return res.status(404).json({ ok: false, error: 'Event not found' });
  }
  res.json({ ok: true });
});