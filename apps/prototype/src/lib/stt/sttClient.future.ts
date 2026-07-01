/**
 * Future STT client — заглушка для будущей интеграции с реальным STT API.
 *
 * ВАЖНО: реальный STT в v0.3.x НЕ подключается. Этот модуль существует,
 * чтобы UI не зависел от конкретной реализации и чтобы потом было легко
 * подменить mock → реальный клиент.
 *
 * Когда будем подключать реальный STT:
 * 1. Реализовать createRealSTTClient(config) с fetch на endpoint.
 * 2. Перенести API key / endpoint в env / backend proxy (НИКОГДА в браузер).
 * 3. Никогда не отправлять audio без согласия родителя.
 *
 * Подробности — docs/STT_INTEGRATION_PLAN.md.
 */

import { STTClient, STTInput, STTResult } from './sttClient.types';

export interface STTFutureConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export const futureSTTClient: STTClient = {
  async transcribe(_input: STTInput): Promise<STTResult> {
    // Заглушка — реальная интеграция ещё не подключена.
    // Пока ведём себя как mock, чтобы UI можно было собрать end-to-end.
    return {
      transcript: '',
      confidence: 0,
      durationSeconds: 0,
      language: 'ru',
      source: 'future_stt',
    };
  },
};

/**
 * Фабрика для создания реального STT-клиента в будущем.
 * Сейчас бросает ошибку — это намеренно, чтобы случайно не подключить
 * полу-реализованный код.
 */
export async function createRealSTTClient(
  _config: STTFutureConfig,
): Promise<STTClient> {
  throw new Error(
    '[Qoldau] Real STT client is not implemented yet. ' +
      'See docs/STT_INTEGRATION_PLAN.md before enabling.',
  );
}