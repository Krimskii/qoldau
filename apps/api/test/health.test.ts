import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { healthRouter, readyRouter } from '../src/routes/health';
import { requestId } from '../src/middleware/requestId';

describe('GET /api/health', () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/health', healthRouter);
  app.use('/api/ready', readyRouter);

  it('returns stateless proxy health with database status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('qoldau-ai-proxy');
    expect(res.body.mode).toBe('stateless');
    expect(res.body.version).toBeDefined();
    expect(res.body.ai).toBeDefined();
    expect(res.body.stt).toBeDefined();
    expect(res.body.database).toEqual(expect.objectContaining({
      ok: true,
      provider: 'sqlite-test',
      latencyMs: expect.any(Number),
    }));
    expect(res.body.cache).toBeUndefined();
  });

  it('AI and STT modes are mock without keys', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body.ai.enabled).toBe(false);
    expect(res.body.ai.source).toBe('mock');
    expect(res.body.stt.enabled).toBe(false);
    expect(res.body.stt.source).toBe('mock');
  });

  it('returns readiness status when database is reachable', async () => {
    const res = await request(app).get('/api/ready');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.readiness).toBe('ready');
    expect(res.body.database.ok).toBe(true);
  });
});

describe('request id middleware', () => {
  it('sets x-request-id and keeps incoming request ids', async () => {
    const app = express();
    app.use(requestId);
    app.get('/ping', (req, res) => res.json({ ok: true, requestId: req.requestId }));

    const generated = await request(app).get('/ping');
    expect(generated.status).toBe(200);
    expect(generated.headers['x-request-id']).toBeDefined();
    expect(generated.body.requestId).toBe(generated.headers['x-request-id']);

    const incoming = await request(app).get('/ping').set('x-request-id', 'test-request-id');
    expect(incoming.headers['x-request-id']).toBe('test-request-id');
    expect(incoming.body.requestId).toBe('test-request-id');
  });
});
