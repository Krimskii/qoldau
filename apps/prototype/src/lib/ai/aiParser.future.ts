/**
 * Future AI Parser — заглушка для будущей интеграции с реальным LLM.
 *
 * ВАЖНО: реальный LLM в v0.3.x НЕ подключается. Этот модуль существует,
 * чтобы UI работал через AIParserClient и не зависел от реализации.
 *
 * Когда будем подключать:
 * 1. Реализовать createRealAIParserClient(config) с запросом на backend proxy.
 * 2. API key НЕ хранить в браузере — только на сервере.
 * 3. Отправлять только transcript + childId + speakerRole, без PII.
 * 4. Все ответы прогонять через safety filter (запрет медицинских формулировок).
 */

import {
  AIParserClient,
  AIParserInput,
  AIParserResult,
} from './aiParser.types';

export const SAFETY_DISCLAIMER =
  'Это наблюдение, не диагноз. Можно обсудить со специалистом.';

export const futureAIParserClient: AIParserClient = {
  async parseObservation(_input: AIParserInput): Promise<AIParserResult> {
    return {
      events: [],
      insight: SAFETY_DISCLAIMER,
      clarificationQuestions: [],
      safetyDisclaimer: SAFETY_DISCLAIMER,
    };
  },
};

export interface AIParserFutureConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export async function createRealAIParserClient(
  _config: AIParserFutureConfig,
): Promise<AIParserClient> {
  throw new Error(
    '[Qoldau] Real AI Parser is not implemented yet. ' +
      'See docs/STT_INTEGRATION_PLAN.md and ROADMAP before enabling.',
  );
}