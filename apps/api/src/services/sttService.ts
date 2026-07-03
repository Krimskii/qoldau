/**
 * sttService (v0.6.3) — Speech-to-Text с opt-in Whisper API.
 *
 * Opt-in: uses WHISPER_API_KEY or OPENAI_API_KEY env. If no key is present, fallback
 * на mock с фиксированным демо-транскриптом.
 *
 * В production body ожидает { audio: base64-encoded file }. Сейчас принимает
 * что угодно и просто возвращает transcript.
 *
 * Использование:
 *   const result = await sttService.transcribe({ audio: '...' });
 *   // { transcript, confidence, durationSec, source: 'whisper' | 'mock' }
 */
import { randomUUID } from 'node:crypto';

interface ServiceEnv {
  apiKey: string | null;
  enabled: boolean;
  /** 'whisper-1' default; override через env WHISPER_MODEL */
  model: string;
  client: WhisperClient | null;
}

interface WhisperClient {
  transcribe(input: { audio: string; language?: string }): Promise<{ text: string }>;
}

/** Простой in-process mock — для тестов / fallback. */
function createMockClient(): WhisperClient {
  return {
    async transcribe() {
      return { text: 'Ребёнок поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.' };
    },
  };
}

/** Real Whisper client (через fetch к OpenAI API, без external SDK). */
function createWhisperClient(apiKey: string, model: string): WhisperClient {
  return {
    async transcribe(input) {
      // Whisper API принимает multipart/form-data с file.
      // Конвертируем base64 → Buffer → Blob.
      const buffer = Buffer.from(input.audio, 'base64');
      const formData = new FormData();
      // Создаём File из Buffer (Node 18+ имеет File global).
      const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });
      formData.append('file', file);
      formData.append('model', model);
      if (input.language) formData.append('language', input.language);

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Whisper API error: ${res.status} ${text.slice(0, 200)}`);
      }
      const json = (await res.json()) as { text?: string };
      return { text: json.text ?? '' };
    },
  };
}

function loadEnv(): ServiceEnv {
  const apiKey = process.env.WHISPER_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || null;
  const model = process.env.WHISPER_MODEL?.trim() || 'whisper-1';
  if (!apiKey) {
    return { apiKey: null, enabled: false, model, client: null };
  }
  return { apiKey: '[set]', enabled: true, model, client: createWhisperClient(apiKey, model) };
}

const env = loadEnv();

export interface STTInput {
  /** base64-encoded audio. */
  audio: string;
  /** Language code (ru, en, kk). */
  language?: string;
}

export interface STTResult {
  transcript: string;
  confidence: number;
  durationSec: number;
  source: 'whisper' | 'mock';
}

export const sttService = {
  enabled: env.enabled,
  model: env.model,

  status(): { enabled: boolean; model: string; source: 'whisper' | 'mock' } {
    return { enabled: env.enabled, model: env.model, source: env.enabled ? 'whisper' : 'mock' };
  },

  async transcribe(input: STTInput): Promise<STTResult> {
    const t0 = Date.now();
    if (!env.client) {
      // Mock fallback — фиксированный transcript с confidence 0.87.
      const result = await createMockClient().transcribe({ audio: input.audio });
      return {
        transcript: result.text,
        confidence: 0.87,
        durationSec: 18,
        source: 'mock',
      };
    }
    try {
      const result = await env.client.transcribe({ audio: input.audio, language: input.language });
      const duration = Math.round((Date.now() - t0) / 1000);
      return {
        transcript: result.text,
        confidence: 0.95,
        durationSec: duration,
        source: 'whisper',
      };
    } catch (err) {
      console.error('[stt] Whisper transcribe failed, fallback to mock:', err instanceof Error ? err.message : err);
      const result = await createMockClient().transcribe({ audio: input.audio });
      return {
        transcript: result.text,
        confidence: 0.5,
        durationSec: 18,
        source: 'mock',
      };
    }
  },
};

export function genSTTId(): string {
  return `stt-${Date.now()}-${randomUUID().slice(0, 8)}`;
}
