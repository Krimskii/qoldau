/**
 * Children routes (v0.5.0) — uses Prisma repository.
 */
import { Router } from 'express';
import { childrenRepo } from '../repositories/children.js';

export const childrenRouter = Router();

childrenRouter.get('/', async (_req, res, next) => {
  try {
    const children = await childrenRepo.list();
    res.json({ ok: true, count: children.length, children });
  } catch (err) {
    next(err);
  }
});

childrenRouter.get('/:id', async (req, res, next) => {
  try {
    const child = await childrenRepo.get(req.params.id);
    if (!child) {
      return res.status(404).json({ ok: false, error: 'Child not found' });
    }
    res.json({ ok: true, child });
  } catch (err) {
    next(err);
  }
});