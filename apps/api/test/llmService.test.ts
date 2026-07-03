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

  it('returns openai source and logs token usage without transcript text', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const transcript = 'Ребёнок поел кашу и попил воду.';
    const { llmService } = await loadServiceWithOpenAIMock(async () => ({
      usage: {
        prompt_tokens: 100,
        completion_tokens: 40,
        total_tokens: 140,
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
                },
              ],
              insight: 'Похоже, наблюдение зафиксировано. Это наблюдение, не диагноз.',
              clarificationQuestions: [],
            }),
          },
        },
      ],
    }));

    const result = await llmService.parseTranscript({ transcript });
    expect(result.source).toBe('openai');
    expect(result.aiFallback).toBe(false);
    expect(result.events).toHaveLength(1);
    expect(info).toHaveBeenCalledWith('[llm] openai usage', expect.objectContaining({
      model: 'gpt-4o-mini',
      promptTokens: 100,
      completionTokens: 40,
      totalTokens: 140,
    }));
    expect(JSON.stringify(info.mock.calls)).not.toContain(transcript);
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
});
