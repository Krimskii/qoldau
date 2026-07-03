import { describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { sttRouter } from '../src/routes/stt';

describe('STT routes', () => {
  const app = express();
  app.use(express.json({ limit: '35mb' }));
  app.use('/api/stt', sttRouter);

  it('returns health without secrets', async () => {
    const res = await request(app).get('/api/stt/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'stt',
      enabled: false,
      mode: 'mock',
      model: 'whisper-1',
    });
    expect(JSON.stringify(res.body)).not.toContain('sk-');
  });

  it('uses mock fallback when no real STT key is configured', async () => {
    const res = await request(app)
      .post('/api/stt/transcribe')
      .send({
        audio: Buffer.from('fake-webm-audio').toString('base64'),
        language: 'ru',
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.transcript).toBeTruthy();
    expect(res.body.sttSource).toBe('mock');
  });
});
