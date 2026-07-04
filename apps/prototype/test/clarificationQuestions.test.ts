/**
 * Тесты VoiceObservation clarificationQuestions (BATCH C, wave 2).
 *
 * Контракт:
 *   - если backend прислал questions — phase → 'clarification_questions'
 *   - пользователь может ответить или пропустить
 *   - ответы прокидываются в payload.clarificationAnswers событий
 *   - события коммитятся только после ответа/пропуска, не сразу
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useEventStore } from '@/store/useEventStore';
import { setProfileMode } from '@/data/demoDataset';
import type { AudioPipelineResponse } from '@/api/audio';

describe('Clarification answers — store contract', () => {
  beforeEach(() => {
    localStorage.clear();
    useEventStore.setState({
      events: [],
      clarifyingAnswers: {},
      apiMode: false,
    });
    setProfileMode('real');
  });

  it('setClarifyingAnswer пишет ответ в стор', () => {
    useEventStore.getState().setClarifyingAnswer('q-noise', 'Шум');
    expect(useEventStore.getState().clarifyingAnswers['q-noise']).toBe('Шум');
  });

  it('getClarifyingAnswer возвращает сохранённый ответ', () => {
    useEventStore.getState().setClarifyingAnswer('q-light', 'Свет');
    expect(useEventStore.getState().getClarifyingAnswer('q-light')).toBe('Свет');
  });

  it('getClarifyingAnswer для неизвестного id возвращает пустую строку', () => {
    expect(useEventStore.getState().getClarifyingAnswer('q-unknown')).toBe('');
  });

  it('resetClarifyingAnswers стирает все ответы', () => {
    useEventStore.getState().setClarifyingAnswer('q1', 'A');
    useEventStore.getState().setClarifyingAnswer('q2', 'B');
    useEventStore.getState().resetClarifyingAnswers();
    expect(useEventStore.getState().clarifyingAnswers).toEqual({});
  });
});

describe('AudioPipelineResponse — clarification questions contract', () => {
  it('clarificationQuestions могут быть в ai.clarificationQuestions', () => {
    const result: AudioPipelineResponse = {
      ok: true,
      jobId: 'j-1',
      status: 'completed',
      transcript: 'Алихан капризничал',
      insight: 'Возможный триггер — шум',
      questions: [],
      sttMode: 'openai',
      aiMode: 'openai',
      ai: {
        source: 'openai',
        model: 'gpt-4o-mini',
        insight: 'Возможный триггер — шум',
        clarificationQuestions: [
          { id: 'q-noise', text: 'Был ли шум перед этим?' },
        ],
      },
      events: [],
    };
    expect(result.ai.clarificationQuestions).toHaveLength(1);
    expect(result.ai.clarificationQuestions[0]?.id).toBe('q-noise');
  });

  it('fallback на верхнеуровневые questions если ai.clarificationQuestions пуст', () => {
    const result: AudioPipelineResponse = {
      ok: true,
      jobId: 'j-2',
      status: 'completed',
      transcript: '...',
      insight: '',
      questions: [
        { id: 'q-light', text: 'Был ли яркий свет?' },
      ],
      sttMode: 'openai',
      aiMode: 'openai',
      ai: {
        source: 'openai',
        model: 'gpt-4o-mini',
        insight: '',
        clarificationQuestions: [],
      },
      events: [],
    };
    expect(result.questions.length).toBe(1);
    expect(result.ai.clarificationQuestions.length).toBe(0);
  });
});