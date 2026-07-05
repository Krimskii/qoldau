import { describe, expect, it } from 'vitest';
import { fieldBreakdown, loadGoldenSet, runEval, scoreCase } from './runEval';

describe('golden RU eval harness', () => {
  it('loads the expanded golden set', () => {
    const cases = loadGoldenSet();
    expect(cases.length).toBe(31);
    expect(cases.some((item) => item.expect.safetyFlag)).toBe(true);
    expect(cases.some((item) => item.expect.sensory.length > 0)).toBe(true);
  });

  it('scores per-field breakdown', () => {
    const rows = [
      scoreCase(
        {
          transcript: 'В магазине было громко, ребёнок плакал.',
          expect: { minEvents: 2, types: ['sensory', 'behavior'], hasAbc: true, sensory: ['шум'], safetyFlag: false },
        },
        [
          { type: 'sensory', title: 'Сенсорика', sensoryContext: ['шум или громкий звук'] },
          { type: 'behavior', title: 'Реакция', abc: { antecedent: 'Шум.', behavior: 'Плакал.', consequence: '' } },
        ],
        false,
      ),
      scoreCase(
        {
          transcript: 'Ребёнок бил себя головой.',
          expect: { minEvents: 0, types: [], hasAbc: false, sensory: [], safetyFlag: true },
        },
        [],
        true,
      ),
    ];
    expect(rows.every((row) => row.passed)).toBe(true);
    expect(fieldBreakdown(rows)).toEqual({
      minEvents: 100,
      types: 100,
      abc: 100,
      sensory: 100,
      safety: 100,
    });
  });

  it('runs on mock parser without live OpenAI', async () => {
    const previousKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'should-not-be-used-without-live-flag';

    const result = await runEval({ live: false });

    process.env.OPENAI_API_KEY = previousKey;
    expect(result.rows.length).toBe(31);
    expect(result.scorePct).toBeGreaterThanOrEqual(75);
    expect(result.scorePct).toBeLessThanOrEqual(100);
    expect(result.breakdown.safety).toBeGreaterThan(0);
    expect(result.rows.some((row) => row.passed)).toBe(true);
  });

  it('requires OPENAI_API_KEY for live eval', async () => {
    const previousKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(runEval({ live: true })).rejects.toThrow('OPENAI_API_KEY is required for live eval');

    process.env.OPENAI_API_KEY = previousKey;
  });
});
