import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { healthRouter } from '../src/routes/health';

describe('GET /api/health', () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/health', healthRouter);

  it('returns stateless proxy health without db/cache/auth state', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('qoldau-ai-proxy');
    expect(res.body.mode).toBe('stateless');
    expect(res.body.version).toBeDefined();
    expect(res.body.ai).toBeDefined();
    expect(res.body.stt).toBeDefined();
    expect(res.body.db).toBeUndefined();
    expect(res.body.cache).toBeUndefined();
  });

  it('AI and STT modes are mock without keys', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body.ai.enabled).toBe(false);
    expect(res.body.ai.source).toBe('mock');
    expect(res.body.stt.enabled).toBe(false);
    expect(res.body.stt.source).toBe('mock');
  });
});
