import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { ChildOnboarding } from '@/components/child/ChildOnboarding';
import {
  Water2DIcon,
  Food2DIcon,
  Toilet2DIcon,
  Pause2DIcon,
  Fav2DIcon,
  Mic2DIcon,
  Heart2DIcon,
  Puzzle2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';

interface ChildHomeCard {
  id: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  go: string;
  label: string;
}

/**
 * ChildHome — главный экран ребёнка (v1.5+ minimal).
 *
 * Чистый минимализм для child role:
 * - НЕТ «Привет, имя» / статуса / аватара / CloudMascot — это отвлекает.
 * - Большие квадратные карточки 2×3 (без надписей, иконка центрирована).
 * - Кнопка «Позвать маму» — заметная, coral, с иконкой.
 * - Кнопка «Собрать фразу» — отдельная большая карточка под сеткой.
 *
 * Все размеры — touch-friendly: action-карточки ≥110×110px.
 */
const HOME_ROW_1: ChildHomeCard[] = [
  { id: 'water',  label: 'Хочу пить',     Icon: Water2DIcon,  family: 'need', go: '/child/water' },
  { id: 'food',   label: 'Хочу кушать',   Icon: Food2DIcon,   family: 'do',   go: '/child/food' },
  { id: 'toilet', label: 'Туалет',         Icon: Toilet2DIcon, family: 'need', go: '/child/toilet' },
];

const HOME_ROW_2: ChildHomeCard[] = [
  { id: 'pause', label: 'Отдохнуть', Icon: Pause2DIcon, family: 'feel', go: '/child/calm' },
  { id: 'fav',   label: 'Любимые',   Icon: Fav2DIcon,   family: 'fav',  go: '/child/favorites' },
  { id: 'speak', label: 'Сказать',   Icon: Mic2DIcon,   family: 'do',   go: '/child/speak' },
];

/**
 * Карточка главного экрана — БОЛЬШАЯ, без надписи.
 * 2×3 grid → ширина ~33vw, делаем квадратной 110×110px минимум,
 * с крупной иконкой 80px.
 */
const HomeCard: React.FC<{ c: ChildHomeCard }> = ({ c }) => {
  const navigate = useNavigate();
  const family = CHILD_FAMILY_STYLES[c.family];
  return (
    <button
      onClick={() => navigate(c.go)}
      className="flex items-center justify-center bg-white rounded-[28px] shadow-card cursor-pointer aspect-square w-full min-h-[120px] transition-transform duration-200 active:scale-[0.94] hover:-translate-y-1 hover:shadow-card-lg"
      aria-label={c.label}
    >
      <div className={`w-[88px] h-[88px] rounded-[22px] ${family.icoBg} flex items-center justify-center`}>
        <c.Icon size={68} animated={false} />
      </div>
    </button>
  );
};

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  // DEMO_PRIMARY_CHILD используется в ChildOnboarding — оставлено для совместимости.
  void DEMO_PRIMARY_CHILD;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <ChildOnboarding />

      {/* 6 cards: 2×3, без надписей */}
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-3 pb-1">
        {HOME_ROW_1.map((c) => (
          <HomeCard key={c.id} c={c} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-3 pb-1">
        {HOME_ROW_2.map((c) => (
          <HomeCard key={c.id} c={c} />
        ))}
      </div>

      {/* «Позвать маму» — крупная coral кнопка с иконкой */}
      <button
        onClick={() => navigate('/child/call')}
        className="mx-5 mt-4 mb-3 border-0 rounded-[24px] p-4 cursor-pointer flex items-center justify-center gap-3 active:scale-[0.97] transition-transform shadow-card min-h-[72px]"
        style={{
          background: 'linear-gradient(135deg, #fdecec 0%, #fbe0e0 100%)',
          color: '#c95f5f',
        }}
        aria-label="Позвать маму"
      >
        <Heart2DIcon size={32} animated={false} />
      </button>

      {/* «Собрать фразу» — отдельная большая карточка с иконкой Puzzle2DIcon */}
      <button
        onClick={() => navigate('/child/phrase-builder')}
        className="mx-5 mt-1 mb-3 rounded-[24px] p-5 cursor-pointer flex items-center justify-center gap-3 shadow-card active:scale-[0.98] transition-transform min-h-[88px]"
        style={{ background: 'linear-gradient(135deg, #eef4fb 0%, #f3eefb 100%)' }}
        aria-label="Собрать фразу"
      >
        <Puzzle2DIcon size={56} animated={false} />
      </button>

      <div style={{ height: 12 }} />
    </div>
  );
};