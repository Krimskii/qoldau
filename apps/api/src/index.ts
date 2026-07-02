/**
 * Qoldau AI backend API (v0.6.0) — Prisma + cache + Anthropic Claude + auth.
 *
 * Endpoints (18):
 *   GET  /api/health
 *   GET  /api/stats
 *   POST /api/reset
 *   GET  /api/children, /api/children/:id
 *   GET  /api/events, /api/events/:id
 *   POST /api/events, PATCH /api/events/:id, DELETE /api/events/:id
 *   GET  /api/recordings, POST /api/recordings, DELETE /api/recordings/:id
 *   POST /api/stt/transcribe (mock)
 *   POST /api/ai/parse (Claude / mock)
 *   POST /api/auth/request-magic-link, POST /api/auth/verify, GET /api/auth/me
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger.js';
import { healthRouter } from './routes/health.js';
import { eventsRouter } from './routes/events.js';
import { recordingsRouter } from './routes/recordings.js';
import { sttRouter } from './routes/stt.js';
import { aiRouter } from './routes/ai.js';
import { authRouter } from './routes/auth.js';
import { childrenRouter } from './routes/children.js';
import { prisma, disconnectPrisma } from './db/prisma.js';
import { getCache } from './db/cache.js';
import { runSeed } from './db/seed-runner.js';
import { eventsRepo } from './repositories/events.js';
import { recordingsRepo } from './repositories/recordings.js';
import { llmService } from './services/llmService.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// ===== Middleware =====
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(logger);

// ===== Routes =====
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'qoldau-api',
    version: '0.6.0',
    docs: '/api/health',
    ai: llmService.status(),
  });
});

app.use('/api/health', healthRouter);
app.use('/api/stats', healthRouter);
app.use('/api/children', childrenRouter);
app.use('/api/events', eventsRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/stt', sttRouter);
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);

// Reset endpoint на /api/reset
import { Router as ResetRouter } from 'express';
const resetRouter = ResetRouter();
resetRouter.post('/', async (_req, res, next) => {
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
app.use('/api/reset', resetRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.path });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: err.message });
});

// ===== Startup =====
async function start() {
  // 1. Подключаемся к БД
  try {
    await prisma.$connect();
    console.log('[db] Prisma connected');
  } catch (err) {
    console.error('[db] Prisma connection failed:', err);
    process.exit(1);
  }

  // 2. Инициализируем cache (in-memory или Redis)
  getCache();

  // 3. Запускаем seed (если БД пустая)
  try {
    await runSeed();
  } catch (err) {
    console.error('[seed] Seed failed:', err);
    // Не фатально — продолжаем
  }

  // 4. Запускаем HTTP сервер
  app.listen(PORT, () => {
    console.log(`\n🟢  Qoldau API v0.6.0`);
    console.log(`   listening on http://localhost:${PORT}`);
    console.log(`   health: http://localhost:${PORT}/api/health`);
    console.log(`   CORS:   ${process.env.CORS_ORIGIN ?? 'http://localhost:5173'}`);
    console.log(`   DB:     ${process.env.DATABASE_URL ?? 'sqlite'}`);
    const llm = llmService.status();
    console.log(`   AI:     ${llm.source}${llm.enabled ? ` (model: ${llm.model})` : ' (mock fallback — set ANTHROPIC_API_KEY)'}\n`);
  });
}

// ===== Graceful shutdown =====
async function shutdown() {
  console.log('\n[shutdown] Closing...');
  await disconnectPrisma();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();