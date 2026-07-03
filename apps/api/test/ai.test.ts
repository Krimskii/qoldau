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

  it('parses Russian transcript and returns events', async () => {
    const res = await request(app)
      .post('/api/ai/parse')
      .send({ transcript: 'Ребёнок поел кашу с сыром, потом выпил воду, пошёл в туалет и закрывал уши от шума' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events.length).toBeGreaterThanOrEqual(3);
    expect(res.body.aiSource).toBe('mock');
    expect(res.body.aiFallback).toBe(false);
    expect(res.body.insight).toContain('Это гипотеза');
  });

  it.each([
    ['food-water', 'Утром в 08:30 Мира съела йогурт и попила воду из чашки.', ['food', 'water']],
    ['sleep', 'После прогулки Тимур уснул в машине, а через час проснулся спокойный.', ['sleep', 'state']],
    ['toilet-communication', 'Алихан сказал ту-ту, показал на дверь и сел на горшок.', ['toilet', 'communication']],
    ['sensory-behavior', 'В магазине было громко, ребёнок закрывал уши, плакал и хотел уйти.', ['sensory', 'behavior']],
    ['communication-food', 'На занятии ребёнок сказал мама, потом жестом попросил ещё печенье.', ['communication', 'food']],
  ])('extracts non-empty events from RU fixture: %s', async (_name, transcript, expectedTypes) => {
    const res = await request(app).post('/api/ai/parse').send({ transcript });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.events.length).toBeGreaterThan(0);
    const types = new Set(res.body.events.map((event: { type: string }) => event.type));
    for (const expectedType of expectedTypes) {
      expect(types.has(expectedType)).toBe(true);
    }
    for (const event of res.body.events as Array<{ description: string }>) {
      expect(event.description).toMatch(/^(Похоже|Возможно),/);
    }
    expect(res.body.insight).toContain('Это наблюдение, не диагноз');
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
    expect(res.body.aiFallback).toBe(false);
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
