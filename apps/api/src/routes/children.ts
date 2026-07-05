import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { assertChildAccess, requireChildAccess } from '../middleware/requireChildAccess.js';
import { childrenRepo } from '../repositories/children.js';

export const childrenRouter = Router();

const ACCESS_ROLES = new Set(['parent', 'tutor', 'specialist']);

childrenRouter.use(requireAuth);

childrenRouter.get('/', async (req, res, next) => {
  try {
    const children = await childrenRepo.listAccessible(req.user!.id);
    res.json({ ok: true, count: children.length, children });
  } catch (err) {
    next(err);
  }
});

childrenRouter.get('/:id/access', async (req, res, next) => {
  try {
    if (!(await assertChildAccess(req.user!.id, req.params.id, 'owner'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const access = await childrenRepo.listAccess(req.params.id);
    res.json({ ok: true, count: access.length, access });
  } catch (err) {
    next(err);
  }
});

childrenRouter.post('/:id/access', async (req, res, next) => {
  try {
    if (!(await assertChildAccess(req.user!.id, req.params.id, 'owner'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const body = req.body as { userId?: unknown; email?: unknown; role?: unknown };
    const role = typeof body.role === 'string' ? body.role : undefined;
    if (!role || !ACCESS_ROLES.has(role)) {
      return res.status(400).json({ ok: false, error: 'role must be parent, tutor, or specialist' });
    }

    let userId = typeof body.userId === 'string' ? body.userId : undefined;
    if (!userId) {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!email) {
        return res.status(400).json({ ok: false, error: 'userId or email required' });
      }
      const user = await prisma.user.upsert({
        where: { email },
        create: { email, role },
        update: {},
      });
      userId = user.id;
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        return res.status(404).json({ ok: false, error: 'User not found' });
      }
    }

    const access = await childrenRepo.grantAccess({
      childId: req.params.id,
      userId,
      role,
      grantedBy: req.user!.id,
    });
    res.status(201).json({ ok: true, access });
  } catch (err) {
    next(err);
  }
});

childrenRouter.delete('/:id/access/:userId', async (req, res, next) => {
  try {
    if (!(await assertChildAccess(req.user!.id, req.params.id, 'owner'))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    const ok = await childrenRepo.revokeAccess(req.params.id, req.params.userId);
    if (!ok) {
      return res.status(404).json({ ok: false, error: 'Access not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

childrenRouter.get('/:id', requireChildAccess('read'), async (req, res, next) => {
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
