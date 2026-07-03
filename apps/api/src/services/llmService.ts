/**
 * llmService — OpenAI integration for RU observation parsing.
 *
 * Contract stays stable: parseTranscript returns events, insight,
 * clarificationQuestions, and source. v1.0rc also adds aiFallback/aiError so
 * clients can distinguish "mock because no key" from "mock after provider error".
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
type AIErrorCode = 'quota' | 'rate_limit' | 'invalid_json' | 'network' | 'provider_error';

export interface AIParserResponse extends AIParserResult {
  source: LLMSource;
  aiFallback: boolean;
  aiError?: AIErrorCode;
}

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

const SYSTEM_PROMPT = `Ты помогаешь родителю бережно структурировать русскоязычное голосовое наблюдение о дне ребёнка.

Извлекай события даже из свободного, разговорного текста: "поел кашу", "попил воду", "уснул в машине", "проснулся ночью", "сходил на горшок", "закрывал уши", "плакал", "кричал", "сказал мама", "показал жестом".

Верни только JSON по схеме. Не добавляй markdown.

Правила:
- Каждое явное наблюдаемое действие или состояние превращай в отдельное событие.
- Используй только типы: food, water, sleep, toilet, behavior, sensory, communication, state.
- Если время не названо, поставь приблизительное HH:MM из контекста или текущее неизвестное время "00:00".
- title: короткое русское название.
- description: одна осторожная фраза, начинай с "Похоже," или "Возможно,".
- insight: 1-2 осторожные фразы и обязательно текст "Это наблюдение, не диагноз."
- Не используй медицинские утверждения, диагнозы, лечение, нормализацию, стигматизирующие оценки.
- Не утверждай точную причину реакции.
- Уточняющие вопросы — только если реально нужны, максимум 3.`;

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
              pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'HH:MM in 24-hour format. Use 00:00 if not stated.',
            },
            title: { type: 'string', minLength: 2, maxLength: 80 },
            description: {
              type: 'string',
              minLength: 8,
              description: 'Cautious Russian sentence beginning with Похоже or Возможно.',
            },
            type: { type: 'string', enum: EVENT_TYPES },
          },
          required: ['timestamp', 'title', 'description', 'type'],
        },
      },
      insight: {
        type: 'string',
        minLength: 8,
        description: 'Must include: Это наблюдение, не диагноз.',
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

function currentTime(): string {
  const t = new Date();
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

function firstTime(text: string, fallback = currentTime()): string {
  const match = text.match(/\b([01]?\d|2[0-3])[:.ч ]([0-5]\d)\b/u);
  if (!match) return fallback;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function addEvent(
  events: AIParserEvent[],
  seen: Set<string>,
  transcript: string,
  type: AIParserEvent['type'],
  title: string,
  description: string,
) {
  const key = `${type}:${title}`;
  if (seen.has(key)) return;
  seen.add(key);
  events.push({ timestamp: firstTime(transcript), type, title, description });
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function ensureSafeInsight(insight: string): string {
  const trimmed = insight.trim();
  if (!trimmed) return 'Похоже, наблюдение зафиксировано. Это наблюдение, не диагноз.';
  return trimmed.includes('Это наблюдение, не диагноз') ? trimmed : `${trimmed} Это наблюдение, не диагноз.`;
}

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
      timestamp: /^\d{1,2}:\d{2}$/.test(event.timestamp) ? event.timestamp.padStart(5, '0') : '00:00',
      title: event.title,
      description: /^(Похоже|Возможно),/u.test(event.description)
        ? event.description
        : `Похоже, ${event.description.charAt(0).toLowerCase()}${event.description.slice(1)}`,
      type: event.type,
    }));

  const insight = ensureSafeInsight(typeof safeRaw.insight === 'string' ? safeRaw.insight : '');
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
  const events: AIParserEvent[] = [];
  const seen = new Set<string>();

  if (hasAny(text, [/\bпоел[аи]?\b/u, /\bел[аи]?\b/u, /\bсъел[аи]?\b/u, /\bкушал[аи]?\b/u, /кашу/u, /суп/u, /йогурт/u, /печень/u, /обед/u, /завтрак/u, /ужин/u])) {
    addEvent(events, seen, transcript, 'food', 'Приём пищи', 'Похоже, был зафиксирован приём пищи.');
  }
  if (hasAny(text, [/\bпил[аи]?\b/u, /\bвыпил[аи]?\b/u, /\bпопил[аи]?\b/u, /вод[уы]/u, /сок/u, /компот/u, /чай/u])) {
    addEvent(events, seen, transcript, 'water', 'Питьё', 'Похоже, был зафиксирован приём жидкости.');
  }
  if (hasAny(text, [/уснул[аи]?/u, /заснул[аи]?/u, /\bспал[аи]?\b/u, /проснул[аи]?[с]?/u, /сон/u, /дремал[аи]?/u])) {
    addEvent(events, seen, transcript, 'sleep', 'Сон', 'Похоже, был отмечен эпизод сна или пробуждения.');
  }
  if (hasAny(text, [/туалет/u, /горшок/u, /ту-ту/u, /писал[аи]?/u, /пописал[аи]?/u, /какал[аи]?/u, /подгуз/u])) {
    addEvent(events, seen, transcript, 'toilet', 'Туалет', 'Возможно, ребёнок подал сигнал о туалете или сходил в туалет.');
  }
  if (hasAny(text, [/закрывал[аи]? уши/u, /зажимал[аи]? уши/u, /уши закры/u, /шум/u, /громк/u, /свет/u, /ярк/u, /сенсор/u])) {
    addEvent(events, seen, transcript, 'sensory', 'Сенсорная реакция', 'Похоже, была сенсорная реакция на звук, свет или другой стимул.');
  }
  if (hasAny(text, [/плакал[аи]?/u, /кричал[аи]?/u, /расстроил[с]?/u, /злился/u, /убежал[аи]?/u, /ударил[аи]?/u, /нервничал[аи]?/u, /истерик/u])) {
    addEvent(events, seen, transcript, 'behavior', 'Эмоциональная реакция', 'Возможно, была заметная эмоциональная или поведенческая реакция.');
  }
  if (hasAny(text, [/сказал[аи]?/u, /произн[её]с/u, /повторил[аи]?/u, /попросил[аи]?/u, /показал[аи]?/u, /жест/u, /\bмама\b/u, /\bпапа\b/u, /\bдай\b/u, /\bнет\b/u, /\bда\b/u])) {
    addEvent(events, seen, transcript, 'communication', 'Коммуникация', 'Похоже, ребёнок использовал речь, звук или жест для коммуникации.');
  }
  if (hasAny(text, [/спокойн/u, /устал[аи]?/u, /вес[её]л/u, /возбужден/u, /возбужд[её]н/u, /сонн/u])) {
    addEvent(events, seen, transcript, 'state', 'Состояние', 'Похоже, было отмечено общее состояние ребёнка.');
  }

  const insight = events.length > 0
    ? `Похоже, в наблюдении выделено ${events.length} ${events.length === 1 ? 'событие' : 'события'}. Это гипотеза. Это наблюдение, не диагноз.`
    : 'Не удалось уверенно выделить события. Это наблюдение, не диагноз.';
  const clarificationQuestions = events.length > 0
    ? [
        { id: 'context', question: 'Что происходило перед этим?', options: ['Еда', 'Игра', 'Прогулка', 'Не знаю'] },
        { id: 'after', question: 'Как ребёнок выглядел после?', options: ['Спокойно', 'Устал(а)', 'Возбуждённо', 'Не заметил(а)'] },
      ]
    : [];
  return { events, insight, clarificationQuestions };
}

function parseResponseText(text: string): ParsedToolInput {
  const trimmed = text.trim();
  if (!trimmed) return { events: [] };
  return JSON.parse(trimmed) as ParsedToolInput;
}

function classifyOpenAIError(err: unknown): AIErrorCode {
  const status = typeof err === 'object' && err !== null && 'status' in err
    ? Number((err as { status?: unknown }).status)
    : undefined;
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (status === 429 && /quota|billing|insufficient_quota/u.test(message)) return 'quota';
  if (status === 429) return 'rate_limit';
  if (/quota|billing|insufficient_quota/u.test(message)) return 'quota';
  if (/network|fetch|econn|timeout|socket/u.test(message)) return 'network';
  return 'provider_error';
}

export const llmService = {
  enabled: env.enabled,
  model: env.model,

  status(): { enabled: boolean; model: string; source: LLMSource } {
    return { enabled: env.enabled, model: env.model, source: env.enabled ? 'openai' : 'mock' };
  },

  async parseTranscript(input: AIParserInput): Promise<AIParserResponse> {
    const transcript = (input?.transcript ?? '').trim();
    if (!transcript) {
      return {
        events: [],
        insight: 'Транскрипт пустой. Это наблюдение, не диагноз.',
        clarificationQuestions: [],
        source: env.enabled ? 'openai' : 'mock',
        aiFallback: false,
      };
    }
    if (!env.client) {
      return { ...parseMock(transcript), source: 'mock', aiFallback: false };
    }

    try {
      const response = await env.client.chat.completions.create({
        model: env.model,
        temperature: 0.1,
        response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Русский транскрипт наблюдения:\n\n${transcript}\n\nИзвлеки все наблюдаемые события. Верни JSON строго по схеме parse_observation.`,
          },
        ],
      });
      const usage = response.usage;
      console.info('[llm] openai usage', {
        model: env.model,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('OpenAI response did not include JSON content');
      const normalized = validateAndNormalize(parseResponseText(content));
      return { ...normalized, source: 'openai', aiFallback: false };
    } catch (err) {
      const aiError = err instanceof SyntaxError ? 'invalid_json' : classifyOpenAIError(err);
      console.warn('[llm] OpenAI parse failed, fallback to mock', {
        model: env.model,
        aiError,
        status: typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: unknown }).status : undefined,
      });
      return { ...parseMock(transcript), source: 'mock', aiFallback: true, aiError };
    }
  },
};

export function genEventId(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}
