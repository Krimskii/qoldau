import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Utensils, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';

const questions = [
  {
    icon: Droplet,
    color: 'blue',
    question: 'Сколько воды выпил?',
    options: ['Мало', 'Нормально', 'Много', 'Не знаю'],
    defaultSelected: 'Нормально',
  },
  {
    icon: Utensils,
    color: 'blue',
    question: 'После туалета стало легче?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultSelected: 'Да',
  },
  {
    icon: Brain,
    color: 'purple',
    question: 'Был ли шум вокруг?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultSelected: 'Да',
  },
];

export const ClarifyingQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (qIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Уточним детали"
        subtitle="Ответьте, если помните"
        showBack
      />

      {questions.map((q, qIndex) => {
        const Icon = q.icon;
        const selected = answers[qIndex] || q.defaultSelected;

        return (
          <div key={qIndex} className="bg-white border border-line rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3 font-bold text-sm">
              <Icon className="w-4 h-4 text-blue" />
              {q.question}
            </div>
            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(qIndex, option)}
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

      <Button onClick={() => navigate('/parent/events')} className="mt-auto">
        Сохранить ответы
      </Button>
    </div>
  );
};
