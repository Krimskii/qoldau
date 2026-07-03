import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { audioRouter } from '../src/modules/audio-pipeline/audio.routes';
import { prisma } from '../src/db/prisma';

describe('POST /api/audio/ingest', () => {
  const app = express();
  app.use(express.json({ limit: '35mb' }));
  app.use('/api/audio', audioRouter);

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.child.upsert({
      where: { id: 'test-audio-child' },
      update: {},
      create: {
        id: 'test-audio-child',
        name: 'Demo Child',
        age: 6,
      },
    });
  });

  it('rejects missing audio', async () => {
    const res = await request(app)
      .post('/api/audio/ingest')
      .send({ childId: 'test-audio-child', sourceRole: 'parent' });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe('AUDIO_REQUIRED');
  });

  it('rejects invalid source role', async () => {
    const res = await request(app)
      .post('/api/audio/ingest')
      .send({
        audioBase64: Buffer.from('fake-webm-audio').toString('base64'),
        childId: 'test-audio-child',
        sourceRole: 'unknown-role',
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe('SOURCE_ROLE_INVALID');
  });

  it('runs the mock pipeline and persists recording/events', async () => {
    const audioBase64 = Buffer.from('fake-webm-audio').toString('base64');

    const res = await request(app)
      .post('/api/audio/ingest')
      .send({
        audioBase64,
        childId: 'test-audio-child',
        sourceRole: 'parent',
        durationSec: 12,
        language: 'ru',
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe('completed');
    expect(res.body.recording.id).toBeDefined();
    expect(res.body.recording.transcript).toBeTruthy();
    expect(res.body.recording.sttSource).toBe('mock');
    expect(Array.isArray(res.body.events)).toBe(true);

    const recording = await prisma.recording.findUnique({
      where: { id: res.body.recording.id },
    });
    expect(recording?.childId).toBe('test-audio-child');

    const savedEvents = await prisma.event.findMany({
      where: { childId: 'test-audio-child' },
    });
    expect(savedEvents.length).toBeGreaterThanOrEqual(res.body.events.length);
  });
});

describe('GET /api/audio/health', () => {
  const app = express();
  app.use(express.json({ limit: '35mb' }));
  app.use('/api/audio', audioRouter);

  it('returns audio pipeline health without secrets', async () => {
    const res = await request(app).get('/api/audio/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'audio-pipeline',
      mode: 'sync',
    });
    expect(res.body.maxAudioMb).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toContain('sk-');
  });
});
