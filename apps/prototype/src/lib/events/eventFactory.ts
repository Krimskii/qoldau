/**
 * EventFactory — единая точка создания QoldauEvent из AI-разбора,
 * ручных вводов и детских действий.
 *
 * Все события проходят через этот модуль, чтобы:
 * - payload всегда содержал нужные поля (sttSource, aiInsight, confidence и т.д.);
 * - linkedEventIds связывали voice_observation с выделенными событиями;
 * - rawText сохранял оригинальный transcript;
 * - было легко добавить persistence / telemetry в одном месте.
 */

import { QoldauEvent, EventStatus, EventSource } from '@/types/qoldau';
import { AIParserResult, ClarificationQuestion, ParsedEvent } from '../ai/aiParser.types';
import { STTSource } from '../stt/sttClient.types';

const newId = (): string =>
  `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export interface CreateEventsFromAIReviewInput {
  /** Разобранный AI результат. */
  parsed: AIParserResult;
  /** Транскрипт, на котором основан разбор. */
  transcript: string;
  /** Отредактированный пользователем транскрипт (если был). */
  editedTranscript?: string;
  /** Оригинальный транскрипт до правок. */
  originalTranscript?: string;
  /** Источник STT. */
  sttSource: STTSource;
  /** Кто записал наблюдение. */
  sourceRole: 'parent' | 'tutor' | 'specialist';
  /** Какой ребёнок. */
  childId: string;
  /** Ответы на уточняющие вопросы (если были). */
  clarificationAnswers?: Record<string, string>;
  /** Статус событий по умолчанию. */
  status?: EventStatus;
}

export interface CreatedEventBatch {
  /** Главное событие — «наблюдение». */
  observation: QoldauEvent;
  /** Выделенные из транскрипта события. */
  extracted: QoldauEvent[];
}

/**
 * Создаёт батч событий из AI-разбора:
 * - 1 «главное» событие (voice_observation / tutor_note / specialist_note)
 * - N извлечённых событий (food, water, toilet и т.д.)
 * - все они связаны через linkedEventIds
 *
 * Если AI ничего не выделил, всё равно создаётся observation-событие
 * с пустым списком extracted.
 */
export function createEventsFromAIReview(
  input: CreateEventsFromAIReviewInput,
): CreatedEventBatch {
  const status: EventStatus = input.status ?? 'confirmed';
  const timestamp = new Date().toISOString();
  const finalTranscript = (input.editedTranscript ?? input.transcript).trim();

  const observationType =
    input.sourceRole === 'tutor'
      ? 'tutor_note'
      : input.sourceRole === 'specialist'
        ? 'specialist_note'
        : 'voice_observation';

  const extracted: QoldauEvent[] = input.parsed.events.map((p) =>
    makeEvent({
      childId: input.childId,
      type: p.type,
      title: p.title,
      description: p.description,
      timestamp: p.timestamp
        ? toIsoFromShortTime(p.timestamp, timestamp)
        : timestamp,
      sourceRole: input.sourceRole,
      // Voice pipeline — всегда source='voice'.
      source: 'voice',
      status,
      confidence: p.confidence,
      rawText: finalTranscript,
      linkedEventIds: [], // заполним после создания observation
      payload: {
        sttSource: input.sttSource,
        aiInsight: input.parsed.insight,
        aiLocalId: p.localId,
      },
    }),
  );

  const observation = makeEvent({
    childId: input.childId,
    type: observationType,
    title:
      input.sourceRole === 'tutor'
        ? 'Заметка тьютора'
        : input.sourceRole === 'specialist'
          ? 'Заметка специалиста'
          : 'Голосовое наблюдение',
    description: finalTranscript || 'Наблюдение без расшифровки',
    timestamp,
    sourceRole: input.sourceRole,
    // Voice pipeline — всегда source='voice'.
    source: 'voice',
    status,
    confidence: avgConfidence(input.parsed.events),
    rawText: finalTranscript,
    linkedEventIds: extracted.map((e) => e.id),
    payload: {
      source: 'voice_observation',
      sttSource: input.sttSource,
      aiInsight: input.parsed.insight,
      safetyDisclaimer: input.parsed.safetyDisclaimer,
      originalTranscript: input.originalTranscript ?? input.transcript,
      editedTranscript: input.editedTranscript,
      clarificationAnswers: input.clarificationAnswers ?? {},
      extractedLocalIds: input.parsed.events.map((p) => p.localId),
    },
  });

  // Прописываем обратную связь — extracted ссылаются на observation.
  const linkedBack = extracted.map((e) => ({
    ...e,
    linkedEventIds: [observation.id, ...(e.linkedEventIds ?? []).filter((id) => id !== observation.id)],
  }));

  return { observation, extracted: linkedBack };
}

/**
 * Главное событие наблюдения (без extracted) — для случая «AI ничего не нашёл».
 */
export function createVoiceObservationEvent(args: {
  childId: string;
  sourceRole: 'parent' | 'tutor' | 'specialist';
  transcript: string;
  editedTranscript?: string;
  originalTranscript?: string;
  sttSource: STTSource;
  aiInsight?: string;
  clarificationAnswers?: Record<string, string>;
  status?: EventStatus;
}): QoldauEvent {
  return makeEvent({
    childId: args.childId,
    type:
      args.sourceRole === 'tutor'
        ? 'tutor_note'
        : args.sourceRole === 'specialist'
          ? 'specialist_note'
          : 'voice_observation',
    title:
      args.sourceRole === 'tutor'
        ? 'Заметка тьютора'
        : args.sourceRole === 'specialist'
          ? 'Заметка специалиста'
          : 'Голосовое наблюдение',
    description: (args.editedTranscript ?? args.transcript) || 'Наблюдение без расшифровки',
    timestamp: new Date().toISOString(),
    sourceRole: args.sourceRole,
    // Voice pipeline — всегда source='voice'.
    source: 'voice',
    status: args.status ?? 'confirmed',
    confidence: 0.8,
    rawText: args.editedTranscript ?? args.transcript,
    linkedEventIds: [],
    payload: {
      source: 'voice_observation',
      sttSource: args.sttSource,
      aiInsight: args.aiInsight,
      safetyDisclaimer: 'Это наблюдение, не диагноз. Можно обсудить со специалистом.',
      originalTranscript: args.originalTranscript ?? args.transcript,
      editedTranscript: args.editedTranscript,
      clarificationAnswers: args.clarificationAnswers ?? {},
    },
  });
}

export function createTutorNoteEvent(args: {
  childId: string;
  text: string;
  clarificationAnswers?: Record<string, string>;
}): QoldauEvent {
  return makeEvent({
    childId: args.childId,
    type: 'tutor_note',
    title: 'Заметка тьютора',
    description: args.text,
    timestamp: new Date().toISOString(),
    sourceRole: 'tutor',
    status: 'confirmed',
    confidence: 1,
    rawText: args.text,
    linkedEventIds: [],
    payload: {
      source: 'tutor_note',
      sttSource: 'manual',
      clarificationAnswers: args.clarificationAnswers ?? {},
    },
  });
}

export function createAACEvent(args: {
  childId: string;
  cardLabel: string;
  cardId: string;
}): QoldauEvent {
  return makeEvent({
    childId: args.childId,
    type: 'aac_card',
    title: `AAC: ${args.cardLabel}`,
    description: `Ребёнок нажал карточку «${args.cardLabel}»`,
    timestamp: new Date().toISOString(),
    sourceRole: 'child',
    status: 'confirmed',
    confidence: 1,
    linkedEventIds: [],
    payload: {
      source: 'aac_card',
      cardId: args.cardId,
    },
  });
}

export function createPhraseEvent(args: {
  childId: string;
  phrase: string;
  cards: { id: string; label: string }[];
}): QoldauEvent {
  return makeEvent({
    childId: args.childId,
    type: 'phrase',
    title: 'Собранная фраза',
    description: args.phrase,
    timestamp: new Date().toISOString(),
    sourceRole: 'child',
    status: 'confirmed',
    confidence: 1,
    linkedEventIds: [],
    payload: {
      source: 'phrase_builder',
      cards: args.cards,
    },
  });
}

export function createCalmModeEvent(args: {
  childId: string;
  triggeredBy: 'child' | 'parent' | 'tutor';
}): QoldauEvent {
  return makeEvent({
    childId: args.childId,
    type: 'calm_mode',
    title: 'Режим спокойствия',
    description: 'Включён режим спокойствия',
    timestamp: new Date().toISOString(),
    sourceRole: args.triggeredBy,
    status: 'confirmed',
    confidence: 1,
    linkedEventIds: [],
    payload: { source: 'calm_mode' },
  });
}

export function createSOSEvent(args: {
  childId: string;
  triggeredBy: 'child' | 'parent' | 'tutor';
  note?: string;
}): QoldauEvent {
  return makeEvent({
    childId: args.childId,
    type: 'sos',
    title: 'SOS-сигнал',
    description: args.note ?? 'Срочный вызов помощи',
    timestamp: new Date().toISOString(),
    sourceRole: args.triggeredBy,
    status: 'confirmed',
    confidence: 1,
    linkedEventIds: [],
    payload: { source: 'sos' },
  });
}

// --- helpers ---

interface MakeEventInput {
  childId: string;
  type: QoldauEvent['type'];
  title: string;
  description: string;
  timestamp: string;
  sourceRole: QoldauEvent['sourceRole'];
  status: EventStatus;
  /**
   * Конвейер-источник события. v1.5+: если не передан,
   * выводится из sourceRole (child→child_ui, иначе→manual).
   */
  source?: EventSource;
  confidence?: number;
  rawText?: string;
  linkedEventIds: string[];
  payload: Record<string, unknown>;
  /** ABC (antecedent/behavior/consequence) — опционально. */
  abc?: QoldauEvent['abc'];
  /** Сенсорный контекст — массив меток (звук/свет/тач/…). */
  sensoryContext?: string[];
  /** AI-метаданные (если событие проходило через пайплайн). */
  ai?: QoldauEvent['ai'];
  /** Точное время события (по наблюдению). Если не передано — = timestamp. */
  occurredAt?: string;
}

function makeEvent(i: MakeEventInput): QoldauEvent {
  const recordedAt = new Date().toISOString();
  const occurredAt = i.occurredAt ?? i.timestamp;
  const source: EventSource =
    i.source ??
    (i.sourceRole === 'child'
      ? 'child_ui'
      : i.sourceRole === 'ai'
        ? 'voice'
        : 'manual');
  return {
    id: newId(),
    childId: i.childId,
    type: i.type,
    title: i.title,
    description: i.description,
    timestamp: i.timestamp,
    occurredAt,
    recordedAt,
    // v1.6 E9.3: updatedAt = recordedAt (новое событие = сейчас),
    // deletedAt = null. Это baseline для LWW при первом push.
    updatedAt: recordedAt,
    deletedAt: null,
    source,
    sourceRole: i.sourceRole,
    status: i.status,
    schemaVersion: 4,
    confidence: i.confidence,
    rawText: i.rawText,
    linkedEventIds: i.linkedEventIds,
    payload: i.payload,
    abc: i.abc,
    sensoryContext: i.sensoryContext,
    ai: i.ai,
  };
}

function avgConfidence(events: ParsedEvent[]): number {
  if (events.length === 0) return 0.8;
  const sum = events.reduce((acc, e) => acc + (e.confidence ?? 0), 0);
  return Math.round((sum / events.length) * 100) / 100;
}

/**
 * Конвертирует «HH:MM» в ISO-таймстемп текущего дня.
 * Если строка уже похожа на ISO — возвращает как есть.
 */
function toIsoFromShortTime(short: string, fallback: string): string {
  const m = short.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallback;
  const now = new Date();
  now.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return now.toISOString();
}

/** Утилита: вытащить clarificationAnswers из текущего стейта UI. */
export function answersToRecord(
  list: { question: ClarificationQuestion; answer: string }[],
): Record<string, string> {
  return list.reduce<Record<string, string>>((acc, item) => {
    acc[item.question.id] = item.answer;
    return acc;
  }, {});
}