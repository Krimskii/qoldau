/**
 * Mock STT client — имитирует распознавание речи для demo-режима.
 * Возвращает заранее заготовленный транскрипт, разный для parent/tutor.
 *
 * ВАЖНО: аудио-блобы НЕ сохраняются и НЕ отправляются. Это полностью
 * локальная имитация.
 */

import { STTClient, STTInput, STTResult } from './sttClient.types';

export const PARENT_DEMO_TRANSCRIPT =
  'Алихан поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.';

export const TUTOR_DEMO_TRANSCRIPT =
  'На занятии Алихан начал закрывать уши при шуме, мы сделали паузу 5 минут, после этого он вернулся к заданию.';

export const SPECIALIST_DEMO_TRANSCRIPT =
  'На приёме ребёнок отзывался на имя, выполнял простые инструкции. Использовал AAC-карточку «вода».';

export const mockSTTClient: STTClient = {
  async transcribe(input: STTInput): Promise<STTResult> {
    // Имитация сетевой задержки
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const transcript =
      input.speakerRole === 'tutor'
        ? TUTOR_DEMO_TRANSCRIPT
        : input.speakerRole === 'child'
          ? SPECIALIST_DEMO_TRANSCRIPT
          : PARENT_DEMO_TRANSCRIPT;

    return {
      transcript,
      confidence: 0.91,
      durationSeconds: 28,
      language: input.language ?? 'ru',
      source: 'mock',
    };
  },
};