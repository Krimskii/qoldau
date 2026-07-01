import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Utensils, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';

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

export const ClarifyingQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { answers, setAnswer, confirmAll } = useClarifyingStore();
  const { reset: resetVoiceObservation } = useVoiceObservationStore();

  const handleAnswer = (questionId: string, option: string) => {
    setAnswer(questionId, option);
  };

  const handleSave = () => {
    confirmAll();
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
        Сохранить ответы
      </Button>
    </div>
  );
};

// Local store for clarifying answers
interface ClarifyingState {
  answers: Record<string, string>;
  setAnswer: (questionId: string, answer: string) => void;
  confirmAll: () => void;
  resetAnswers: () => void;
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
  
  confirmAll: () => {
    // Answers are already in state, just confirm
    set((state) => ({
      answers: { ...state.answers },
    }));
  },
  
  resetAnswers: () => set({ answers: { ...defaultAnswers } }),
}));
