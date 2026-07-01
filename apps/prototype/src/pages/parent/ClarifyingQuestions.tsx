import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Utensils, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';
import { useEventStore } from '@/store/useEventStore';
import { EventType } from '@/types/qoldau';

const questions = [
  {
    id: 'water-amount',
    icon: Droplet,
    color: 'blue',
    question: 'Сколько воды выпил?',
    options: ['Мало', 'Нормально', 'Много', 'Не знаю'],
    defaultSelected: 'Нормально',
  },
  {
    id: 'toilet-better',
    icon: Utensils,
    color: 'blue',
    question: 'После туалета стало легче?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultSelected: 'Да',
  },
  {
    id: 'noise-around',
    icon: Brain,
    color: 'purple',
    question: 'Был ли шум вокруг?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultSelected: 'Да',
  },
];

// Map AI-parsed event types to QoldauEvent types
const EVENT_TYPE_MAP: Record<string, EventType> = {
  food: 'food',
  toilet: 'toilet',
  behavior: 'behavior',
  communication: 'communication',
  water: 'water',
  sensory: 'sensory',
  state: 'state',
};

/**
 * ClarifyingQuestions is the SINGLE place where confirmed QoldauEvents are
 * created from a voice observation.
 *
 * It pulls:
 *   - transcript from useVoiceObservationStore
 *   - parsedObservation.events from useVoiceObservationStore
 *   - clarifying answers from useClarifyingStore
 *
 * It writes:
 *   - status: 'confirmed' on every created event
 *   - rawText: <transcript> (the original phrase)
 *   - linkedEventIds: all created events are linked to each other
 *   - payload.clarifyingAnswers + payload.aiInsight + payload.source = 'voice_observation'
 */
export const ClarifyingQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { answers, setAnswer } = useClarifyingStore();
  const {
    transcript,
    parsedObservation,
    reset: resetVoiceObservation,
  } = useVoiceObservationStore();
  const { addEvents } = useEventStore();

  const handleAnswer = (questionId: string, option: string) => {
    setAnswer(questionId, option);
  };

  const handleSave = () => {
    const parsed = parsedObservation?.events ?? [];

    // If no parsed events (e.g. user skipped AI), create a single voice observation
    const eventData =
      parsed.length > 0
        ? parsed.map((event) => ({
            childId: 'child-1',
            type: EVENT_TYPE_MAP[event.type] || 'voice_observation',
            title: event.title,
            description: event.description,
            timestamp: new Date().toISOString(),
            sourceRole: 'parent' as const,
            status: 'confirmed' as const,
            confidence: event.confidence,
            rawText: transcript,
            linkedEventIds: [], // filled below
            payload: {
              clarifyingAnswers: { ...answers },
              aiInsight: parsedObservation?.insight ?? '',
              source: 'voice_observation',
            },
          }))
        : [
            {
              childId: 'child-1',
              type: 'voice_observation' as const,
              title: 'Голосовое наблюдение',
              description: transcript || 'Наблюдение без расшифровки',
              timestamp: new Date().toISOString(),
              sourceRole: 'parent' as const,
              status: 'confirmed' as const,
              rawText: transcript,
              linkedEventIds: [],
              payload: {
                clarifyingAnswers: { ...answers },
                aiInsight: parsedObservation?.insight ?? '',
                source: 'voice_observation',
              },
            },
          ];

    const created = addEvents(eventData);

    // Link the created events to each other
    const linkedIds = created.map((e) => e.id);
    created.forEach((event) => {
      useEventStore.getState().updateEvent(event.id, {
        linkedEventIds: linkedIds.filter((id) => id !== event.id),
      });
    });

    // Only reset voice store AFTER events are created
    resetVoiceObservation();

    navigate('/parent/events');
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Уточним детали"
        subtitle="Ответьте, если помните"
        showBack
      />

      {questions.map((q) => {
        const Icon = q.icon;
        const selected = answers[q.id] || q.defaultSelected;

        return (
          <div key={q.id} className="bg-white border border-line rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3 font-bold text-sm">
              <Icon className="w-4 h-4 text-blue" />
              {q.question}
            </div>
            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(q.id, option)}
                  className={`border rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                    selected === option
                      ? 'border-teal bg-teal-soft text-teal-dark'
                      : 'border-line bg-white text-ink-2 hover:border-teal'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <AIInsightCard text="Я не додумываю недостающие детали — лучше задать короткий вопрос и сохранить только подтверждённое." />

      <Button onClick={handleSave} className="mt-auto">
        Сохранить и подтвердить
      </Button>
    </div>
  );
};

// Local store for clarifying answers
interface ClarifyingState {
  answers: Record<string, string>;
  setAnswer: (questionId: string, answer: string) => void;
}

import { create } from 'zustand';

const defaultAnswers: Record<string, string> = {
  'water-amount': 'Нормально',
  'toilet-better': 'Да',
  'noise-around': 'Да',
};

export const useClarifyingStore = create<ClarifyingState>((set) => ({
  answers: { ...defaultAnswers },
  
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
}));