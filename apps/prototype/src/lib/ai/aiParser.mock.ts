/**
 * Mock AI Parser — простой regex-based разбор свободного текста.
 *
 * Использует осторожные формулировки: «Похоже…», «Возможно…»,
 * «Это наблюдение, не диагноз.», «Можно обсудить со специалистом.».
 *
 * Эта реализация НЕ подключается к реальному LLM. Только локальный разбор.
 */

import {
  AIParserClient,
  AIParserInput,
  AIParserResult,
  ClarificationQuestion,
  ParsedEvent,
} from './aiParser.types';

const SAFETY_DISCLAIMER =
  'Это наблюдение, не диагноз. Можно обсудить со специалистом.';

const baseTimestamp = (): string =>
  new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

const mkEvent = (
  type: ParsedEvent['type'],
  title: string,
  description: string,
  confidence: number,
  index: number,
): ParsedEvent => ({
  localId: `local-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  title,
  description,
  timestamp: baseTimestamp(),
  confidence,
});

export const mockAIParser: AIParserClient = {
  async parseObservation(input: AIParserInput): Promise<AIParserResult> {
    // Имитация AI-обработки
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lower = input.transcript.toLowerCase();
    const events: ParsedEvent[] = [];
    const clarifications: ClarificationQuestion[] = [];

    // --- Питание ---
    if (
      lower.includes('ел') ||
      lower.includes('ела') ||
      lower.includes('есть') ||
      lower.includes('каша') ||
      lower.includes('поел') ||
      lower.includes('покушал') ||
      lower.includes('обед')
    ) {
      events.push(
        mkEvent('food', 'Питание', 'Каша с сыром, немного воды', 0.85, events.length),
      );
      clarifications.push({
        id: 'food-amount',
        question: 'Сколько примерно съел?',
        options: ['Мало', 'Нормально', 'Много'],
        defaultOption: 'Нормально',
      });
    }

    // --- Вода ---
    if (lower.includes('вод') || lower.includes('пьет') || lower.includes('пил')) {
      events.push(
        mkEvent(
          'water',
          'Вода',
          lower.includes('много')
            ? 'Выпил много воды'
            : lower.includes('мало')
              ? 'Выпил мало воды'
              : 'Пил воду',
          0.78,
          events.length,
        ),
      );
      clarifications.push({
        id: 'water-amount',
        question: 'Сколько воды выпил?',
        options: ['Мало', 'Нормально', 'Много', 'Не знаю'],
        defaultOption: 'Нормально',
      });
    }

    // --- Туалет ---
    if (
      lower.includes('туалет') ||
      lower.includes('сходил') ||
      lower.includes('горшок') ||
      lower.includes('памперс') ||
      lower.includes('ту-ту')
    ) {
      events.push(
        mkEvent(
          'toilet',
          'Туалет',
          lower.includes('жидк') ? 'Стул жидкий' : 'Сходил в туалет',
          0.82,
          events.length,
        ),
      );
      clarifications.push({
        id: 'toilet-better',
        question: 'После туалета стало легче?',
        options: ['Да', 'Нет', 'Не заметил(а)'],
        defaultOption: 'Да',
      });
    }

    // --- Сенсорика ---
    if (
      lower.includes('закрыва') ||
      lower.includes('уши') ||
      lower.includes('шум') ||
      lower.includes('громк') ||
      lower.includes('наушник')
    ) {
      events.push(
        mkEvent(
          'sensory',
          'Сенсорика',
          'Закрывал уши — возможно, реакция на шум',
          0.74,
          events.length,
        ),
      );
      clarifications.push({
        id: 'noise-around',
        question: 'Был ли шум вокруг?',
        options: ['Да', 'Нет', 'Не заметил(а)'],
        defaultOption: 'Да',
      });
    }

    // --- Поведение ---
    if (
      lower.includes('нервнич') ||
      lower.includes('плакал') ||
      lower.includes('кричал') ||
      lower.includes('каприз') ||
      lower.includes('тревог')
    ) {
      events.push(
        mkEvent(
          'behavior',
          'Поведение',
          'Нервничал — нужна пауза',
          0.7,
          events.length,
        ),
      );
    }

    // --- Коммуникация ---
    if (
      lower.includes('ту-ту') ||
      lower.includes('ва') ||
      lower.includes('мама') ||
      lower.includes('сказал') ||
      lower.includes('произнес')
    ) {
      events.push(
        mkEvent(
          'communication',
          'Коммуникация',
          lower.includes('ту-ту')
            ? 'Произнёс звук «ту-ту»'
            : 'Использовал звук/слово',
          0.65,
          events.length,
        ),
      );
    }

    // --- AAC ---
    if (lower.includes('aac') || lower.includes('карточк')) {
      events.push(
        mkEvent('aac_card', 'AAC-карточка', 'Использовал AAC-карточку', 0.7, events.length),
      );
    }

    // --- Сон ---
    if (lower.includes('спал') || lower.includes('сон') || lower.includes('заснул')) {
      events.push(
        mkEvent('sleep', 'Сон', 'Заснул / спал', 0.8, events.length),
      );
    }

    // --- Insight — осторожные формулировки ---
    let insight: string;
    if (events.length === 0) {
      insight =
        'Не удалось выделить конкретные события. Возможно, описание слишком короткое. Попробуйте рассказать подробнее.';
    } else if (
      events.some((e) => e.type === 'sensory') &&
      events.some((e) => e.type === 'toilet')
    ) {
      insight =
        'Похоже, нервозность и закрывание ушей появились перед туалетом. Возможна связь с дискомфортом или сенсорной нагрузкой. Это наблюдение, не диагноз.';
    } else if (events.some((e) => e.type === 'food') && events.some((e) => e.type === 'sensory')) {
      insight =
        'Возможно, реакция появилась после еды. Нужно подтвердить повторными наблюдениями, прежде чем делать выводы.';
    } else if (events.length > 0) {
      insight =
        'Похоже, наблюдение содержит несколько связанных событий. Можно обсудить со специалистом, чтобы лучше понять контекст.';
    } else {
      insight = SAFETY_DISCLAIMER;
    }

    return {
      events,
      insight,
      clarificationQuestions: clarifications,
      safetyDisclaimer: SAFETY_DISCLAIMER,
    };
  },
};