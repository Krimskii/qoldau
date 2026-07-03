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

/**
 * Определяем аудио-контейнер по магическим байтам буфера и возвращаем
 * расширение+MIME, которые Whisper распознаёт. Разные устройства пишут разные
 * контейнеры (Android WebView часто mp4, десктоп — webm/opus); Whisper
 * определяет формат по имени файла, поэтому жёсткое 'audio.webm' на mp4-байтах
 * даёт 400 Invalid file format. Детект по сигнатуре надёжнее, чем доверять
 * заявленному mimeType.
 */
function detectAudioFormat(buffer: Buffer): { ext: string; mime: string } {
  const ascii = (start: number, end: number) =>
    buffer.length >= end ? buffer.toString('ascii', start, end) : '';
  // EBML (WebM / Matroska): 1A 45 DF A3
  if (buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { ext: 'webm', mime: 'audio/webm' };
  }
  if (ascii(0, 4) === 'OggS') return { ext: 'ogg', mime: 'audio/ogg' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { ext: 'wav', mime: 'audio/wav' };
  // ISO-BMFF (mp4 / m4a): 'ftyp' по смещению 4
  if (ascii(4, 8) === 'ftyp') return { ext: 'mp4', mime: 'audio/mp4' };
  if (ascii(0, 3) === 'ID3') return { ext: 'mp3', mime: 'audio/mpeg' };
  if (buffer.length >= 2 && buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { ext: 'mp3', mime: 'audio/mpeg' };
  }
  // По умолчанию — webm (самый частый контейнер web MediaRecorder).
  return { ext: 'webm', mime: 'audio/webm' };
}

/** Real Whisper client (через fetch к OpenAI API, без external SDK). */
function createWhisperClient(apiKey: string, model: string): WhisperClient {
  return {
    async transcribe(input) {
      // Whisper API принимает multipart/form-data с file.
      // Некоторые клиенты присылают data-URL целиком (например
      // `data:audio/webm;codecs=opus;base64,...`) — срезаем префикс, иначе
      // Buffer.from декодит мусор и Whisper отвечает 400 Invalid file format.
      const raw = input.audio;
      const base64 = raw.startsWith('data:') ? raw.slice(raw.indexOf(',') + 1) : raw;
      // Конвертируем base64 → Buffer → File с ПРАВИЛЬНЫМ расширением по сигнатуре.
      const buffer = Buffer.from(base64, 'base64');
      const fmt = detectAudioFormat(buffer);
      console.info('[stt] whisper upload', { bytes: buffer.length, ext: fmt.ext });
      const formData = new FormData();
      // Создаём File из Buffer (Node 18+ имеет File global).
      const file = new File([buffer], `audio.${fmt.ext}`, { type: fmt.mime });
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
