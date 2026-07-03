/**
 * llmService — OpenAI integration for AI parser.
 *
 * Opt-in: uses OPENAI_API_KEY. If the key is missing or the API call fails,
 * parsing falls back to the local keyword-based mock.
 *
 * Default model: gpt-4o-mini. Override with OPENAI_LLM_MODEL.
 */
import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';

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

type LLMSource = 'openai' | 'mock';

interface ServiceEnv {
  apiKey: string | null;
  model: string;
  client: OpenAI | null;
  enabled: boolean;
}

interface ParsedToolInput {
  events?: Array<{
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

const EVENT_TYPES = ['food', 'water', 'toilet', 'sleep', 'sensory', 'behavior', 'communication', 'state'] as const;

function loadEnv(): ServiceEnv {
  const apiKey = process.env.OPENAI_API_KEY?.trim() || null;
  const model = process.env.OPENAI_LLM_MODEL?.trim() || 'gpt-4o-mini';
  if (!apiKey) {
    return { apiKey: null, model, client: null, enabled: false };
  }
  return { apiKey: '[set]', model, client: new OpenAI({ apiKey }), enabled: true };
}

const env = loadEnv();

const SYSTEM_PROMPT = `Ты помощник для родителя, который фиксирует голосовые наблюдения о дне ребёнка.
Твоя задача — аккуратно превратить расшифровку речи в структурированные события.

Правила безопасности:
- Это наблюдение, не диагноз.
- Пиши как гипотезу: "похоже", "возможно", "заметил(а)", "нужно подтвердить".
- Не добавляй факты, которых нет в тексте.
- Не давай медицинских заключений, терапевтических обещаний или категоричных оценок.
- Язык ответа: русский.

Типы событий, только из списка:
- food: приём пищи.
- water: питьё.
- toilet: туалет.
- sleep: сон.
- sensory: сенсорная реакция.
- behavior: заметное состояние или действие.
- communication: речь, жесты, просьбы, ответы.
- state: общее состояние.

Уточняющие вопросы добавляй только если они помогают бережно понять ситуацию. Не больше 3.`;

const JSON_SCHEMA = {
  name: 'parse_observation',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            timestamp: {
              type: 'string',
              description: 'HH:MM in 24-hour format. Use current/contextual time if not present.',
            },
            title: {
              type: 'string',
              description: 'Short event title, 2-5 words.',
            },
            description: {
              type: 'string',
              description: 'One cautious sentence based only on the transcript.',
            },
            type: {
              type: 'string',
              enum: EVENT_TYPES,
            },
          },
          required: ['timestamp', 'title', 'description', 'type'],
        },
      },
      insight: {
        type: 'string',
        description: 'One or two cautious sentences. Must include: "Это наблюдение, не диагноз."',
      },
      clarificationQuestions: {
        type: 'array',
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            question: { type: 'string' },
            options: {
              type: 'array',
              minItems: 2,
              maxItems: 4,
              items: { type: 'string' },
            },
          },
          required: ['id', 'question', 'options'],
        },
      },
    },
    required: ['events', 'insight', 'clarificationQuestions'],
  },
} as const;

function validateAndNormalize(raw: ParsedToolInput | null | undefined): AIParserResult {
  const safeRaw = raw ?? { events: [] };
  const events = (safeRaw.events ?? [])
    .filter((event): event is { timestamp: string; title: string; description: string; type: string } =>
      typeof event.timestamp === 'string'
      && typeof event.title === 'string'
      && typeof event.description === 'string'
      && typeof event.type === 'string'
      && EVENT_TYPES.includes(event.type as (typeof EVENT_TYPES)[number]),
    )
    .map((event) => ({
      timestamp: event.timestamp,
      title: event.title,
      description: event.description,
      type: event.type,
    }));

  const insight = typeof safeRaw.insight === 'string' && safeRaw.insight.trim().length > 0
    ? safeRaw.insight.trim()
    : 'Похоже, наблюдение зафиксировано. Это наблюдение, не диагноз.';

  const clarificationQuestions = (safeRaw.clarificationQuestions ?? [])
    .filter((question): question is { id: string; question: string; options: string[] } =>
      typeof question.id === 'string'
      && typeof question.question === 'string'
      && Array.isArray(question.options)
      && question.options.length >= 2,
    )
    .map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options.slice(0, 4),
    }));

  return { events, insight, clarificationQuestions };
}

function parseMock(transcript: string): AIParserResult {
  const text = transcript.toLowerCase();
  const events: AIParserResult['events'] = [];
  const timeMatches = transcript.match(/\b(\d{1,2}):(\d{2})\b/g);
  const nextTime = () => {
    const t = new Date();
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  };
  const findTime = (idx: number) => (timeMatches && timeMatches[idx]) || nextTime();

  if (text.includes('поел') || text.includes('кашу') || text.includes('суп') || text.includes('еда')) {
    events.push({
      timestamp: findTime(0),
      title: 'Приём пищи',
      description: 'Похоже, был зафиксирован приём пищи.',
      type: 'food',
    });
  }
  if (text.includes('пил') || text.includes('вода') || text.includes('выпил')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Питьё',
      description: 'Похоже, был зафиксирован приём жидкости.',
      type: 'water',
    });
  }
  if (text.includes('туалет') || text.includes('горшок') || text.includes('ту-ту')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Туалет',
      description: 'Возможно, ребёнок подал сигнал о туалете или сходил в туалет.',
      type: 'toilet',
    });
  }
  if (text.includes('закрывал уши') || text.includes('шум') || text.includes('громко')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Реакция на шум',
      description: 'Похоже, была сенсорная реакция на громкий звук.',
      type: 'sensory',
    });
  }
  if (text.includes('сказал') || text.includes('произнес') || text.includes('произнёс')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Коммуникация',
      description: 'Похоже, ребёнок использовал речь или звук для коммуникации.',
      type: 'communication',
    });
  }

  const insight = events.length > 0
    ? `Похоже, в наблюдении выделено ${events.length} ${events.length === 1 ? 'событие' : 'события'}. Это гипотеза. Это наблюдение, не диагноз.`
    : 'Не удалось уверенно выделить события. Это наблюдение, не диагноз.';

  return {
    events,
    insight,
    clarificationQuestions: [
      {
        id: 'context',
        question: 'Что происходило перед этим?',
        options: ['Еда', 'Игра', 'Прогулка', 'Не знаю'],
      },
      {
        id: 'after',
        question: 'Как ребёнок выглядел после?',
        options: ['Спокойно', 'Устал(а)', 'Возбуждённо', 'Не заметил(а)'],
      },
    ],
  };
}

function parseResponseText(text: string): ParsedToolInput {
  const trimmed = text.trim();
  if (!trimmed) return { events: [] };
  return JSON.parse(trimmed) as ParsedToolInput;
}

export const llmService = {
  enabled: env.enabled,
  model: env.model,

  status(): { enabled: boolean; model: string; source: LLMSource } {
    return { enabled: env.enabled, model: env.model, source: env.enabled ? 'openai' : 'mock' };
  },

  async parseTranscript(input: AIParserInput): Promise<AIParserResult & { source: LLMSource }> {
    const transcript = (input?.transcript ?? '').trim();
    if (!transcript) {
      return {
        events: [],
        insight: 'Транскрипт пустой. Это наблюдение, не диагноз.',
        clarificationQuestions: [],
        source: env.enabled ? 'openai' : 'mock',
      };
    }

    if (!env.client) {
      return { ...parseMock(transcript), source: 'mock' };
    }

    try {
      const response = await env.client.chat.completions.create({
        model: env.model,
        temperature: 0.2,
        response_format: {
          type: 'json_schema',
          json_schema: JSON_SCHEMA,
        },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Расшифровка голосового наблюдения (${input.language ?? 'ru'}):\n\n${transcript}\n\nВерни только JSON по схеме parse_observation.`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI response did not include JSON content');
      }
      const normalized = validateAndNormalize(parseResponseText(content));
      return { ...normalized, source: 'openai' };
    } catch (err) {
      console.error('[llm] OpenAI parse failed, fallback to mock:', err instanceof Error ? err.message : err);
      return { ...parseMock(transcript), source: 'mock' };
    }
  },
};

export function genEventId(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}
