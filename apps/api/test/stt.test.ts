import { describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { sttRouter } from '../src/routes/stt';
import { createSTTService } from '../src/services/sttService';

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
        audio: Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x00]).toString('base64'),
        language: 'ru',
        mimeType: 'audio/webm;codecs=opus',
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.transcript).toBeTruthy();
    expect(res.body.sttSource).toBe('mock');
  });

  it('rejects audio payloads over the server cap', async () => {
    const oversizedAudio = 'a'.repeat(50 * 1024 * 1024 + 1);
    const largeApp = express();
    largeApp.use(express.json({ limit: '60mb' }));
    largeApp.use('/api/stt', sttRouter);

    const res = await request(largeApp)
      .post('/api/stt/transcribe')
      .send({
        audio: oversizedAudio,
        mimeType: 'audio/webm;codecs=opus',
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe('audio too large');
  });

  it('falls back to mock when the real STT provider fails', async () => {
    const service = createSTTService({
      apiKey: '[set]',
      enabled: true,
      model: 'whisper-1',
      client: {
        async transcribe(input) {
          expect(input.mimeType).toBe('audio/mp4');
          throw new Error('provider down');
        },
      },
    });

    const result = await service.transcribe({
      audio: Buffer.from('fake-mp4-audio').toString('base64'),
      language: 'ru',
      mimeType: 'audio/mp4',
    });

    expect(result.source).toBe('mock');
    expect(result.confidence).toBe(0.5);
    expect(result.transcript).toBeTruthy();
  });
});
