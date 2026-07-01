import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface ChoiceOption {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  border: string;
}

const OPTIONS: ChoiceOption[] = [
  { id: 'banana', label: 'Банан', emoji: '🍌', bg: 'bg-gradient-to-br from-[#FFF8E5] to-[#FFEAB8]', border: 'border-[#F7E5A3]' },
  { id: 'soup', label: 'Суп', emoji: '🍲', bg: 'bg-gradient-to-br from-[#FFEDEA] to-[#FFD9D3]', border: 'border-[#FFBFB6]' },
  { id: 'ball', label: 'Мяч', emoji: '⚽', bg: 'bg-gradient-to-br from-[#E8F4FF] to-[#CCE6F7]', border: 'border-[#A8D0F0]' },
  { id: 'car', label: 'Машинка', emoji: '🚗', bg: 'bg-gradient-to-br from-[#FFEDEA] to-[#FFC2BC]', border: 'border-[#FF9D94]' },
];

export const ChildChoice: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addEvent } = useEventStore();

  const handleSelect = (option: ChoiceOption) => {
    setSelected(option.id);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'communication',
      title: `Выбор: ${option.label}`,
      description: `Ребёнок выбрал «${option.label}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { choiceId: option.id, label: option.label, source: 'choice_screen' },
    });
    setFeedback(option.label);
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <button
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Закрыть"
        >
          <span className="text-2xl text-[#53677e]">✕</span>
        </button>
      </div>

      {/* Заголовок */}
      <h2 className="text-2xl font-black text-center text-ink mb-2">Что ты хочешь?</h2>

      {/* 2×2 крупных варианта */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            aria-label={`Выбрать ${option.label}`}
            className={`min-h-[160px] rounded-3xl border-2 ${option.border} ${option.bg} flex flex-col items-center justify-center gap-2 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_rgba(42,73,108,0.06)] hover:scale-[0.97] active:scale-[0.94] transition-transform ${
              selected === option.id ? 'scale-95 opacity-80' : ''
            }`}
          >
            <span className="text-7xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="text-xl font-black text-ink">{option.label}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-teal to-teal-dark text-white text-center py-5 px-4 rounded-2xl font-black text-lg shadow-card animate-fade-in"
        >
          ✓ Мама увидит выбор
          <div className="text-sm font-normal opacity-90 mt-1">Ребёнок выбрал «{feedback}»</div>
        </div>
      )}
    </div>
  );
};