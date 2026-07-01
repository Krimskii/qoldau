/**
 * POST /api/ai/parse — mock AI parser (v0.4.0).
 *
 * Phase 1: keyword-matching по русскому тексту (портирован из
 * `apps/prototype/src/lib/ai/aiParser.mock.ts`).
 * Phase 2: заменяется на LLM (Claude/GPT-4) function calling.
 *
 * Body: { transcript: string, childId?: string }
 * Response: { ok, events: [...], insight: string, clarificationQuestions: [...] }
 */
import { Router } from 'express';

export const aiRouter = Router();

interface ParsedEvent {
  timestamp: string;
  title: string;
  description: string;
  type: string;
}

interface ClarificationQuestion {
  id: string;
  question: string;
  options: string[];
}

interface ParseResult {
  events: ParsedEvent[];
  insight: string;
  clarificationQuestions: ClarificationQuestion[];
}

/** Keyword-matching (портирован из `aiParser.mock.ts`). */
function parseTranscript(transcript: string): ParseResult {
  const text = transcript.toLowerCase();
  const events: ParsedEvent[] = [];

  // Извлекаем время из транскрипта (HH:MM) или используем текущее
  const timeMatches = transcript.match(/\b(\d{1,2}):(\d{2})\b/g);
  const nextTime = () => {
    const t = new Date();
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  };
  const findTime = (idx: number) => {
    if (timeMatches && timeMatches[idx]) return timeMatches[idx];
    return nextTime();
  };

  if (text.includes('поел') || text.includes('каш') || text.includes('суп') || text.includes('еда')) {
    events.push({
      timestamp: findTime(0),
      title: 'Поел',
      description: 'Приём пищи зафиксирован по транскрипту',
      type: 'food',
    });
  }
  if (text.includes('пил') || text.includes('вода') || text.includes('выпил')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Выпил воду',
      description: 'Приём жидкости',
      type: 'water',
    });
  }
  if (text.includes('туалет') || text.includes('горшок') || text.includes('ту-ту')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Туалет',
      description: 'Сигнал о туалете',
      type: 'toilet',
    });
  }
  if (text.includes('закрывал уши') || text.includes('шум') || text.includes('громко')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Закрывал уши',
      description: 'Сенсорная реакция на шум',
      type: 'sensory',
    });
  }
  if (text.includes('сказал') || text.includes('произнес')) {
    events.push({
      timestamp: findTime(events.length),
      title: 'Коммуникация',
      description: 'Ребёнок произнёс звук/слово',
      type: 'communication',
    });
  }

  const insight =
    events.length > 0
      ? `Похоже, в наблюдении ${events.length} ${events.length === 1 ? 'событие' : 'событий'}. Это гипотеза, не диагноз. Можно обсудить со специалистом.`
      : 'Не удалось выделить события. Это наблюдение, не диагноз.';

  const clarificationQuestions: ClarificationQuestion[] = [
    {
      id: 'water-amount',
      question: 'Сколько воды выпил?',
      options: ['Мало', 'Нормально', 'Много', 'Не знаю'],
    },
    {
      id: 'mood-after',
      question: 'Каким было настроение после?',
      options: ['Спокойное', 'Возбуждённое', 'Плакал', 'Не заметил(а)'],
    },
  ];

  return { events, insight, clarificationQuestions };
}

aiRouter.post('/parse', async (req, res) => {
  const { transcript } = req.body as { transcript?: string };
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Missing required field: transcript',
    });
  }
  // Имитация AI-обработки
  await new Promise((r) => setTimeout(r, 1200));
  const result = parseTranscript(transcript);
  res.json({ ok: true, ...result, aiSource: 'mock' });
});

aiRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ai',
    mode: 'mock',
    model: 'keyword-matcher-v1',
    phase: 1,
  });
});