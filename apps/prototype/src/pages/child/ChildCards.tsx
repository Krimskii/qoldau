import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { EventType } from '@/types/qoldau';

interface CardItem {
  id: string;
  label: string;
  emoji: string;
  type: EventType;
  description: string;
  color: string;
  border: string;
}

// 11 карточек как в референсе — крупные, с эмодзи и яркими фонами
const CARDS: CardItem[] = [
  { id: 'water', label: 'Вода', emoji: '💧', type: 'water', description: 'Ребёнок попросил воду', color: 'bg-[#E5F4FF]', border: 'border-[#cce6f7]' },
  { id: 'food', label: 'Еда', emoji: '🍎', type: 'food', description: 'Ребёнок попросил еду', color: 'bg-[#FFEDEA]', border: 'border-[#ffd9d3]' },
  { id: 'toilet', label: 'Туалет', emoji: '🚽', type: 'toilet', description: 'Ребёнок попросил в туалет', color: 'bg-[#F2ECFF]', border: 'border-[#e0d6f7]' },
  { id: 'pain', label: 'Больно', emoji: '😟', type: 'state', description: 'Ребёнку больно', color: 'bg-[#FFECEC]', border: 'border-[#ffd9d3]' },
  { id: 'tired', label: 'Устал', emoji: '😴', type: 'state', description: 'Ребёнок устал', color: 'bg-[#E5F4FF]', border: 'border-[#cce6f7]' },
  { id: 'home', label: 'Домой', emoji: '🏠', type: 'communication', description: 'Ребёнок хочет домой', color: 'bg-[#FFF3CE]', border: 'border-[#f7e5a3]' },
  { id: 'play', label: 'Играть', emoji: '🔺', type: 'communication', description: 'Ребёнок хочет играть', color: 'bg-[#E9F8F0]', border: 'border-[#ccebd9]' },
  { id: 'hug', label: 'Обниматься', emoji: '💗', type: 'state', description: 'Ребёнок хочет обниматься', color: 'bg-[#FFEDEA]', border: 'border-[#ffd9d3]' },
  { id: 'yes', label: 'Да', emoji: '👍', type: 'communication', description: 'Ребёнок согласился', color: 'bg-[#E9F8F0]', border: 'border-[#ccebd9]' },
  { id: 'no', label: 'Нет', emoji: '✕', type: 'communication', description: 'Ребёнок отказался', color: 'bg-[#FFECEC]', border: 'border-[#ffd9d3]' },
  { id: 'other', label: 'Другое', emoji: '•••', type: 'communication', description: 'Другое', color: 'bg-[#F3F6FA]', border: 'border-[#e1e7ee]' },
];

export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ label: string; emoji: string } | null>(null);
  const { addEvent } = useEventStore();

  const handleSelect = (card: CardItem) => {
    setSelected(card.id);

    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: card.type,
      title: card.label,
      description: card.description,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { cardId: card.id, emoji: card.emoji, source: 'aac_card' },
    });

    setFeedback({ label: card.label, emoji: card.emoji });

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <h2 className="text-lg font-black text-[#143259]">Быстрые карточки</h2>
        <button
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Настройки"
        >
          <span className="text-2xl text-[#53677e]">⚙</span>
        </button>
      </div>

      {/* 4 колонки × 3 строки, крупные иллюстрированные карточки */}
      <div className="grid grid-cols-4 gap-3">
        {CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => handleSelect(card)}
            className={`min-h-[110px] rounded-2xl ${card.color} border ${card.border} flex flex-col items-center justify-center gap-2 p-2 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.05)] hover:scale-[0.97] active:scale-[0.94] transition-transform ${
              selected === card.id ? 'scale-95 opacity-80' : ''
            }`}
            aria-label={`Нажать карточку ${card.label}`}
          >
            <span className="text-4xl leading-none" aria-hidden="true">
              {card.emoji}
            </span>
            {card.label}
          </button>
        ))}
      </div>

      {/* In-app Feedback */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-teal to-teal-dark text-white text-center py-5 px-4 rounded-2xl font-black text-lg shadow-card animate-fade-in"
        >
          <div className="text-3xl mb-1" aria-hidden="true">{feedback.emoji}</div>
          ✓ Я сказал: {feedback.label}
          <div className="text-xs font-normal opacity-90 mt-1">Мама получила уведомление</div>
        </div>
      )}
    </div>
  );
};