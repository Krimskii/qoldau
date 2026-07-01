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
  NoIcon,
  HelpIcon,
  PauseIcon,
  type IconProps,
} from '@/components/icons';
import {
  QoldauIconCard,
  type QoldauIconColor,
} from '@/components/ui/QoldauIconCard';

interface CardItem {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  color: QoldauIconColor;
  type: EventType;
  description: string;
}

// 11 AAC-карточек — через QoldauIconCard для единого стиля.
const CARDS: CardItem[] = [
  { id: 'water', label: 'Вода', Icon: WaterIcon, color: 'blue', type: 'water', description: 'Ребёнок попросил воду' },
  { id: 'food', label: 'Еда', Icon: FoodIcon, color: 'coral', type: 'food', description: 'Ребёнок попросил еду' },
  { id: 'toilet', label: 'Туалет', Icon: ToiletIcon, color: 'purple', type: 'toilet', description: 'Ребёнок попросил в туалет' },
  { id: 'pain', label: 'Больно', Icon: SadIcon, color: 'coral', type: 'state', description: 'Ребёнку больно' },
  { id: 'tired', label: 'Устал', Icon: TiredIcon, color: 'blue', type: 'state', description: 'Ребёнок устал' },
  { id: 'home', label: 'Домой', Icon: HomeIcon, color: 'yellow', type: 'communication', description: 'Ребёнок хочет домой' },
  { id: 'play', label: 'Играть', Icon: PlayIcon, color: 'green', type: 'communication', description: 'Ребёнок хочет играть' },
  { id: 'hug', label: 'Обниматься', Icon: HugIcon, color: 'coral', type: 'state', description: 'Ребёнок хочет обниматься' },
  { id: 'help', label: 'Помощь', Icon: HelpIcon, color: 'green', type: 'communication', description: 'Ребёнок просит помощь' },
  { id: 'pause', label: 'Пауза', Icon: PauseIcon, color: 'yellow', type: 'communication', description: 'Ребёнок просит паузу' },
  { id: 'no', label: 'Нет', Icon: NoIcon, color: 'coral', type: 'communication', description: 'Ребёнок отказался' },
];

export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ label: string; Icon: React.FC<IconProps>; color: QoldauIconColor } | null>(null);
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
      payload: { cardId: card.id, cardLabel: card.label, source: 'aac_card' },
    });

    setFeedback({ label: card.label, Icon: card.Icon, color: card.color });

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
        <div className="w-10" />
      </div>

      {/* 11 AAC-карточек в сетке через QoldauIconCard */}
      <div className="grid grid-cols-4 gap-2.5">
        {CARDS.map((card) => (
          <QoldauIconCard
            key={card.id}
            icon={card.Icon}
            label={card.label}
            color={card.color}
            size="md"
            state={selected === card.id ? 'pressed' : 'default'}
            onClick={() => handleSelect(card)}
          />
        ))}
      </div>

      {/* Success feedback — мягкая карточка с SuccessSparkle */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm qoldau-success-pop"
        >
          <div className="bg-white border-2 border-[#DDF5F0] rounded-3xl px-6 py-5 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <SuccessSparkle className="w-16 h-16" />
            </div>
            <div className="flex items-center justify-center gap-2 text-base font-black text-ink">
              <feedback.Icon size={24} />
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