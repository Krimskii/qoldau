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
