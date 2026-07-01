/**
 * GET /api/health — общий health-check.
 * GET /api/stats — статистика store.
 * POST /api/reset — полный сброс store (для demo / tests).
 */
import { Router } from 'express';
import { store } from '../db/memory.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'qoldau-api',
    version: '0.4.0',
    phase: 1,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/stats', (_req, res) => {
  res.json({
    ok: true,
    ...store.stats(),
  });
});

healthRouter.post('/reset', (_req, res) => {
  store.clear();
  res.json({ ok: true, message: 'Store cleared' });
});