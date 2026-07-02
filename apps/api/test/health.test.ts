/**
 * Smoke tests для health endpoint.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { healthRouter } from '../src/routes/health';
import { prisma } from '../src/db/prisma';

describe('GET /api/health', () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/health', healthRouter);

  beforeAll(async () => {
    // Prisma должна подключиться к test DB
    await prisma.$connect();
  });

  it('returns ok=true with db status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('qoldau-api');
    expect(res.body.version).toBeDefined();
    expect(res.body.db.status).toBe('ok');
    expect(res.body.ai).toBeDefined();
    expect(res.body.stt).toBeDefined();
  });

  it('includes cache type', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.cache.type).toBe('memory'); // in-memory default в test
  });

  it('AI mode is mock without key', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.ai.enabled).toBe(false);
    expect(res.body.ai.source).toBe('mock');
  });

  it('STT mode is mock without key', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.stt.enabled).toBe(false);
    expect(res.body.stt.source).toBe('mock');
  });
});