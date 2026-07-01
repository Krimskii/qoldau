import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { EventType } from '@/types/qoldau';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import {
  WaterIcon,
  FoodIcon,
  ToiletIcon,
  SadIcon,
  TiredIcon,
  HomeIcon,
  PlayIcon,
  HugIcon,
  YesIcon,
  NoIcon,
  OtherIcon,
  type IconProps,
} from '@/components/icons';

interface CardItem {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  iconColor: string;
  type: EventType;
  description: string;
  bg: string;
  border: string;
}

// 11 AAC-карточек — flat SVG-иконки вместо эмодзи.
const CARDS: CardItem[] = [
  { id: 'water', label: 'Вода', Icon: WaterIcon, iconColor: 'text-[#1c6cb8]', type: 'water', description: 'Ребёнок попросил воду', bg: 'bg-[#EAF5FF]', border: 'border-[#cce6f7]' },
  { id: 'food', label: 'Еда', Icon: FoodIcon, iconColor: 'text-[#cc251d]', type: 'food', description: 'Ребёнок попросил еду', bg: 'bg-[#FFEAEA]', border: 'border-[#ffd9d3]' },
  { id: 'toilet', label: 'Туалет', Icon: ToiletIcon, iconColor: 'text-[#5a3eb4]', type: 'toilet', description: 'Ребёнок попросил в туалет', bg: 'bg-[#F1EDFF]', border: 'border-[#e0d6f7]' },
  { id: 'pain', label: 'Больно', Icon: SadIcon, iconColor: 'text-[#cc251d]', type: 'state', description: 'Ребёнку больно', bg: 'bg-[#FFEAEA]', border: 'border-[#ffd9d3]' },
  { id: 'tired', label: 'Устал', Icon: TiredIcon, iconColor: 'text-[#1c6cb8]', type: 'state', description: 'Ребёнок устал', bg: 'bg-[#EAF5FF]', border: 'border-[#cce6f7]' },
  { id: 'home', label: 'Домой', Icon: HomeIcon, iconColor: 'text-[#9a7820]', type: 'communication', description: 'Ребёнок хочет домой', bg: 'bg-[#FFF6DF]', border: 'border-[#f0e2a7]' },
  { id: 'play', label: 'Играть', Icon: PlayIcon, iconColor: 'text-[#158647]', type: 'communication', description: 'Ребёнок хочет играть', bg: 'bg-[#EAF8F0]', border: 'border-[#ccebd9]' },
  { id: 'hug', label: 'Обниматься', Icon: HugIcon, iconColor: 'text-[#cc251d]', type: 'state', description: 'Ребёнок хочет обниматься', bg: 'bg-[#FFEAEA]', border: 'border-[#ffd9d3]' },
  { id: 'yes', label: 'Да', Icon: YesIcon, iconColor: 'text-[#158647]', type: 'communication', description: 'Ребёнок согласился', bg: 'bg-[#EAF8F0]', border: 'border-[#ccebd9]' },
  { id: 'no', label: 'Нет', Icon: NoIcon, iconColor: 'text-[#cc251d]', type: 'communication', description: 'Ребёнок отказался', bg: 'bg-[#FFEAEA]', border: 'border-[#ffd9d3]' },
  { id: 'other', label: 'Другое', Icon: OtherIcon, iconColor: 'text-[#53677e]', type: 'communication', description: 'Другое', bg: 'bg-[#F3F6FA]', border: 'border-[#e1e7ee]' },
];

export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ label: string; Icon: React.FC<IconProps>; iconColor: string } | null>(null);
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
      payload: { cardId: card.id, source: 'aac_card' },
    });

    setFeedback({ label: card.label, Icon: card.Icon, iconColor: card.iconColor });

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
    }, 1600);
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

      {/* 4 колонки × 3 строки, flat SVG-иконки */}
      <div className="grid grid-cols-4 gap-3">
        {CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => handleSelect(card)}
            className={`min-h-[110px] rounded-2xl ${card.bg} border ${card.border} flex flex-col items-center justify-center gap-2 p-2 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.05)] transition-transform duration-200 ease-out active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${
              selected === card.id ? 'scale-95 opacity-80' : ''
            }`}
            aria-label={`Нажать карточку ${card.label}`}
          >
            <card.Icon size={40} className={card.iconColor} />
            {card.label}
          </button>
        ))}
      </div>

      {/* Success feedback — мягкая success-карточка (НЕ alert) */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm"
        >
          <div className="bg-white border-2 border-[#DDF5F0] rounded-3xl px-6 py-5 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <SuccessSparkle className="w-16 h-16" />
            </div>
            <div className="flex items-center justify-center gap-2 text-base font-black text-ink">
              <feedback.Icon size={24} className={feedback.iconColor} />
              Я сказал: {feedback.label}
            </div>
            <p className="text-xs text-muted mt-1.5 leading-snug">
              Мама увидит запрос · Событие сохранено
            </p>
          </div>
        </div>
      )}
    </div>
  );
};