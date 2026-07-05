/**
 * Stateless API health: no database, auth, cache, or realtime dependency.
 */
import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { llmService } from '../services/llmService.js';
import { sttService } from '../services/sttService.js';
import { checkDatabase } from '../db/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
export const readyRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const database = await checkDatabase();
  res.json({
    ok: true,
    service: 'qoldau-ai-proxy',
    version: getAppVersion(),
    mode: 'stateless',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database,
    ai: llmService.status(),
    stt: sttService.status(),
  });
});

readyRouter.get('/', async (_req, res) => {
  const database = await checkDatabase();
  res.status(database.ok ? 200 : 503).json({
    ok: database.ok,
    service: 'qoldau-ai-proxy',
    readiness: database.ok ? 'ready' : 'not_ready',
    database,
    timestamp: new Date().toISOString(),
  });
});
