import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { ChildTopBar } from '@/components/layout/ChildTopBar';
import { BackArrowIcon } from '@/components/icons/child2d';
import { X } from 'lucide-react';
import {
  Food2DIcon,
  Play2DIcon,
  Car2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';

interface ChoiceOption {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  gradient: string;
}

const CHOICE_OPTIONS: ChoiceOption[] = [
  { id: 'banana', label: 'Банан',     Icon: Food2DIcon, family: 'need', gradient: 'linear-gradient(135deg, #FFF8E5 0%, #FFEAB8 100%)' },
  { id: 'soup',   label: 'Суп',       Icon: Food2DIcon, family: 'need', gradient: 'linear-gradient(135deg, #FFEDEA 0%, #FFD9D3 100%)' },
  { id: 'ball',   label: 'Мяч',       Icon: Play2DIcon, family: 'do',   gradient: 'linear-gradient(135deg, #E8F4FF 0%, #CCE6F7 100%)' },
  { id: 'car',    label: 'Машинка',   Icon: Car2DIcon,  family: 'do',   gradient: 'linear-gradient(135deg, #FFEDEA 0%, #FFC2BC 100%)' },
];

/**
 * ChildChoice — выбор из 2×2 вариантов (v0.3.15).
 *
 * Структура:
 * - ChildTopBar без settings.
 * - Back + close.
 * - Title "Что ты хочешь?".
 * - 2×2 крупных карточки с 2D иконками.
 * - Toast feedback внизу.
 */
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
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <ChildTopBar />

      <div className="flex items-center gap-2.5 px-5 pt-1 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <button
          onClick={() => navigate('/child/home')}
          className="ml-auto w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} className="text-ink-soft" />
        </button>
      </div>

      <h2 className="text-2xl font-black text-center text-ink my-3">Что ты хочешь?</h2>

      <div className="grid grid-cols-2 gap-3 px-5 flex-1">
        {CHOICE_OPTIONS.map((option) => {
          const family = CHILD_FAMILY_STYLES[option.family];
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              aria-label={`Выбрать ${option.label}`}
              className={`min-h-[180px] rounded-3xl border-0 flex flex-col items-center justify-center gap-2.5 p-4 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.94] transition-all ${
                selected === option.id ? 'scale-95 opacity-80' : ''
              }`}
              style={{
                background: option.gradient,
                boxShadow: '0 6px 14px rgba(42,73,108,0.06)',
              }}
            >
              <div className={`w-20 h-20 rounded-3xl ${family.icoBg} flex items-center justify-center`}>
                <option.Icon size={64} />
              </div>
              <span className={`text-xl font-black ${family.lbl}`}>{option.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-4 right-4 text-white text-center py-5 px-4 rounded-2xl font-black text-lg shadow-card animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)' }}
        >
          ✓ Мама увидит выбор
          <div className="text-sm font-normal opacity-90 mt-1">Ребёнок выбрал «{feedback}»</div>
        </div>
      )}

      <div style={{ height: 12 }} />
    </div>
  );
};