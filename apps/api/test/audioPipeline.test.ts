import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { audioRouter } from '../src/modules/audio-pipeline/audio.routes';

describe('POST /api/audio/ingest', () => {
  const app = express();
  app.use(express.json({ limit: '35mb' }));
  app.use('/api/audio', audioRouter);

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

  it('runs the mock stateless pipeline without persisted recording/events', async () => {
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
    expect(res.body.transcript).toBeTruthy();
    expect(res.body.sttMode).toBe('mock');
    expect(res.body.aiMode).toBe('mock');
    expect(res.body).toEqual(expect.objectContaining({
      transcript: expect.any(String),
      events: expect.any(Array),
      insight: expect.any(String),
      aiMode: 'mock',
      sttMode: 'mock',
      aiFallback: false,
    }));
    if ('aiError' in res.body) {
      expect(typeof res.body.aiError).toBe('string');
    }
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events[0]).not.toHaveProperty('id');
    expect(res.body.events[0]).not.toHaveProperty('childId');
    expect(res.body).not.toHaveProperty('recording');
    expect(res.body.insight).toBeTruthy();
    expect(Array.isArray(res.body.questions)).toBe(true);
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
