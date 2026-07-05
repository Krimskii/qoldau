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
import { requestId } from './middleware/requestId.js';
import { healthRouter, readyRouter } from './routes/health.js';
import { sttRouter } from './routes/stt.js';
import { aiRouter } from './routes/ai.js';
import { authRouter } from './routes/auth.js';
import { childrenRouter } from './routes/children.js';
import { eventsRouter } from './routes/events.js';
import { recordingsRouter } from './routes/recordings.js';
import { audioRouter } from './modules/audio-pipeline/audio.routes.js';
import { llmService } from './services/llmService.js';
import { sttService } from './services/sttService.js';
import { sentry } from './services/sentry.js';
import {
  DEFAULT_AUDIO_JSON_BODY_LIMIT,
  DEFAULT_JSON_BODY_LIMIT,
  DEFAULT_SHUTDOWN_TIMEOUT_MS,
  assertEnv,
  readPositiveIntEnv,
} from './config/env.js';

assertEnv();
const app = express();
const PORT = readPositiveIntEnv('PORT', 4000);
const JSON_BODY_LIMIT_DEFAULT = DEFAULT_JSON_BODY_LIMIT;
const JSON_BODY_LIMIT_AUDIO = DEFAULT_AUDIO_JSON_BODY_LIMIT;

// За обратным прокси (Railway/Render) клиентский IP приходит в X-Forwarded-For.
// Без trust proxy express-rate-limit бросает ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// и не может корректно ключевать лимит по клиенту. 1 = доверяем первому хопу.
app.set('trust proxy', 1);

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
// Capacitor app origins are fixed for our APK/PWA and must ALWAYS be allowed,
// regardless of CORS_ORIGIN, or the mobile WebView gets CORS-blocked and the
// app falls back to offline/mock. Android (androidScheme 'https') sends
// `https://localhost`; iOS sends `capacitor://localhost`.
const APP_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost'];
const DEV_WEB_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEV_WEB_ORIGINS;
const allowedOrigins = Array.from(new Set([...APP_ORIGINS, ...configuredOrigins]));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(requestId);
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

app.use('/api/audio', express.json({ limit: JSON_BODY_LIMIT_AUDIO }), audioRouter);
app.use(express.json({ limit: JSON_BODY_LIMIT_DEFAULT }));
app.use('/api/health', healthRouter);
app.use('/api/ready', readyRouter);
app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/events', eventsRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/stt', sttRouter);
app.use('/api/ai', aiRouter);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.path });
});

app.use((err: Error & { status?: number; type?: string }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const requestIdValue = req.requestId ?? '-';
  if (err.status === 413 || err.type === 'entity.too.large') {
    console.warn('[http] request body too large', { requestId: requestIdValue, path: req.path });
    return res.status(413).json({ ok: false, error: 'Request body too large' });
  }
  console.error('[error]', { requestId: requestIdValue, error: err.message });
  res.status(500).json({ ok: false, error: 'Internal server error', requestId: requestIdValue });
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

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\n[shutdown] Closing HTTP server...');
  const forceTimer = setTimeout(() => {
    console.error('[shutdown] Force exit after timeout');
    process.exit(1);
  }, readPositiveIntEnv('SHUTDOWN_TIMEOUT_MS', DEFAULT_SHUTDOWN_TIMEOUT_MS));
  forceTimer.unref();
  httpServer.close(() => {
    clearTimeout(forceTimer);
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
