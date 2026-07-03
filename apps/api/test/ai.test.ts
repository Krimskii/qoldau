/**
 * Smoke tests для AI parser endpoint.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { aiRouter } from '../src/routes/ai';
import { prisma } from '../src/db/prisma';

describe('POST /api/ai/parse', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);

  beforeAll(async () => {
    await prisma.$connect();
  });

  it('rejects empty transcript', async () => {
    const res = await request(app).post('/api/ai/parse').send({});
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('parses Russian transcript and returns events', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'Ребёнок поел кашу с сыром, потом выпил воду, пошёл в туалет и закрывал уши' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events.length).toBeGreaterThanOrEqual(3); // food, water, toilet, sensory
    expect(res.body.aiSource).toBe('mock'); // без OPENAI_API_KEY
    expect(res.body.insight).toContain('Это гипотеза');
  });

  it('returns clarification questions', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'Ребёнок поел кашу' });
    expect(res.body.clarificationQuestions).toBeDefined();
    expect(Array.isArray(res.body.clarificationQuestions)).toBe(true);
  });

  it('handles empty/unknown transcript gracefully', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'asdfghjkl' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.events).toEqual([]);
  });
});

describe('GET /api/ai/health', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);

  it('returns AI status', async () => {
    const res = await request(app).get('/api/ai/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('ai');
    expect(res.body.model).toBeDefined();
  });
});
