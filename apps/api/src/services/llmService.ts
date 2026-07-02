/**
 * llmService — Anthropic Claude integration for AI parser (v0.6.0).
 *
 * Opt-in: использует ANTHROPIC_API_KEY env. Если ключа нет или
 * парсинг провалился — fallback на keyword-based mock.
 *
 * Модель по умолчанию: claude-3-5-haiku (дешёвая, быстрая).
 * Override через env: ANTHROPIC_MODEL.
 *
 * Использование:
 *   const result = await llmService.parseTranscript(transcript);
 *   // { events, insight, clarificationQuestions, source: 'claude' | 'mock' }
 */
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'node:crypto';

// --- Локальные типы (временный fallback до появления @qoldau/shared) ---

export interface AIParserInput {
  transcript: string;
  childId?: string;
  language?: string;
}

export interface AIParserEvent {
  timestamp: string;
  title: string;
  description: string;
  type: string;
}

export interface AIParserQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface AIParserResult {
  events: AIParserEvent[];
  insight: string;
  clarificationQuestions: AIParserQuestion[];
}

interface ServiceEnv {
  apiKey: string | null;
  model: string;
  client: Anthropic | null;
  enabled: boolean;
}

function loadEnv(): ServiceEnv {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim() || null;
  const model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-haiku-20241022';
  if (!apiKey) {
    return { apiKey: null, model, client: null, enabled: false };
  }
  const client = new Anthropic({ apiKey });
  return { apiKey: '[set]', model, client, enabled: true };
}

const env = loadEnv();

/**
 * Системный промпт — задаём роль и JSON-схему.
 * Anthropic поддерживает tool_use как structured output — это надёжнее, чем парсить JSON из текста.
 */
const SYSTEM_PROMPT = `Ты ассистент для родителя ребёнка с особенностями развития (аутизм / РАС / задержка речи).
Родитель записывает голосовое наблюдение — расшифровку речи нужно превратить в структурированные события дня.

ВАЖНО:
- Это наблюдение, НЕ диагноз.
- Используй осторожные формулировки: "похоже", "возможно", "заметил(а)".
- Не выдумывай того, чего нет в тексте. Если не хватает деталей — задай уточняющий вопрос.
- Не давай медицинских заключений и терапевтических рекомендаций.
- Язык ответа: русский.

Типы событий (используй только эти):
- food (приём пищи: поел, каша, суп, еда)
- water (питьё: вода, выпил, попил)
- toilet (туалет: горшок, ту-ту, писал, какал)
- sleep (сон: уснул, спал, проснулся)
- sensory (сенсорная реакция: закрывал уши, яркий свет, шум, громко)
- behavior (поведение: плакал, кричал, убежал, ударил, нервничал)
- communication (коммуникация: сказал, произнёс, показал жестом, да/нет)
- state (общее состояние: спокойный, возбуждённый, усталый)

Уточняющие вопросы задавай только если они реально помогают понять ситуацию (не больше 3).`;

/**
 * Инструмент (tool) — Anthropic tool_use гарантирует JSON-структуру.
 */
const PARSE_TOOL: Anthropic.Tool = {
  name: 'parse_observation',
  description: 'Превращает голосовое наблюдение родителя в структурированные события дня',
  input_schema: {
    type: 'object',
    properties: {
      events: {
        type: 'array',
        description: 'События, выделенные из наблюдения',
        items: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', description: 'HH:MM (24-часовой формат)' },
            title: { type: 'string', description: 'Краткое название (2-5 слов)' },
            description: { type: 'string', description: '1 предложение с осторожной формулировкой' },
            type: {
              type: 'string',
              enum: ['food', 'water', 'toilet', 'sleep', 'sensory', 'behavior', 'communication', 'state'],
            },
          },
          required: ['timestamp', 'title', 'description', 'type'],
        },
      },
      insight: {
        type: 'string',
        description: '1-2 предложения с пометкой "Это наблюдение, не диагноз".',
      },
      clarificationQuestions: {
        type: 'array',
        description: 'До 3 уточняющих вопросов (id + question + options[2-4])',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
          },
          required: ['id', 'question', 'options'],
        },
      },
    },
    required: ['events', 'insight', 'clarificationQuestions'],
  },
};

interface ParsedToolInput {
  events: Array<{
    timestamp?: string;
    title?: string;
    description?: string;
    type?: string;
  }>;
  insight?: string;
  clarificationQuestions?: Array<{
    id?: string;
    question?: string;
    options?: string[];
  }>;
}

function validateAndNormalize(raw: ParsedToolInput | null | undefined): AIParserResult {
  const safeRaw: ParsedToolInput = raw ?? { events: [] };
  const events = (safeRaw.events ?? [])
    .filter((e): e is { timestamp: string; title: string; description: string; type: string } =>
      typeof e.timestamp === 'string'
      && typeof e.title === 'string'
      && typeof e.description === 'string'
      && typeof e.type === 'string',
    )
    .map((e) => ({
      timestamp: e.timestamp,
      title: e.title,
      description: e.description,
      type: e.type,
    }));

  const insight = typeof safeRaw.insight === 'string' && safeRaw.insight.trim().length > 0
    ? safeRaw.insight.trim()
    : 'Похоже, наблюдение зафиксировано. Это наблюдение, не диагноз.';

  const clarificationQuestions = (safeRaw.clarificationQuestions ?? [])
    .filter((q): q is { id: string; question: string; options: string[] } =>
      typeof q.id === 'string'
      && typeof q.question === 'string'
      && Array.isArray(q.options)
      && q.options.length >= 2,
    )
    .map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options.slice(0, 4),
    }));

  return { events, insight, clarificationQuestions };
}

/** Mock fallback — портирован из apps/api/src/routes/ai.ts. */
function parseMock(transcript: string): AIParserResult {
  const text = transcript.toLowerCase();
  const events: AIParserResult['events'] = [];
  const timeMatches = transcript.match(/\b(\d{1,2}):(\d{2})\b/g);
  const nextTime = () => {
    const t = new Date();
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  };
  const findTime = (idx: number) => (timeMatches && timeMatches[idx]) || nextTime();

  if (text.includes('поел') || text.includes('каш') || text.includes('суп') || text.includes('еда')) {
    events.push({ timestamp: findTime(0), title: 'Поел', description: 'Приём пищи зафиксирован', type: 'food' });
  }
  if (text.includes('пил') || text.includes('вода') || text.includes('выпил')) {
    events.push({ timestamp: findTime(events.length), title: 'Выпил воду', description: 'Приём жидкости', type: 'water' });
  }
  if (text.includes('туалет') || text.includes('горшок') || text.includes('ту-ту')) {
    events.push({ timestamp: findTime(events.length), title: 'Туалет', description: 'Сигнал о туалете', type: 'toilet' });
  }
  if (text.includes('закрывал уши') || text.includes('шум') || text.includes('громко')) {
    events.push({ timestamp: findTime(events.length), title: 'Закрывал уши', description: 'Сенсорная реакция на шум', type: 'sensory' });
  }
  if (text.includes('сказал') || text.includes('произнес')) {
    events.push({ timestamp: findTime(events.length), title: 'Коммуникация', description: 'Ребёнок произнёс звук/слово', type: 'communication' });
  }

  const insight = events.length > 0
    ? `Похоже, в наблюдении ${events.length} ${events.length === 1 ? 'событие' : 'событий'}. Это гипотеза, не диагноз. Можно обсудить со специалистом.`
    : 'Не удалось выделить события. Это наблюдение, не диагноз.';

  return {
    events,
    insight,
    clarificationQuestions: [
      { id: 'water-amount', question: 'Сколько воды выпил?', options: ['Мало', 'Нормально', 'Много', 'Не знаю'] },
      { id: 'mood-after', question: 'Каким было настроение после?', options: ['Спокойное', 'Возбуждённое', 'Плакал', 'Не заметил(а)'] },
    ],
  };
}

export const llmService = {
  enabled: env.enabled,
  model: env.model,

  /** Health/status для /api/ai/health endpoint. */
  status(): { enabled: boolean; model: string; source: 'claude' | 'mock' } {
    return { enabled: env.enabled, model: env.model, source: env.enabled ? 'claude' : 'mock' };
  },

  /**
   * Парсит транскрипт в структурированные события.
   * Использует Claude если ANTHROPIC_API_KEY задан, иначе mock fallback.
   */
  async parseTranscript(input: AIParserInput): Promise<AIParserResult & { source: 'claude' | 'mock' }> {
    const transcript = (input?.transcript ?? '').trim();
    if (!transcript) {
      return {
        events: [],
        insight: 'Транскрипт пустой. Это наблюдение, не диагноз.',
        clarificationQuestions: [],
        source: env.enabled ? 'claude' : 'mock',
      };
    }

    if (!env.client) {
      return { ...parseMock(transcript), source: 'mock' };
    }

    try {
      const response = await env.client.messages.create({
        model: env.model,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        tools: [PARSE_TOOL],
        tool_choice: { type: 'tool', name: 'parse_observation' },
        messages: [
          {
            role: 'user',
            content: `Расшифровка голосового наблюдения от родителя (ru-RU):\n\n"${transcript}"\n\nПреврати в структурированные события дня через инструмент parse_observation.`,
          },
        ],
      });

      // Извлекаем tool_use блок
      const toolBlock = response.content.find((block) => block.type === 'tool_use');
      if (!toolBlock || toolBlock.type !== 'tool_use') {
        throw new Error('No tool_use block in Claude response');
      }
      const input2 = toolBlock.input as ParsedToolInput;
      const normalized = validateAndNormalize(input2);
      return { ...normalized, source: 'claude' };
    } catch (err) {
      console.error('[llm] Claude parse failed, fallback to mock:', err instanceof Error ? err.message : err);
      return { ...parseMock(transcript), source: 'mock' };
    }
  },
};

/** Helper: генерирует уникальный id для события (timestamp + nanoid). */
export function genEventId(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}