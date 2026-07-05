import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

type ExpectedCase = {
  transcript: string;
  expect: {
    minEvents: number;
    types: string[];
    hasAbc: boolean;
    sensory: string[];
    safetyFlag?: boolean;
  };
};

type ParsedEvent = {
  type?: string;
  title?: string;
  abc?: {
    antecedent?: string;
    behavior?: string;
    consequence?: string;
  };
  sensoryContext?: string[];
};

type FieldKey = 'minEvents' | 'types' | 'abc' | 'sensory' | 'safety';

type EvalRow = {
  index: number;
  minEventsOk: boolean;
  typesOk: boolean;
  abcOk: boolean;
  sensoryOk: boolean;
  safetyOk: boolean;
  passed: boolean;
  expectedTypes: string[];
  actualTypes: string[];
  eventCount: number;
};

const here = dirname(fileURLToPath(import.meta.url));

export function loadGoldenSet(path = join(here, 'golden.ru.json')): ExpectedCase[] {
  return JSON.parse(readFileSync(path, 'utf8')) as ExpectedCase[];
}

function eventHasAbc(event: ParsedEvent): boolean {
  const abc = event.abc;
  if (!abc) return false;
  return Boolean(abc.antecedent || abc.behavior || abc.consequence);
}

function eventSensoryText(event: ParsedEvent): string {
  return (event.sensoryContext ?? []).join(' ').toLowerCase();
}

export function scoreCase(testCase: ExpectedCase, events: ParsedEvent[], safetyFlag = false): EvalRow {
  const actualTypes = [...new Set(events.map((event) => event.type).filter((type): type is string => Boolean(type)))];
  const minEventsOk = events.length >= testCase.expect.minEvents;
  const typesOk = testCase.expect.types.every((type) => actualTypes.includes(type));
  const abcOk = !testCase.expect.hasAbc || events.some(eventHasAbc);
  const sensoryOk = testCase.expect.sensory.every((expected) =>
    events.some((event) => eventSensoryText(event).includes(expected.toLowerCase())),
  );
  const safetyOk = Boolean(testCase.expect.safetyFlag) === safetyFlag;
  return {
    index: 0,
    minEventsOk,
    typesOk,
    abcOk,
    sensoryOk,
    safetyOk,
    passed: minEventsOk && typesOk && abcOk && sensoryOk && safetyOk,
    expectedTypes: testCase.expect.types,
    actualTypes,
    eventCount: events.length,
  };
}

export function fieldBreakdown(rows: EvalRow[]): Record<FieldKey, number> {
  const pct = (ok: number) => Math.round((ok / rows.length) * 100);
  return {
    minEvents: pct(rows.filter((row) => row.minEventsOk).length),
    types: pct(rows.filter((row) => row.typesOk).length),
    abc: pct(rows.filter((row) => row.abcOk).length),
    sensory: pct(rows.filter((row) => row.sensoryOk).length),
    safety: pct(rows.filter((row) => row.safetyOk).length),
  };
}

export async function runEval(options: { live?: boolean } = {}): Promise<{ rows: EvalRow[]; scorePct: number; breakdown: Record<FieldKey, number> }> {
  if (options.live && !process.env.OPENAI_API_KEY?.trim()) {
    throw new Error('OPENAI_API_KEY is required for live eval');
  }
  if (!options.live) delete process.env.OPENAI_API_KEY;
  const { llmService } = await import('../src/services/llmService.js');
  const golden = loadGoldenSet();
  const rows: EvalRow[] = [];

  for (const [index, testCase] of golden.entries()) {
    const result = await llmService.parseTranscript({ transcript: testCase.transcript, language: 'ru' });
    const row = scoreCase(testCase, result.events, Boolean(result.safetyFlag));
    rows.push({ ...row, index: index + 1 });
  }

  const passed = rows.filter((row) => row.passed).length;
  const scorePct = Math.round((passed / rows.length) * 100);
  return { rows, scorePct, breakdown: fieldBreakdown(rows) };
}

function printRows(rows: EvalRow[], scorePct: number, breakdown: Record<FieldKey, number>) {
  console.table(rows.map((row) => ({
    '#': row.index,
    pass: row.passed ? 'yes' : 'no',
    events: row.eventCount,
    expectedTypes: row.expectedTypes.join(','),
    actualTypes: row.actualTypes.join(','),
    minEvents: row.minEventsOk ? 'ok' : 'fail',
    types: row.typesOk ? 'ok' : 'fail',
    abc: row.abcOk ? 'ok' : 'fail',
    sensory: row.sensoryOk ? 'ok' : 'fail',
    safety: row.safetyOk ? 'ok' : 'fail',
  })));
  console.table([{ ...breakdown, total: scorePct }]);
  console.info(`[eval] score=${scorePct}%`);
}

async function main() {
  const live = process.argv.includes('--live');
  const result = await runEval({ live });
  printRows(result.rows, result.scorePct, result.breakdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[eval] failed', err);
    process.exitCode = 1;
  });
}
