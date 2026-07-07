/**
 * Real STT client — POST /api/stt/transcribe.
 *
 * v1.6 F1.5: реальный STT через backend (Whisper opt-in, см. apps/api/src/routes/stt.ts).
 * Требует audioBlob. Без blob бросает ошибку — caller должен использовать mock/manual
 * fallback (см. resolveSTTClient).
 *
 * Приватность: blob → base64 → отправляется на сервер ТОЛЬКО если родитель явно
 * включил sync (apiMode === true). Звук НЕ сохраняется на сервере (stateless
 * AI-прокси без БД, см. docs/V1_6_F1_AUDIO_PLAN.md §privacy).
 */
import { ApiError, request } from '@/api/client';
import { STTClient, STTInput, STTResult } from './sttClient.types';

interface STTServerResponse {
  ok: boolean;
  transcript?: string;
  confidence?: number;
  durationSec?: number;
  sttSource?: string;
  error?: string;
}

async function blobToBase64(blob: Blob): Promise<string> {
  // Переиспользуем логику из api/audio.ts — но без зависимости от него, чтобы
  // STT-клиент можно было тестировать изолированно.
  if (typeof FileReader === 'undefined') {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export class STTRealError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'STTRealError';
    this.status = status;
  }
}

export const realSTTClient: STTClient = {
  async transcribe(input: STTInput): Promise<STTResult> {
    if (!input.audioBlob || input.audioBlob.size === 0) {
      throw new STTRealError('realSTTClient requires audioBlob (use mock/manual fallback)');
    }

    let audioBase64: string;
    try {
      audioBase64 = await blobToBase64(input.audioBlob);
    } catch (err) {
      throw new STTRealError(
        `Failed to encode audio: ${err instanceof Error ? err.message : 'unknown'}`,
      );
    }

    let response: STTServerResponse;
    try {
      response = await request<STTServerResponse>('/api/stt/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          audio: audioBase64,
          mimeType: input.audioBlob.type || 'audio/webm',
          language: input.language,
        }),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        throw new STTRealError(err.message || 'STT request failed', err.status);
      }
      throw new STTRealError(
        err instanceof Error ? err.message : 'STT request failed (network/offline?)',
      );
    }

    if (!response.ok || !response.transcript) {
      throw new STTRealError(response.error || 'STT returned empty transcript');
    }

    return {
      transcript: response.transcript,
      confidence: response.confidence,
      durationSeconds: response.durationSec,
      language: input.language,
      source: 'real_stt',
    };
  },
};