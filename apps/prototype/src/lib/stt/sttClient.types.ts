/**
 * STT (Speech-to-Text) Client interface — единая абстракция
 * для всех режимов голосового ввода в Qoldau AI.
 *
 * Три реализации:
 * - sttClient.mock.ts   — имитация распознавания (демо-режим)
 * - sttClient.manual.ts — текст введён вручную пользователем
 * - sttClient.future.ts — заглушка для будущей интеграции с реальным STT
 *
 * UI использует только STTClient и не знает, какая реализация активна.
 */

export type STTLanguage = 'ru' | 'kk' | 'en';
export type STTSpeakerRole = 'parent' | 'tutor' | 'child';

export type STTSource = 'mock' | 'manual' | 'future_stt' | 'real_stt' | 'webspeech';

export interface STTInput {
  /** Аудио-блоб от записи (опционально — для mock/manual не требуется). */
  audioBlob?: Blob;
  /** Ручной текст, если пользователь ввёл его сам. */
  manualText?: string;
  /** Язык распознавания. */
  language: STTLanguage;
  /** Кто говорит — родитель, тьютор или ребёнок. */
  speakerRole: STTSpeakerRole;
  /** ID ребёнка — для контекста и логирования. */
  childId: string;
}

export interface STTResult {
  /** Расшифрованный (или введённый вручную) текст. */
  transcript: string;
  /** Уверенность распознавания 0..1 (для manual всегда 1). */
  confidence?: number;
  /** Длительность записи в секундах (если есть). */
  durationSeconds?: number;
  /** Язык результата. */
  language: STTLanguage;
  /** Откуда пришёл результат — нужно для payload событий и telemetry. */
  source: STTSource;
}

export interface STTClient {
  transcribe(input: STTInput): Promise<STTResult>;
}

export type STTClientFactory = () => STTClient;