/**
 * Health routes (v0.7.4) — DB health-check + AI/STT mode + auth info.
 * Version читается из package.json (централизованно).
 */
import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { prisma } from '../db/prisma.js';
import { eventsRepo } from '../repositories/events.js';
import { recordingsRepo } from '../repositories/recordings.js';
import { getCache } from '../db/cache.js';
import { llmService } from '../services/llmService.js';
import { sttService } from '../services/sttService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// apps/api/src/routes/health.ts → ../../package.json (apps/api/package.json)
const PACKAGE_JSON = join(__dirname, '..', '..', 'package.json');

let cachedVersion: string | null = null;
function getAppVersion(): string {
  if (cachedVersion) return cachedVersion;
  try {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8')) as { version?: string };
    cachedVersion = pkg.version ?? '0.0.0';
    return cachedVersion;
  } catch {
    return '0.0.0';
  }
}

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
    version: getAppVersion(),
    phase: 3,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: {
      status: dbStatus,
      error: dbError,
    },
    cache: {
      type: getCache().type,
    },
    ai: llmService.status(),
    stt: sttService.status(),
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