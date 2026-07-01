import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Utensils, Volume2, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';
import { useEventStore } from '@/store/useEventStore';
import { EventType } from '@/types/qoldau';

const questions = [
  {
    id: 'water-amount',
    icon: Droplet,
    color: 'blue' as const,
    question: 'Сколько воды выпил?',
    options: ['Мало', 'Нормально', 'Много', 'Не знаю'],
    defaultSelected: 'Нормально',
  },
  {
    id: 'toilet-better',
    icon: Utensils,
    color: 'green' as const,
    question: 'После туалета стало легче?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultSelected: 'Да',
  },
  {
    id: 'noise-around',
    icon: Volume2,
    color: 'yellow' as const,
    question: 'Был ли шум вокруг?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultSelected: 'Да',
  },
];

const EVENT_TYPE_MAP: Record<string, EventType> = {
  food: 'food',
  toilet: 'toilet',
  behavior: 'behavior',
  communication: 'communication',
  water: 'water',
  sensory: 'sensory',
  state: 'state',
};

export const ClarifyingQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { answers, setAnswer } = useClarifyingStore();
  const { transcript, parsedObservation, reset: resetVoiceObservation } =
    useVoiceObservationStore();
  const { addEvents } = useEventStore();

  const handleAnswer = (questionId: string, option: string) =>
    setAnswer(questionId, option);

  const handleSave = () => {
    const parsed = parsedObservation?.events ?? [];

    const eventData =
      parsed.length > 0
        ? parsed.map((event) => ({
            childId: 'child-alikhan',
            type: EVENT_TYPE_MAP[event.type] || 'voice_observation',
            title: event.title,
            description: event.description,
            timestamp: new Date().toISOString(),
            sourceRole: 'parent' as const,
            status: 'confirmed' as const,
            confidence: event.confidence,
            rawText: transcript,
            linkedEventIds: [],
            payload: {
              clarifyingAnswers: { ...answers },
              aiInsight: parsedObservation?.insight ?? '',
              source: 'voice_observation',
            },
          }))
        : [
            {
              childId: 'child-alikhan',
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

    const linkedIds = created.map((e) => e.id);
    created.forEach((event) => {
      useEventStore.getState().updateEvent(event.id, {
        linkedEventIds: linkedIds.filter((id) => id !== event.id),
      });
    });

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

        const variantMap = {
          blue: 'tinted-blue',
          green: 'tinted-green',
          yellow: 'tinted-yellow',
          purple: 'tinted-purple',
        } as const;

        return (
          <Card key={q.id} variant={variantMap[q.color]}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-card-soft">
                <Icon className="w-5 h-5 text-ink" />
              </div>
              <p className="text-sm font-black text-ink flex-1">{q.question}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(q.id, option)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    selected === option
                      ? 'bg-teal text-white border-teal shadow-card-soft'
                      : 'bg-white border-line text-ink-2 hover:border-teal hover:text-teal-dark'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Card>
        );
      })}

      <AIInsightCard
        text="Лучше задать короткий вопрос и сохранить только подтверждённое наблюдение."
        variant="default"
        title="Подсказка"
      />

      <Button
        block
        size="lg"
        onClick={handleSave}
        iconRight={<ArrowRight className="w-4 h-4" />}
      >
        Сохранить и подтвердить
      </Button>
    </div>
  );
};

// Local store
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