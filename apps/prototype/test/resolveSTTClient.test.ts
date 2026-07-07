/**
 * Тест для transcribeWithFallback (v1.6 F1.5).
 *
 * Покрывает:
 * - manualText → manualSTTClient (без сети).
 * - apiMode=true + blob → real → /api/stt/transcribe.
 * - apiMode=true + network error → fallback mock (не блокируем UX).
 * - apiMode=false → mock.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('transcribeWithFallback (F1.5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('manualText → manualSTTClient (без сетевого вызова)', async () => {
    const { transcribeWithFallback } = await import('@/lib/stt/resolveSTTClient');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('should not call'));
    const result = await transcribeWithFallback(
      {
        manualText: 'привет',
        language: 'ru',
        speakerRole: 'parent',
        childId: 'child-1',
      },
      { apiMode: true },
    );
    expect(result.source).toBe('manual');
    expect(result.transcript.length).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('apiMode=false → mockSTTClient', async () => {
    const { transcribeWithFallback } = await import('@/lib/stt/resolveSTTClient');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('no net'));
    const result = await transcribeWithFallback(
      {
        audioBlob: new Blob(['fake'], { type: 'audio/webm' }),
        language: 'ru',
        speakerRole: 'parent',
        childId: 'child-1',
      },
      { apiMode: false },
    );
    expect(result.source).toBe('mock');
    expect(result.fallbackUsed).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('apiMode=true + blob → real успех → transcript сохранён', async () => {
    const { transcribeWithFallback } = await import('@/lib/stt/resolveSTTClient');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          transcript: 'мама дай воды',
          confidence: 0.92,
          durationSec: 3,
          sttSource: 'whisper',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const result = await transcribeWithFallback(
      {
        audioBlob: new Blob(['fake-bytes'], { type: 'audio/webm' }),
        language: 'ru',
        speakerRole: 'child',
        childId: 'child-1',
      },
      { apiMode: true },
    );
    expect(result.source).toBe('real_stt');
    expect(result.transcript).toBe('мама дай воды');
    expect(result.fallbackUsed).toBe(false);
  });

  it('apiMode=true + сеть упала → fallback mock, fallbackUsed=true', async () => {
    const { transcribeWithFallback } = await import('@/lib/stt/resolveSTTClient');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));
    const result = await transcribeWithFallback(
      {
        audioBlob: new Blob(['x'], { type: 'audio/webm' }),
        language: 'ru',
        speakerRole: 'parent',
        childId: 'child-1',
      },
      { apiMode: true },
    );
    expect(result.source).toBe('mock');
    expect(result.fallbackUsed).toBe(true);
    expect(result.transcript.length).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('realSTTClient без audioBlob бросает ошибку', async () => {
    const { realSTTClient, STTRealError } = await import('@/lib/stt/sttClient.real');
    await expect(
      realSTTClient.transcribe({
        language: 'ru',
        speakerRole: 'child',
        childId: 'c',
      }),
    ).rejects.toBeInstanceOf(STTRealError);
  });
});