import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Utensils, Volume2, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import {
  createEventsFromAIReview,
} from '@/lib/events/eventFactory';
import { DEMO_PRIMARY_CHILD_ID } from '@/data/demoDataset';

// --- Clarifying store — локальный стейт UI для экрана уточнений ---

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

// --- Уточняющие вопросы ---
// В будущем список должен приходить из AIParserResult.clarificationQuestions
// (тогда UI будет рендерить динамически). Пока используем фиксированный набор
// под демо-транскрипт для обратной совместимости.

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

export const ClarifyingQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { answers, setAnswer } = useClarifyingStore();
  const {
    currentTranscript,
    originalTranscript,
    editedTranscript,
    parsedObservation,
    sttSource,
    childId,
    reset: resetVoiceObservation,
  } = useVoiceObservationStore();
  const { addEvents } = useEventStore();
  const { showToast } = useToastStore();

  const handleSave = () => {
    if (!parsedObservation) {
      showToast('Нет данных для сохранения', 'error');
      navigate('/parent/events');
      return;
    }

    // Используем EventFactory — единая точка создания событий.
    // В payload попадают originalTranscript и editedTranscript (если был изменён).
    const batch = createEventsFromAIReview({
      parsed: parsedObservation,
      transcript: originalTranscript || currentTranscript,
      editedTranscript:
        editedTranscript && editedTranscript !== originalTranscript
          ? editedTranscript
          : undefined,
      originalTranscript,
      sttSource,
      sourceRole: 'parent',
      childId: childId || DEMO_PRIMARY_CHILD_ID,
      clarificationAnswers: { ...answers },
      status: 'confirmed',
    });

    // Сохраняем batch: сначала все extracted, потом observation (последним — он связан с ними).
    addEvents([...batch.extracted, batch.observation]);

    showToast('События сохранены в Event Timeline', 'success');
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
                  onClick={() => setAnswer(q.id, option)}
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
        text="Лучше задать короткий вопрос и сохранить только подтверждённое наблюдение. Это наблюдение, не диагноз."
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