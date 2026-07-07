/**
 * resolveSTTClient — выбирает STT-клиент по apiMode + наличию blob.
 *
 * v1.6 F1.5:
 * - apiMode=true + есть audioBlob → realSTTClient → /api/stt/transcribe.
 *   На любой ошибке → fallback на mock (никогда не блокируем UX).
 * - apiMode=false / нет blob / offline → mockSTTClient (демо).
 * - manualText задан → manualSTTClient (без сетевого вызова).
 */
import { STTClient, STTInput } from './sttClient.types';
import { mockSTTClient } from './sttClient.mock';
import { manualSTTClient } from './sttClient.manual';
import { realSTTClient, STTRealError } from './sttClient.real';

export interface ResolveSTTOptions {
  /** Если true — пробуем realSTTClient (требует audioBlob). */
  apiMode: boolean;
}

export interface ResolveSTTResult {
  client: STTClient;
  reason: 'manual' | 'real' | 'mock_api_disabled' | 'mock_no_blob' | 'mock_fallback';
}

/**
 * Резолвер клиента. UI не должен вызывать realSTTClient напрямую —
 * только через resolveSTTClient + try/catch с fallback.
 */
export function resolveSTTClient(opts: ResolveSTTOptions): ResolveSTTResult {
  // Manual всегда побеждает (пользователь явно ввёл текст).
  // Реально это проверяется в caller (если manualText задан → manual).
  if (opts.apiMode) {
    return { client: realSTTClient, reason: 'real' };
  }
  return { client: mockSTTClient, reason: 'mock_api_disabled' };
}

/**
 * Helper: выполнить STT с авто-fallback real → mock при ошибке сети/API.
 * Используется из useVoiceObservationStore.transcribeMock и ChildSpeak.
 *
 * - manualText → manualSTTClient (без сети).
 * - audioBlob + apiMode=true → realSTTClient, на ошибке fallback mock.
 * - иначе → mockSTTClient.
 */
export async function transcribeWithFallback(input: STTInput, opts: ResolveSTTOptions): Promise<{
  transcript: string;
  source: 'manual' | 'real_stt' | 'mock' | 'webspeech' | 'future_stt';
  confidence?: number;
  durationSeconds?: number;
  language: STTInput['language'];
  fallbackUsed: boolean;
}> {
  // 1. Manual text — без сетевого вызова.
  if (input.manualText && input.manualText.trim().length > 0) {
    const r = await manualSTTClient.transcribe(input);
    return {
      transcript: r.transcript,
      source: r.source,
      confidence: r.confidence,
      durationSeconds: r.durationSeconds,
      language: r.language,
      fallbackUsed: false,
    };
  }

  // 2. apiMode + blob → real, fallback mock при ошибке.
  if (opts.apiMode && input.audioBlob && input.audioBlob.size > 0) {
    try {
      const r = await realSTTClient.transcribe(input);
      return {
        transcript: r.transcript,
        source: r.source,
        confidence: r.confidence,
        durationSeconds: r.durationSeconds,
        language: r.language,
        fallbackUsed: false,
      };
    } catch (err) {
      // Любая ошибка (offline, 5xx, quota, parse) → fallback mock.
      // STT не должен блокировать запись/UX.
      console.warn('[STT] real client failed, fallback to mock:', err);
      const r = await mockSTTClient.transcribe(input);
      return {
        transcript: r.transcript,
        source: r.source,
        confidence: r.confidence,
        durationSeconds: r.durationSeconds,
        language: r.language,
        fallbackUsed: true,
      };
    }
  }

  // 3. Дефолт — mock.
  const r = await mockSTTClient.transcribe(input);
  return {
    transcript: r.transcript,
    source: r.source,
    confidence: r.confidence,
    durationSeconds: r.durationSeconds,
    language: r.language,
    fallbackUsed: false,
  };
}

export { STTRealError };