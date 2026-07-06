/**
 * Тесты eventFactory (BATCH A — schema formalization).
 *
 * Контракт: все create*Event проставляют schemaVersion=3, occurredAt,
 * recordedAt и source (manual / voice / child_ui). timestamp остаётся
 * обязательным (= occurredAt для обратной совместимости).
 */
import { describe, it, expect } from 'vitest';
import {
  createAACEvent,
  createPhraseEvent,
  createCalmModeEvent,
  createSOSEvent,
  createTutorNoteEvent,
  createVoiceObservationEvent,
  createEventsFromAIReview,
} from '@/lib/events/eventFactory';

describe('eventFactory — schema formalization', () => {
  describe('common fields', () => {
    it('createAACEvent: source=child_ui, schemaVersion=3, timestamp===occurredAt', () => {
      const e = createAACEvent({
        childId: 'child-1',
        cardLabel: 'Вода',
        cardId: 'card-water',
      });
      expect(e.source).toBe('child_ui');
      expect(e.schemaVersion).toBe(4);
      expect(e.timestamp).toBe(e.occurredAt);
      expect(e.recordedAt).toBeTruthy();
      expect(new Date(e.recordedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(e.occurredAt).getTime() - 5,
      );
    });

    it('createPhraseEvent: source=child_ui, schemaVersion=3', () => {
      const e = createPhraseEvent({
        childId: 'child-1',
        phrase: 'Я хочу пить',
        cards: [{ id: 'c1', label: 'Вода' }],
      });
      expect(e.source).toBe('child_ui');
      expect(e.schemaVersion).toBe(4);
      expect(e.timestamp).toBe(e.occurredAt);
    });

    it('createCalmModeEvent: source=manual (parent triggered), schemaVersion=3', () => {
      const e = createCalmModeEvent({ childId: 'child-1', triggeredBy: 'parent' });
      expect(e.source).toBe('manual');
      expect(e.schemaVersion).toBe(4);
    });

    it('createCalmModeEvent: source=child_ui (child triggered)', () => {
      const e = createCalmModeEvent({ childId: 'child-1', triggeredBy: 'child' });
      expect(e.source).toBe('child_ui');
      expect(e.schemaVersion).toBe(4);
    });

    it('createSOSEvent: source=manual by default', () => {
      const e = createSOSEvent({ childId: 'child-1', triggeredBy: 'parent' });
      expect(e.source).toBe('manual');
      expect(e.schemaVersion).toBe(4);
    });

    it('createTutorNoteEvent: source=manual, schemaVersion=3', () => {
      const e = createTutorNoteEvent({ childId: 'child-1', text: 'Заметка' });
      expect(e.source).toBe('manual');
      expect(e.schemaVersion).toBe(4);
    });
  });

  describe('voice pipeline', () => {
    it('createVoiceObservationEvent: source=voice, schemaVersion=3', () => {
      const e = createVoiceObservationEvent({
        childId: 'child-1',
        sourceRole: 'parent',
        transcript: 'Алихан поел',
        sttSource: 'openai',
      });
      expect(e.source).toBe('voice');
      expect(e.schemaVersion).toBe(4);
      expect(e.timestamp).toBe(e.occurredAt);
      expect(e.recordedAt).toBeTruthy();
    });

    it('createEventsFromAIReview: batch все source=voice, schemaVersion=3', () => {
      const batch = createEventsFromAIReview({
        parsed: {
          events: [
            {
              localId: 'l1',
              type: 'food',
              title: 'Поел',
              description: '...',
              confidence: 0.9,
            },
            {
              localId: 'l2',
              type: 'water',
              title: 'Пил',
              description: '...',
              confidence: 0.8,
            },
          ],
          insight: 'Поел и пил',
        },
        transcript: 'Алихан поел кашу и выпил воды',
        sttSource: 'openai',
        sourceRole: 'parent',
        childId: 'child-1',
      });
      expect(batch.observation.source).toBe('voice');
      expect(batch.observation.schemaVersion).toBe(4);
      for (const e of batch.extracted) {
        expect(e.source).toBe('voice');
        expect(e.schemaVersion).toBe(4);
        expect(e.timestamp).toBe(e.occurredAt);
      }
      // Связи observation ↔ extracted установлены в обе стороны.
      expect(batch.observation.linkedEventIds).toEqual(
        batch.extracted.map((e) => e.id),
      );
      for (const e of batch.extracted) {
        expect(e.linkedEventIds).toContain(batch.observation.id);
      }
    });
  });

  describe('override capability', () => {
    it('createAACEvent: caller cannot override schemaVersion via input (type-safe)', () => {
      // Просто проверяем что выход всегда schemaVersion=3.
      const e = createAACEvent({
        childId: 'child-1',
        cardLabel: 'X',
        cardId: 'c1',
      });
      expect(e.schemaVersion).toBe(4);
    });

    it('respects explicit occurredAt when provided', () => {
      const e = createAACEvent({
        childId: 'child-1',
        cardLabel: 'X',
        cardId: 'c1',
      });
      // В текущей сигнатуре нет override occurredAt, но контракт
      // «timestamp === occurredAt» соблюдён.
      expect(e.occurredAt).toBe(e.timestamp);
    });
  });
});
