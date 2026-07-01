import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { EventType } from '@/types/qoldau';

const cards = [
  { id: 'water', label: 'Вода', emoji: '💧', color: 'bg-[#e5f4ff]', eventType: 'water' as EventType, description: 'Попросил воду' },
  { id: 'food', label: 'Еда', emoji: '🍎', color: 'bg-[#e8faef]', eventType: 'food' as EventType, description: 'Попросил еду' },
  { id: 'toilet', label: 'Туалет', emoji: '🚽', color: 'bg-[#f2ecff]', eventType: 'toilet' as EventType, description: 'Попросил в туалет' },
  { id: 'pain', label: 'Больно', emoji: '😟', color: 'bg-[#ffecec]', eventType: 'behavior' as EventType, description: 'Сказал что болит' },
  { id: 'tired', label: 'Устал', emoji: '😴', color: 'bg-[#e5f4ff]', eventType: 'state' as EventType, description: 'Сказал что устал' },
  { id: 'home', label: 'Домой', emoji: '🏠', color: 'bg-[#fff2d7]', eventType: 'communication' as EventType, description: 'Хочет домой' },
  { id: 'play', label: 'Играть', emoji: '🔺', color: 'bg-[#e8faef]', eventType: 'communication' as EventType, description: 'Хочет играть' },
  { id: 'hug', label: 'Обниматься', emoji: '💗', color: 'bg-[#ffecec]', eventType: 'state' as EventType, description: 'Хочет обниматься' },
  { id: 'yes', label: 'Да', emoji: '👍', color: 'bg-[#e8faef]', eventType: 'communication' as EventType, description: 'Согласился' },
  { id: 'no', label: 'Нет', emoji: '✕', color: 'bg-[#ffecec]', eventType: 'communication' as EventType, description: 'Отказался', span: true },
  { id: 'other', label: 'Другое', emoji: '•••', color: 'bg-[#f3f6fa]', eventType: 'communication' as EventType, description: 'Другое' },
];

export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ card: string; label: string } | null>(null);
  const { addEvent } = useEventStore();

  const handleSelect = (id: string, label: string, eventType: EventType, description: string) => {
    setSelected(id);
    
    // Create event in EventStore
    addEvent({
      childId: 'child-1',
      type: eventType,
      title: label,
      description: description,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
    });

    // Show feedback
    setFeedback({ card: id, label });
    
    // Clear feedback after delay
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/child/home')} className="text-3xl font-black text-[#203a60]">‹</button>
        <h2 className="text-lg font-black text-[#143259]">Быстрые карточки</h2>
        <div className="w-8" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleSelect(card.id, card.label, card.eventType, card.description)}
            className={`min-h-[95px] rounded-xl border border-[rgba(60,106,151,0.15)] ${card.color} ${card.span ? 'col-span-2' : ''} flex flex-col items-center justify-center gap-2 p-2 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px_rgba(42,73,108,0.05)] transition-all ${selected === card.id ? 'scale-95 opacity-80' : ''}`}
          >
            <span className="text-3xl leading-none">{card.emoji}</span>
            {card.label}
          </button>
        ))}
      </div>

      {/* In-app Feedback */}
      {feedback && (
        <div className="fixed bottom-24 left-4 right-4 bg-teal text-white text-center py-4 rounded-xl font-bold text-lg animate-pulse">
          ✓ Я сказал: {feedback.label}
          <br />
          <span className="text-sm font-normal">Мама получила уведомление</span>
        </div>
      )}
    </div>
  );
};
