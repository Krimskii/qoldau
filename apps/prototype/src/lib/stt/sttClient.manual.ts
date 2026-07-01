/**
 * Manual STT client — пользователь сам ввёл текст наблюдения.
 * Никакой задержки, никакой имитации. Просто транзит manualText → STTResult.
 */

import { STTClient, STTInput, STTResult } from './sttClient.types';

export const manualSTTClient: STTClient = {
  async transcribe(input: STTInput): Promise<STTResult> {
    const text = (input.manualText ?? '').trim();
    if (!text) {
      throw new Error('ManualSTT: manualText is empty');
    }
    return {
      transcript: text,
      confidence: 1.0,
      durationSeconds: 0,
      language: input.language ?? 'ru',
      source: 'manual',
    };
  },
};