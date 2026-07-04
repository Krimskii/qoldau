import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadServiceWithOpenAIMock(createImpl: () => Promise<unknown>) {
  vi.resetModules();
  const create = vi.fn(createImpl);
  vi.doMock('openai', () => ({
    default: class MockOpenAI {
      chat = {
        completions: {
          create,
        },
      };
    },
  }));
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.OPENAI_LLM_MODEL = 'gpt-4o-mini';
  const mod = await import('../src/services/llmService');
  return { llmService: mod.llmService, create };
}

describe('llmService OpenAI fallback semantics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock('openai');
    process.env.OPENAI_API_KEY = '';
    process.env.OPENAI_LLM_MODEL = '';
  });

  it('returns openai source and logs token usage with prompt version without transcript text', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const transcript = 'Ребёнок поел кашу, попил воду, потом в магазине закрывал уши от шума и плакал.';
    const { llmService, create } = await loadServiceWithOpenAIMock(async () => ({
      usage: {
        prompt_tokens: 620,
        completion_tokens: 180,
        total_tokens: 800,
      },
      choices: [
        {
          message: {
            content: JSON.stringify({
              events: [
                {
                  timestamp: '08:30',
                  title: 'Приём пищи',
                  description: 'Похоже, был зафиксирован приём пищи.',
                  type: 'food',
                  abc: null,
                  sensoryContext: [],
                },
                {
                  timestamp: '08:35',
                  title: 'Сенсорная реакция',
                  description: 'Возможно, шум в магазине был важным контекстом реакции.',
                  type: 'sensory',
                  abc: {
                    antecedent: 'В магазине было шумно.',
                    behavior: 'Ребёнок закрывал уши и плакал.',
                    consequence: '',
                  },
                  sensoryContext: ['шум', 'магазин'],
                },
              ],
              insight: 'Похоже, шум мог быть важным контекстом реакции. Это наблюдение, не диагноз.',
              clarificationQuestions: [
                {
                  id: 'after',
                  question: 'Что помогло ребёнку успокоиться?',
                  options: ['Тишина', 'Уход из магазина'],
                },
              ],
            }),
          },
        },
      ],
    }));

    const result = await llmService.parseTranscript({ transcript });
    expect(result.source).toBe('openai');
    expect(result.aiFallback).toBe(false);
    expect(result.events).toHaveLength(2);
    expect(result.events[1].abc?.behavior).toContain('закрывал уши');
    expect(result.events[1].sensoryContext).toContain('шум');
    expect(info).toHaveBeenCalledWith('[llm] openai usage', expect.objectContaining({
      model: 'gpt-4o-mini',
      promptVersion: 'parse-ru.v2',
      promptTokens: 620,
      completionTokens: 180,
      totalTokens: 800,
    }));
    expect(JSON.stringify(info.mock.calls)).not.toContain(transcript);

    const request = create.mock.calls[0]?.[0] as {
      response_format?: { json_schema?: { schema?: { properties?: { events?: { minItems?: number } } } } };
      messages?: Array<{ role: string; content: string }>;
    };
    expect(request.response_format?.json_schema?.schema?.properties?.events?.minItems).toBe(1);
    expect(request.messages?.[0]?.content).toContain('Цель: извлечь полный набор наблюдаемых событий');
  });

  it('sets aiFallback and quota error when OpenAI quota/rate call fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = new Error('insufficient_quota');
    Object.assign(error, { status: 429 });
    const { llmService } = await loadServiceWithOpenAIMock(async () => {
      throw error;
    });

    const result = await llmService.parseTranscript({ transcript: 'Ребёнок поел кашу.' });
    expect(result.source).toBe('mock');
    expect(result.aiFallback).toBe(true);
    expect(result.aiError).toBe('quota');
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('sets aiFallback and invalid_json when structured output cannot be parsed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { llmService } = await loadServiceWithOpenAIMock(async () => ({
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
      choices: [
        {
          message: {
            content: '{not valid json',
          },
        },
      ],
    }));

    const result = await llmService.parseTranscript({ transcript: 'Ребёнок попил воду.' });
    expect(result.source).toBe('mock');
    expect(result.aiFallback).toBe(true);
    expect(result.aiError).toBe('invalid_json');
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('keeps safety disclaimer in insight when OpenAI omits it', async () => {
    const { llmService } = await loadServiceWithOpenAIMock(async () => ({
      usage: {
        prompt_tokens: 100,
        completion_tokens: 80,
        total_tokens: 180,
      },
      choices: [
        {
          message: {
            content: JSON.stringify({
              events: [
                {
                  timestamp: '10:00',
                  title: 'Питьё',
                  description: 'Похоже, ребёнок попил воду.',
                  type: 'water',
                  abc: null,
                  sensoryContext: [],
                },
              ],
              insight: 'Похоже, стоит уточнить контекст питья.',
              clarificationQuestions: [],
            }),
          },
        },
      ],
    }));

    const result = await llmService.parseTranscript({ transcript: 'Ребёнок попил воду.' });
    expect(result.aiFallback).toBe(false);
    expect(result.insight.toLowerCase()).toContain('наблюдение, не диагноз');
  });

  it('falls back to mock when OpenAI returns no events for meaningful transcript', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { llmService } = await loadServiceWithOpenAIMock(async () => ({
      usage: {
        prompt_tokens: 20,
        completion_tokens: 19,
        total_tokens: 39,
      },
      choices: [
        {
          message: {
            content: JSON.stringify({
              events: [],
              insight: 'Похоже, нужно уточнение. Это наблюдение, не диагноз.',
              clarificationQuestions: [],
            }),
          },
        },
      ],
    }));

    const result = await llmService.parseTranscript({
      transcript: 'После громкой музыки ребёнок закрыл уши, плакал, потом сказал мама и попросил воды.',
    });
    expect(result.source).toBe('mock');
    expect(result.aiFallback).toBe(true);
    expect(result.aiError).toBe('invalid_json');
    expect(result.events.length).toBeGreaterThan(0);
  });
});
