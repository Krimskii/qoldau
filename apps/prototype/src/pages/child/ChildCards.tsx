import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const cards = [
  { id: 'water', label: 'Вода', emoji: '💧', color: 'bg-[#e5f4ff]' },
  { id: 'food', label: 'Еда', emoji: '🍎', color: 'bg-[#e8faef]' },
  { id: 'toilet', label: 'Туалет', emoji: '🚽', color: 'bg-[#f2ecff]' },
  { id: 'pain', label: 'Больно', emoji: '😟', color: 'bg-[#ffecec]' },
  { id: 'tired', label: 'Устал', emoji: '😴', color: 'bg-[#e5f4ff]' },
  { id: 'home', label: 'Домой', emoji: '🏠', color: 'bg-[#fff2d7]' },
  { id: 'play', label: 'Играть', emoji: '🔺', color: 'bg-[#e8faef]' },
  { id: 'hug', label: 'Обниматься', emoji: '💗', color: 'bg-[#ffecec]' },
  { id: 'yes', label: 'Да', emoji: '👍', color: 'bg-[#e8faef]' },
  { id: 'no', label: 'Нет', emoji: '✕', color: 'bg-[#ffecec]', span: true },
  { id: 'other', label: 'Другое', emoji: '•••', color: 'bg-[#f3f6fa]' },
];

export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<string | null>(null);

  const handleSelect = (id: string, label: string) => {
    setSelected(id);
    // Show feedback after selection
    setTimeout(() => {
      alert(`Я сказал: ${label}\nМама получила уведомление`);
      setSelected(null);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/child/home')} className="text-3xl font-black text-[#203a60]">‹</button>
        <h2 className="text-lg font-black text-[#143259]">Быстрые карточки</h2>
        <div className="w-8" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleSelect(card.id, card.label)}
            className={`min-h-[95px] rounded-xl border border-[rgba(60,106,151,0.15)] ${card.color} ${card.span ? 'col-span-2' : ''} flex flex-col items-center justify-center gap-2 p-2 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px_rgba(42,73,108,0.05)] transition-all ${selected === card.id ? 'scale-95' : ''}`}
          >
            <span className="text-3xl leading-none">{card.emoji}</span>
            {card.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed bottom-24 left-4 right-4 bg-teal text-white text-center py-3 rounded-xl font-bold">
          Я сказал: {cards.find((c) => c.id === selected)?.label}
        </div>
      )}
    </div>
  );
};
