import { describe, expect, it } from 'vitest';
import { loadGoldenSet, runEval, scoreCase } from './runEval';

describe('golden RU eval harness', () => {
  it('loads the golden set', () => {
    const cases = loadGoldenSet();
    expect(cases.length).toBeGreaterThanOrEqual(15);
    expect(cases[0]).toHaveProperty('transcript');
    expect(cases[0]).toHaveProperty('expect.minEvents');
  });

  it('scores case fields', () => {
    const row = scoreCase(
      {
        transcript: 'В магазине было громко, ребёнок плакал.',
        expect: {
          minEvents: 2,
          types: ['sensory', 'behavior'],
          hasAbc: true,
          sensory: ['шум'],
        },
      },
      [
        { type: 'sensory', title: 'Сенсорика', sensoryContext: ['шум или громкий звук'] },
        {
          type: 'behavior',
          title: 'Реакция',
          abc: { antecedent: 'В магазине было громко.', behavior: 'Плакал.', consequence: '' },
        },
      ],
    );
    expect(row.passed).toBe(true);
  });

  it('runs on mock parser without live OpenAI', async () => {
    const previousKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'should-not-be-used-without-live-flag';

    const result = await runEval({ live: false });

    process.env.OPENAI_API_KEY = previousKey;
    expect(result.rows.length).toBeGreaterThanOrEqual(15);
    expect(result.scorePct).toBeGreaterThanOrEqual(0);
    expect(result.scorePct).toBeLessThanOrEqual(100);
    expect(result.rows.some((row) => row.passed)).toBe(true);
  });
});
