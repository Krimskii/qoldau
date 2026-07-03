/**
 * Qoldau AI stateless backend.
 *
 * The pilot stores family data locally on-device. This API only proxies AI work:
 * audio -> STT -> LLM parser -> structured response.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger.js';
import { healthRouter } from './routes/health.js';
import { sttRouter } from './routes/stt.js';
import { aiRouter } from './routes/ai.js';
import { audioRouter } from './modules/audio-pipeline/audio.routes.js';
import { llmService } from './services/llmService.js';
import { sttService } from './services/sttService.js';
import { sentry } from './services/sentry.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

sentry.init(app);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        ...(process.env.NODE_ENV !== 'production' ? { scriptSrc: ["'self'", "'unsafe-eval'"] } : {}),
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:4173', 'capacitor://localhost'],
  credentials: true,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? '35mb' }));
app.use(logger);

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'qoldau-ai-proxy',
    mode: 'stateless',
    docs: '/api/health',
    ai: llmService.status(),
    stt: sttService.status(),
  });
});

app.use('/api/health', healthRouter);
app.use('/api/stt', sttRouter);
app.use('/api/ai', aiRouter);
app.use('/api/audio', audioRouter);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.path });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

const httpServer = app.listen(PORT, () => {
  const ai = llmService.status();
  const stt = sttService.status();
  console.log(`\nQoldau AI proxy listening on http://localhost:${PORT}`);
  console.log(`health: http://localhost:${PORT}/api/health`);
  console.log(`mode:   stateless`);
  console.log(`AI:     ${ai.source}${ai.enabled ? ` (${ai.model})` : ' (mock fallback)'}`);
  console.log(`STT:    ${stt.source}${stt.enabled ? ` (${stt.model})` : ' (mock fallback)'}\n`);
});

function shutdown() {
  console.log('\n[shutdown] Closing HTTP server...');
  httpServer.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
