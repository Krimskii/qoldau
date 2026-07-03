import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AudioIngestError,
  blobToBase64,
  getAudioPipelineHealth,
  uploadAudioObservation,
} from './audio';

describe('audio api client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('converts a Blob to base64', async () => {
    const blob = new Blob(['hello'], { type: 'audio/webm' });
    await expect(blobToBase64(blob)).resolves.toBe('aGVsbG8=');
  });

  it('uploads audio blob to /api/audio/ingest', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        jobId: 'audio-test',
        status: 'completed',
        transcript: 'test transcript',
        sttMode: 'mock',
        aiMode: 'mock',
        durationSec: 3,
        insight: 'Observation only.',
        questions: [],
        ai: {
          source: 'mock',
          model: 'mock',
          insight: 'Observation only.',
          clarificationQuestions: [],
        },
        events: [],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await uploadAudioObservation({
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      childId: 'child-test',
      sourceRole: 'parent',
      durationSec: 3,
    });

    expect(result.jobId).toBe('audio-test');
    expect(result.transcript).toBe('test transcript');
    expect(result.sttMode).toBe('mock');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/audio\/ingest$/);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      method: 'POST',
    }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.childId).toBe('child-test');
    expect(body.sourceRole).toBe('parent');
    expect(body.audioBase64).toBe('YXVkaW8=');
  });

  it('wraps backend errors in AudioIngestError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => 'backend unavailable',
    }));

    await expect(uploadAudioObservation({
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      childId: 'child-test',
      sourceRole: 'parent',
    })).rejects.toMatchObject({
      name: 'AudioIngestError',
      status: 503,
      message: 'backend unavailable',
    } satisfies Partial<AudioIngestError>);
  });

  it('reads audio health endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        service: 'audio-pipeline',
        mode: 'sync',
        maxAudioMb: 25,
      }),
    }));

    await expect(getAudioPipelineHealth()).resolves.toMatchObject({
      service: 'audio-pipeline',
      maxAudioMb: 25,
    });
  });
});
