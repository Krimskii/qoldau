/**
 * Qoldau AI backend API (v0.4.0).
 *
 * Express + TypeScript, in-memory store.
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/stats
 *   POST /api/reset
 *   GET  /api/children
 *   GET  /api/children/:id
 *   GET  /api/events?childId=
 *   GET  /api/events/:id
 *   POST /api/events
 *   PATCH /api/events/:id
 *   DELETE /api/events/:id
 *   GET  /api/recordings?childId=
 *   POST /api/recordings
 *   DELETE /api/recordings/:id
 *   POST /api/stt/transcribe (mock)
 *   GET  /api/stt/health
 *   POST /api/ai/parse (mock)
 *   GET  /api/ai/health
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
import { childrenRouter } from './routes/children.js';

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
    version: '0.4.0',
    docs: '/api/health',
  });
});

app.use('/api/health', healthRouter);
app.use('/api/stats', healthRouter); // alias
app.use('/api/reset', healthRouter); // alias
app.use('/api/children', childrenRouter);
app.use('/api/events', eventsRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/stt', sttRouter);
app.use('/api/ai', aiRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.path });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: err.message });
});

// ===== Start =====
app.listen(PORT, () => {
  console.log(`\n🟢  Qoldau API v0.4.0`);
  console.log(`   listening on http://localhost:${PORT}`);
  console.log(`   health: http://localhost:${PORT}/api/health`);
  console.log(`   CORS:   ${process.env.CORS_ORIGIN ?? 'http://localhost:5173'}\n`);
});