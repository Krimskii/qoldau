/**
 * Smoke tests for AI parser endpoint and RU fallback quality.
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

  it('rejects transcripts over the configured cap', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'а'.repeat(4001) });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe('transcript too long');
  });

  it('parses Russian transcript and returns multiple typed events', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'Ребёнок поел кашу с сыром, потом выпил воду, пошёл в туалет и закрывал уши от шума.' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events.length).toBeGreaterThanOrEqual(4);
    expect(res.body.aiSource).toBe('mock');
    expect(res.body.aiFallback).toBe(false);
    expect(res.body.insight).toContain('Это наблюдение, не диагноз');
  });

  it.each([
    ['food-water', 'Утром в 08:30 ребёнок съел йогурт и попил воду из чашки.', ['food', 'water']],
    ['sleep-state', 'После прогулки ребёнок уснул в машине, а через час проснулся спокойный.', ['sleep', 'state']],
    ['toilet-communication', 'Ребёнок сказал ту-ту, показал на дверь и сел на горшок.', ['toilet', 'communication']],
    ['sensory-behavior-abc', 'В магазине было громко, ребёнок закрывал уши, плакал и хотел уйти, после выхода на улицу успокоился.', ['sensory', 'behavior']],
    ['communication-food', 'На занятии ребёнок сказал мама, потом жестом попросил ещё печенье.', ['communication', 'food']],
  ])('extracts non-empty events from RU fixture: %s', async (_name, transcript, expectedTypes) => {
    const res = await request(app).post('/api/ai/parse').send({ transcript });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.events.length).toBeGreaterThan(0);
    const types = new Set(res.body.events.map((event: { type: string }) => event.type));
    for (const expectedType of expectedTypes) expect(types.has(expectedType)).toBe(true);
    for (const event of res.body.events as Array<{ title: string; description: string; type: string }>) {
      expect(event.title.trim().length).toBeGreaterThan(0);
      expect(event.type.trim().length).toBeGreaterThan(0);
      expect(event.description).toMatch(/^(Похоже|Возможно),/);
    }
    expect(res.body.insight).toContain('Это наблюдение, не диагноз');
  });

  it('returns clarification questions when events are extracted', async () => {
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
    expect(res.body.aiFallback).toBe(false);
  });

  it('returns a safe specialist referral template for red-flag transcripts', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'Ребёнок бил себя головой об стену и это выглядело опасно.' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.safetyFlag).toBe(true);
    expect(res.body.insight).toContain('обратитесь к специалисту');
    expect(res.body.insight.toLowerCase()).toContain('наблюдение, не диагноз');
    expect(res.body.insight.toLowerCase()).not.toContain('отвлек');
    expect(res.body.insight.toLowerCase()).not.toContain('дайте воду');
    expect(res.body.insight.toLowerCase()).not.toContain('поиграйте');
  });
});

describe('GET /api/ai/health', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);

  it('returns AI status with prompt version', async () => {
    const res = await request(app).get('/api/ai/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('ai');
    expect(res.body.model).toBeDefined();
    expect(res.body.promptVersion).toBe('parse-ru.v4.1');
  });
});

describe('POST /api/ai/digest', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);

  it('returns cautious RU digest from aggregate-only payload', async () => {
    const res = await request(app)
      .post('/api/ai/digest')
      .send({
        windowLabel: 'за неделю',
        eventCounts: { sensory: 4, communication: 3, food: 2 },
        topTypes: ['sensory', 'communication'],
        safetyFlags: [],
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      ok: true,
      digest: expect.any(String),
      aiSource: 'mock',
      aiFallback: false,
      model: expect.any(String),
    }));
    expect(res.body.digest).toMatch(/Похоже|Возможно/);
    expect(res.body.digest.toLowerCase()).toContain('наблюдение, не диагноз');
    expect(res.body.digest.split(/[.!?]+/).filter(Boolean).length).toBeGreaterThanOrEqual(2);
  });

  it('rejects raw transcripts and PII-like fields', async () => {
    const res = await request(app)
      .post('/api/ai/digest')
      .send({
        eventCounts: { behavior: 1 },
        transcript: 'сырой текст не должен уходить в digest',
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toContain('aggregates only');
  });

  it('rejects oversized digest aggregate strings', async () => {
    const res = await request(app)
      .post('/api/ai/digest')
      .send({
        eventCounts: { behavior: 1 },
        notes: ['x'.repeat(501)],
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.issues[0].path).toBe('notes.0');
  });
});

describe('AI route body limits', () => {
  it('returns 413 before /api/ai/parse reaches the LLM for bodies over 256kb', async () => {
    const app = express();
    app.use(express.json({ limit: '256kb' }));
    app.use('/api/ai', aiRouter);
    app.use((err: Error & { status?: number; type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err.status === 413 || err.type === 'entity.too.large') {
        return res.status(413).json({ ok: false, error: 'Request body too large' });
      }
      return res.status(500).json({ ok: false, error: 'Internal server error' });
    });

    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'а'.repeat(260 * 1024) });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ ok: false, error: 'Request body too large' });
  });
});
