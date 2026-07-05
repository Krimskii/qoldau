/**
 * llmService - OpenAI integration for RU observation parsing.
 *
 * Contract stays stable: parseTranscript returns events, insight,
 * clarificationQuestions, source, aiFallback and aiError.
 */
import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';
import { PARSE_RU_PROMPT_VERSION, PARSE_RU_SYSTEM_PROMPT } from './prompts/parseRuV2.js';
import { DEFAULT_OPENAI_MAX_RETRIES, DEFAULT_OPENAI_TIMEOUT_MS, readNonNegativeIntEnv, readPositiveIntEnv } from '../config/env.js';

export interface AIParserInput {
  transcript: string;
  childId?: string;
  language?: string;
}

export interface AIParserABC {
  antecedent?: string;
  behavior?: string;
  consequence?: string;
}

export interface AIParserEvent {
  timestamp: string;
  title: string;
  description: string;
  type: string;
  abc?: AIParserABC;
  sensoryContext?: string[];
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
  safetyFlag?: boolean;
}

export interface AIDigestInput {
  windowLabel?: string;
  eventCounts?: Record<string, number>;
  topTypes?: string[];
  safetyFlags?: string[];
  notes?: string[];
}

export interface AIDigestResponse {
  digest: string;
  source: LLMSource;
  aiFallback: boolean;
  aiError?: AIErrorCode;
}

interface ServiceEnv {
  apiKey: string | null;
  model: string;
  client: OpenAI | null;
  enabled: boolean;
  timeoutMs: number;
  maxRetries: number;
}

interface ParsedEvent {
  timestamp?: string;
  title?: string;
  description?: string;
  type?: string;
  abc?: AIParserABC | null;
  sensoryContext?: string[];
}

interface NormalizedParsedEvent {
  timestamp: string;
  title: string;
  description: string;
  type: (typeof EVENT_TYPES)[number];
  abc?: AIParserABC | null;
  sensoryContext?: string[];
}

interface ParsedToolInput {
  events?: ParsedEvent[];
  insight?: string;
  clarificationQuestions?: Array<{
    id?: string;
    question?: string;
    options?: string[];
  }>;
}

const EVENT_TYPES = ['food', 'water', 'sleep', 'toilet', 'sensory', 'behavior', 'communication', 'state'] as const;
const SAFE_INSIGHT_SUFFIX = 'Это наблюдение, не диагноз.';
const RED_FLAG_INSIGHT = 'Похоже, в наблюдении есть признаки возможной опасности или самоповреждения. Пожалуйста, обратитесь к специалисту или в экстренную службу, если риск сохраняется. Это наблюдение, не диагноз.';
const RED_FLAG_PATTERNS = [
  /самоповрежд/iu,
  /себя\s+(удар|бь|царап|кус)/iu,
  /ударил[аи]?\s+себя/iu,
  /бил[аи]?\s+себя/iu,
  /кусал[аи]?\s+себя/iu,
  /царапал[аи]?\s+себя/iu,
  /головой\s+(об|о|в)/iu,
  /бил[аи]?\s+себя\s+головой/iu,
  /ударил[аи]?\s+себя\s+головой/iu,
  /опасн/iu,
  /угроза/iu,
  /убежал[аи]?\s+на\s+дорогу/iu,
  /выбежал[аи]?\s+на\s+дорогу/iu,
];

function loadEnv(): ServiceEnv {
  const apiKey = process.env.OPENAI_API_KEY?.trim() || null;
  const model = process.env.OPENAI_LLM_MODEL?.trim() || 'gpt-4o-mini';
  const timeoutMs = readPositiveIntEnv('OPENAI_TIMEOUT_MS', DEFAULT_OPENAI_TIMEOUT_MS);
  const maxRetries = readNonNegativeIntEnv('OPENAI_MAX_RETRIES', DEFAULT_OPENAI_MAX_RETRIES);
  if (!apiKey) return { apiKey: null, model, client: null, enabled: false, timeoutMs, maxRetries };
  return {
    apiKey: '[set]',
    model,
    client: new OpenAI({ apiKey, timeout: timeoutMs, maxRetries }),
    enabled: true,
    timeoutMs,
    maxRetries,
  };
}

const env = loadEnv();

const ABC_SCHEMA = {
  anyOf: [
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        antecedent: { type: 'string', description: 'Что было перед событием. Empty string if unknown.' },
        behavior: { type: 'string', description: 'Что сделал ребёнок или какая реакция наблюдалась. Empty string if unknown.' },
        consequence: { type: 'string', description: 'Что произошло после. Empty string if unknown.' },
      },
      required: ['antecedent', 'behavior', 'consequence'],
    },
    { type: 'null' },
  ],
} as const;

const JSON_SCHEMA = {
  name: 'parse_observation',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      events: {
        type: 'array',
        minItems: 1,
        description: 'All observable events extracted from a meaningful Russian observation.',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            timestamp: {
              type: 'string',
              pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'HH:MM in 24-hour format. Use 00:00 if time is unknown.',
            },
            title: { type: 'string', minLength: 2, maxLength: 80 },
            description: {
              type: 'string',
              minLength: 16,
              description: 'Cautious Russian sentence beginning with "Похоже," or "Возможно,".',
            },
            type: { type: 'string', enum: EVENT_TYPES },
            abc: ABC_SCHEMA,
            sensoryContext: {
              type: 'array',
              maxItems: 5,
              items: { type: 'string', minLength: 2, maxLength: 80 },
              description: 'Short sensory context facts, e.g. шум, яркий свет, толпа. Empty array if none.',
            },
          },
          required: ['timestamp', 'title', 'description', 'type', 'abc', 'sensoryContext'],
        },
      },
      insight: {
        type: 'string',
        minLength: 24,
        description: `1-2 cautious Russian sentences. Must include: ${SAFE_INSIGHT_SUFFIX}`,
      },
      clarificationQuestions: {
        type: 'array',
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            question: { type: 'string', minLength: 6 },
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

function normalizeTime(timestamp?: string): string {
  const match = timestamp?.match(/^([01]?\d|2[0-3]):([0-5]\d)$/u);
  if (!match) return '00:00';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function hasContent(transcript: string): boolean {
  return /[а-яёa-z0-9]{3,}/iu.test(transcript);
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function hasRedFlag(transcript: string): boolean {
  return hasAny(transcript.toLowerCase(), RED_FLAG_PATTERNS);
}

function safeSentence(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return 'Похоже, наблюдение требует уточнения.';
  if (/^(Похоже|Возможно),/u.test(trimmed)) return trimmed;
  return `Похоже, ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
}

function ensureSafeInsight(insight: string): string {
  const trimmed = insight.trim();
  if (!trimmed) return `Похоже, наблюдение зафиксировано. ${SAFE_INSIGHT_SUFFIX}`;
  return trimmed.includes(SAFE_INSIGHT_SUFFIX) ? trimmed : `${trimmed} ${SAFE_INSIGHT_SUFFIX}`;
}

function normalizeABC(abc: ParsedEvent['abc']): AIParserABC | undefined {
  if (!abc || typeof abc !== 'object') return undefined;
  const antecedent = typeof abc.antecedent === 'string' ? abc.antecedent.trim() : '';
  const behavior = typeof abc.behavior === 'string' ? abc.behavior.trim() : '';
  const consequence = typeof abc.consequence === 'string' ? abc.consequence.trim() : '';
  if (!antecedent && !behavior && !consequence) return undefined;
  return { antecedent, behavior, consequence };
}

function addEvent(
  events: AIParserEvent[],
  seen: Set<string>,
  transcript: string,
  event: Omit<AIParserEvent, 'timestamp'> & { timestamp?: string },
) {
  const key = `${event.type}:${event.title}`;
  if (seen.has(key)) return;
  seen.add(key);
  events.push({
    timestamp: event.timestamp ?? firstTime(transcript),
    type: event.type,
    title: event.title,
    description: safeSentence(event.description),
    abc: event.abc,
    sensoryContext: event.sensoryContext?.filter(Boolean),
  });
}

function validateAndNormalize(raw: ParsedToolInput | null | undefined, transcript: string): AIParserResult {
  const safeRaw = raw ?? { events: [] };
  const events = (safeRaw.events ?? [])
    .filter((event): event is NormalizedParsedEvent =>
      typeof event.timestamp === 'string'
      && typeof event.title === 'string'
      && typeof event.description === 'string'
      && typeof event.type === 'string'
      && EVENT_TYPES.includes(event.type as (typeof EVENT_TYPES)[number]),
    )
    .map((event) => {
      const abc = normalizeABC(event.abc);
      const sensoryContext = Array.isArray(event.sensoryContext)
        ? event.sensoryContext.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim()).slice(0, 5)
        : [];
      return {
        timestamp: normalizeTime(event.timestamp),
        title: event.title.trim(),
        description: safeSentence(event.description),
        type: event.type,
        ...(abc ? { abc } : {}),
        ...(sensoryContext.length > 0 ? { sensoryContext } : {}),
      };
    });

  if (events.length === 0 && hasContent(transcript)) {
    throw new SyntaxError('Structured output returned no events for non-empty transcript');
  }

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

function buildABC(text: string, behavior: string): AIParserABC | undefined {
  const antecedentParts: string[] = [];
  const consequenceParts: string[] = [];
  if (hasAny(text, [/после/u, /когда/u, /перед/u, /в магазине/u, /на занятии/u, /в очереди/u, /на прогулке/u])) {
    antecedentParts.push('В тексте указан предшествующий контекст, его стоит подтвердить.');
  }
  if (hasAny(text, [/после этого/u, /потом/u, /затем/u, /успокоил/u, /ушли/u, /дали/u, /обнял/u])) {
    consequenceParts.push('В тексте указан результат после события, его стоит уточнить.');
  }
  if (!antecedentParts.length && !consequenceParts.length) return undefined;
  return {
    antecedent: antecedentParts.join(' '),
    behavior,
    consequence: consequenceParts.join(' '),
  };
}

function attachABC(events: AIParserEvent[], abc: AIParserABC | undefined) {
  if (!abc || events.some((event) => event.abc)) return;
  const preferred = events.find((event) => event.type !== 'sensory') ?? events[0];
  if (preferred) preferred.abc = abc;
}

function sensoryContextFrom(text: string): string[] {
  const contexts: string[] = [];
  if (hasAny(text, [/шум/u, /громк/u, /музык/u, /звук/u])) contexts.push('шум или громкий звук');
  if (hasAny(text, [/свет/u, /ярк/u, /экран/u])) contexts.push('яркий свет');
  if (hasAny(text, [/толп/u, /очеред/u, /магазин/u, /много людей/u])) contexts.push('толпа или людное место');
  if (hasAny(text, [/запах/u])) contexts.push('запах');
  if (hasAny(text, [/одежд/u, /бирк/u, /шв/u, /прикосн/u])) contexts.push('одежда или прикосновение');
  return [...new Set(contexts)].slice(0, 5);
}

function parseMock(transcript: string): AIParserResult {
  const text = transcript.toLowerCase();
  const events: AIParserEvent[] = [];
  const seen = new Set<string>();
  const timestamp = firstTime(transcript);
  const sensoryContext = sensoryContextFrom(text);
  const sharedABC = buildABC(text, 'Наблюдаемое действие или состояние ребёнка.');

  if (hasAny(text, [/\bпоел[аи]?\b/u, /\bел[аи]?\b/u, /\bсъел[аи]?\b/u, /\bкушал[аи]?\b/u, /кашу/u, /суп/u, /йогурт/u, /печень/u, /обед/u, /завтрак/u, /ужин/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'food', title: 'Приём пищи', description: 'Похоже, был зафиксирован приём пищи.' });
  }
  if (hasAny(text, [/\bпил[аи]?\b/u, /\bвыпил[аи]?\b/u, /\bпопил[аи]?\b/u, /вод[уы]/u, /сок/u, /компот/u, /чай/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'water', title: 'Питьё', description: 'Похоже, был зафиксирован приём жидкости.' });
  }
  if (hasAny(text, [/уснул[аи]?/u, /заснул[аи]?/u, /\bспал[аи]?\b/u, /проснул[аи]?[с]?/u, /сон/u, /дремал[аи]?/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'sleep', title: 'Сон', description: 'Похоже, был отмечен эпизод сна или пробуждения.' });
  }
  if (hasAny(text, [/туалет/u, /горшок/u, /ту-ту/u, /писал[аи]?/u, /пописал[аи]?/u, /какал[аи]?/u, /подгуз/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'toilet', title: 'Туалет', description: 'Возможно, ребёнок подал сигнал о туалете или сходил в туалет.' });
  }
  if (sensoryContext.length > 0 || hasAny(text, [/закрывал[аи]? уши/u, /зажимал[аи]? уши/u, /уши закры/u, /сенсор/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'sensory', title: 'Сенсорный контекст', description: 'Похоже, была сенсорная реакция на окружающие стимулы.', sensoryContext });
  }
  if (hasAny(text, [/плакал[аи]?/u, /кричал[аи]?/u, /кричать/u, /стал[аи]? крич/u, /расстроил[с]?/u, /злил[с]?/u, /убежал[аи]?/u, /уш[её]л/u, /ударил[аи]?/u, /нервничал[аи]?/u, /истерик/u, /хотел уйти/u, /бегал[аи]?/u, /не хотел[аи]? разговаривать/u, /тянул[аи]? воротник/u])) {
    addEvent(events, seen, transcript, {
      timestamp,
      type: 'behavior',
      title: 'Эмоциональная реакция',
      description: 'Возможно, была заметная эмоциональная или поведенческая реакция.',
      abc: buildABC(text, 'Заметная эмоциональная или поведенческая реакция.'),
      sensoryContext,
    });
  }
  if (hasAny(text, [/сказал[аи]?/u, /произн[её]с/u, /повторил[аи]?/u, /повторял[аи]?/u, /попросил[аи]?/u, /просил[аи]?/u, /просил[аи]?сь/u, /показал[аи]?/u, /жест/u, /\bмама\b/u, /\bпапа\b/u, /\bдай\b/u, /\bнет\b/u, /\bда\b/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'communication', title: 'Коммуникация', description: 'Похоже, ребёнок использовал речь, звук или жест для коммуникации.' });
  }
  if (hasAny(text, [/споко/u, /устал[аи]?/u, /вес[её]л/u, /возбужден/u, /возбужд[её]н/u, /сонн/u])) {
    addEvent(events, seen, transcript, { timestamp, type: 'state', title: 'Состояние', description: 'Похоже, было отмечено общее состояние ребёнка.' });
  }
  attachABC(events, sharedABC);

  const insight = events.length > 0
    ? `Похоже, в наблюдении выделено ${events.length} ${events.length === 1 ? 'событие' : 'события'}. ${SAFE_INSIGHT_SUFFIX}`
    : `Не удалось уверенно выделить событие. ${SAFE_INSIGHT_SUFFIX}`;
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
  if (/network|fetch|econn|timeout|socket|abort|timed out/u.test(message)) return 'network';
  return 'provider_error';
}

function summarizeCounts(eventCounts: Record<string, number> | undefined): string {
  const entries = Object.entries(eventCounts ?? {})
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return 'событий пока немного';
  return entries.slice(0, 3).map(([type, count]) => `${type}: ${count}`).join(', ');
}

function buildMockDigest(input: AIDigestInput): string {
  const windowLabel = input.windowLabel?.trim() || 'за выбранный период';
  const counts = summarizeCounts(input.eventCounts);
  const topTypes = (input.topTypes ?? []).filter(Boolean).slice(0, 3);
  const focus = topTypes.length > 0 ? topTypes.join(', ') : counts;
  const safety = (input.safetyFlags ?? []).filter(Boolean);
  const parts = [
    `Похоже, ${windowLabel} чаще всего отмечались: ${focus}.`,
    safety.length > 0
      ? 'В наблюдениях есть сигналы, которые лучше спокойно обсудить со специалистом.'
      : 'Возможная картина требует подтверждения по следующим наблюдениям.',
    'Это наблюдение, не диагноз.',
  ];
  return parts.join(' ');
}

export const llmService = {
  enabled: env.enabled,
  model: env.model,
  promptVersion: PARSE_RU_PROMPT_VERSION,

  status(): { enabled: boolean; model: string; source: LLMSource; promptVersion: string } {
    return { enabled: env.enabled, model: env.model, source: env.enabled ? 'openai' : 'mock', promptVersion: PARSE_RU_PROMPT_VERSION };
  },

  async parseTranscript(input: AIParserInput): Promise<AIParserResponse> {
    const transcript = (input?.transcript ?? '').trim();
    if (!transcript) {
      return {
        events: [],
        insight: `Транскрипт пустой. ${SAFE_INSIGHT_SUFFIX}`,
        clarificationQuestions: [],
        source: env.enabled ? 'openai' : 'mock',
        aiFallback: false,
      };
    }
    if (hasRedFlag(transcript)) {
      return {
        events: [],
        insight: RED_FLAG_INSIGHT,
        clarificationQuestions: [],
        source: env.enabled ? 'openai' : 'mock',
        aiFallback: false,
        safetyFlag: true,
      };
    }
    if (!env.client) return { ...parseMock(transcript), source: 'mock', aiFallback: false };

    try {
      const response = await env.client.chat.completions.create({
        model: env.model,
        temperature: 0.1,
        response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
        messages: [
          { role: 'system', content: PARSE_RU_SYSTEM_PROMPT },
          { role: 'user', content: `Русский транскрипт наблюдения:\n\n${transcript}\n\nИзвлеки все наблюдаемые события. Верни JSON строго по схеме parse_observation.` },
        ],
      });
      const usage = response.usage;
      console.info('[llm] openai usage', {
        model: env.model,
        promptVersion: PARSE_RU_PROMPT_VERSION,
        timeoutMs: env.timeoutMs,
        maxRetries: env.maxRetries,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('OpenAI response did not include JSON content');
      const normalized = validateAndNormalize(parseResponseText(content), transcript);
      return { ...normalized, source: 'openai', aiFallback: false };
    } catch (err) {
      const aiError = err instanceof SyntaxError ? 'invalid_json' : classifyOpenAIError(err);
      console.warn('[llm] OpenAI parse failed, fallback to mock', {
        model: env.model,
        promptVersion: PARSE_RU_PROMPT_VERSION,
        timeoutMs: env.timeoutMs,
        maxRetries: env.maxRetries,
        aiError,
        status: typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: unknown }).status : undefined,
      });
      return { ...parseMock(transcript), source: 'mock', aiFallback: true, aiError };
    }
  },

  async digestAggregates(input: AIDigestInput): Promise<AIDigestResponse> {
    if (!env.client) {
      return { digest: buildMockDigest(input), source: 'mock', aiFallback: false };
    }

    try {
      const response = await env.client.chat.completions.create({
        model: env.model,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'Ты кратко суммируешь обезличенные агрегаты наблюдений. Верни 2-4 русские фразы. Тон осторожный: "Похоже..." или "Возможно...". Обязательно добавь "Это наблюдение, не диагноз." Не ставь диагнозы и не делай медицинских обещаний.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              windowLabel: input.windowLabel,
              eventCounts: input.eventCounts,
              topTypes: input.topTypes,
              safetyFlags: input.safetyFlags,
              notes: input.notes?.slice(0, 5),
            }),
          },
        ],
      });
      const digest = response.choices[0]?.message?.content?.trim();
      if (!digest) throw new Error('OpenAI digest did not include content');
      return { digest: ensureSafeInsight(digest), source: 'openai', aiFallback: false };
    } catch (err) {
      const aiError = classifyOpenAIError(err);
      console.warn('[llm] OpenAI digest failed, fallback to mock', {
        model: env.model,
        promptVersion: PARSE_RU_PROMPT_VERSION,
        timeoutMs: env.timeoutMs,
        maxRetries: env.maxRetries,
        aiError,
        status: typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: unknown }).status : undefined,
      });
      return { digest: buildMockDigest(input), source: 'mock', aiFallback: true, aiError };
    }
  },
};

export function genEventId(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}
