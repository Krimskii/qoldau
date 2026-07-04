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

type EvalRow = {
  index: number;
  minEventsOk: boolean;
  typesOk: boolean;
  abcOk: boolean;
  sensoryOk: boolean;
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

export function scoreCase(testCase: ExpectedCase, events: ParsedEvent[]): EvalRow {
  const actualTypes = [...new Set(events.map((event) => event.type).filter((type): type is string => Boolean(type)))];
  const minEventsOk = events.length >= testCase.expect.minEvents;
  const typesOk = testCase.expect.types.every((type) => actualTypes.includes(type));
  const abcOk = !testCase.expect.hasAbc || events.some(eventHasAbc);
  const sensoryOk = testCase.expect.sensory.every((expected) =>
    events.some((event) => eventSensoryText(event).includes(expected.toLowerCase())),
  );
  return {
    index: 0,
    minEventsOk,
    typesOk,
    abcOk,
    sensoryOk,
    passed: minEventsOk && typesOk && abcOk && sensoryOk,
    expectedTypes: testCase.expect.types,
    actualTypes,
    eventCount: events.length,
  };
}

export async function runEval(options: { live?: boolean } = {}): Promise<{ rows: EvalRow[]; scorePct: number }> {
  if (!options.live) {
    delete process.env.OPENAI_API_KEY;
  }
  const { llmService } = await import('../src/services/llmService.js');
  const golden = loadGoldenSet();
  const rows: EvalRow[] = [];

  for (const [index, testCase] of golden.entries()) {
    const result = await llmService.parseTranscript({ transcript: testCase.transcript, language: 'ru' });
    const row = scoreCase(testCase, result.events);
    rows.push({ ...row, index: index + 1 });
  }

  const passed = rows.filter((row) => row.passed).length;
  const scorePct = Math.round((passed / rows.length) * 100);
  return { rows, scorePct };
}

function printRows(rows: EvalRow[], scorePct: number) {
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
  })));
  console.info(`[eval] score=${scorePct}%`);
}

async function main() {
  const live = process.argv.includes('--live');
  const result = await runEval({ live });
  printRows(result.rows, result.scorePct);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[eval] failed', err);
    process.exitCode = 1;
  });
}
