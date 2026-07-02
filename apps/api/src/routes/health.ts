/**
 * Health routes (v0.5.0) — добавлен DB health-check.
 */
import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { eventsRepo } from '../repositories/events.js';
import { recordingsRepo } from '../repositories/recordings.js';
import { getCache } from '../db/cache.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  let dbStatus: 'ok' | 'error' = 'error';
  let dbError: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'ok';
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  res.json({
    ok: dbStatus === 'ok',
    service: 'qoldau-api',
    version: '0.5.0',
    phase: 2,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: {
      status: dbStatus,
      error: dbError,
    },
    cache: {
      type: getCache().type,
    },
  });
});

healthRouter.get('/stats', async (_req, res, next) => {
  try {
    const eventsCount = await eventsRepo.count();
    const recordingsCount = await recordingsRepo.count();
    res.json({
      ok: true,
      events: eventsCount,
      recordings: recordingsCount,
    });
  } catch (err) {
    next(err);
  }
});

healthRouter.post('/reset', async (_req, res, next) => {
  try {
    const eventsRemoved = await eventsRepo.clearAll();
    const recordingsRemoved = await recordingsRepo.clearAll();
    res.json({
      ok: true,
      message: 'Store cleared',
      removed: { events: eventsRemoved, recordings: recordingsRemoved },
    });
  } catch (err) {
    next(err);
  }
});