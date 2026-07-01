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
  ChildMonsterMascot,
  Check2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';

interface ChildHomeCard {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  go: string;
}

/**
 * ChildHome — главный экран ребёнка (v0.3.19).
 *
 * Новая сетка 3×2 (таб-friendly, карточки больше — 96px иконка, 18px текст):
 * - Row 1: Хочу пить (water) | Хочу кушать (food) | Туалет (toilet)
 *   Каждая ведёт на свой sub-page (/child/water | /child/food | /child/toilet)
 *   с большой микрофон-кнопкой + phrase-builder + (для туалета — таймер).
 * - Row 2: Пауза (calm) | Любимые (favorites) | Сказать (speak)
 *
 * Sub-pages: внутри как в ChildSpeak (микрофон + 3 контекстных слова),
 * но опционально с фразой-билдером и (для туалета) таймером старт/стоп.
 *
 * Hero: CloudMascot + «Привет, {name}» + статус.
 * CTA: «Позвать маму» (CallMom).
 * Bottom CTA: «Собрать фразу» (phrase-builder с произвольными словами).
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
 * Карточка главного экрана — увеличенная версия для планшетного использования.
 * - Контейнер иконки: 80×80 (вместо 56×56)
 * - Иконка: 60px (вместо 46px)
 * - min-h карточки: 150px (вместо 120px)
 * - Текст: text-base (вместо text-sm)
 */
const HomeCard: React.FC<{ c: ChildHomeCard; delay: number }> = ({ c, delay }) => {
  const navigate = useNavigate();
  const family = CHILD_FAMILY_STYLES[c.family];
  return (
    <button
      onClick={() => navigate(c.go)}
      className={`qoldau-icon-pop flex flex-col items-center gap-3 px-2 py-4 bg-white rounded-[24px] shadow-card cursor-pointer min-h-[150px] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.94] group`}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={c.label}
    >
      <div className={`w-20 h-20 rounded-[20px] ${family.icoBg} flex items-center justify-center transition-transform group-active:qoldau-icon-wiggle`}>
        <c.Icon size={60} animated={false} />
      </div>
      <div className={`text-base font-black text-center leading-tight ${family.lbl}`}>
        {c.label}
      </div>
    </button>
  );
};

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <ChildOnboarding />

      {/* Hello card */}
      <div
        className="mx-5 mt-1.5 mb-1 rounded-[26px] p-[18px] flex items-center gap-3.5 shadow-card"
        style={{ background: 'linear-gradient(135deg, #eef6fb 0%, #eaf7f4 100%)' }}
      >
        <div className="w-[66px] h-[66px] flex-none">
          <ChildMonsterMascot size={66} animated={false} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-black leading-tight m-0">
            Привет, {child.name}!
          </h1>
          <div
            className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
            style={{ background: '#dff3ec', color: '#1f7a5e' }}
          >
            <Check2DIcon size={14} />
            <span>Я в порядке</span>
          </div>
        </div>
      </div>

      {/* Call Mom CTA */}
      <button
        onClick={() => navigate('/child/call')}
        className="mx-5 my-3 w-[calc(100%-2.5rem)] border-0 rounded-[22px] p-4 cursor-pointer flex items-center justify-center gap-3 text-[18px] font-black active:scale-[0.97] transition-transform"
        style={{
          background: 'linear-gradient(135deg, #fdecec 0%, #fbe0e0 100%)',
          color: '#c95f5f',
          boxShadow: '0 6px 16px rgba(201,95,95,0.16)',
        }}
        aria-label="Позвать маму"
      >
        <Heart2DIcon size={26} animated={false} />
        Позвать маму
      </button>

      {/* 6 cards: 3×2 с stagger (большие карточки для планшета) */}
      <div className="grid grid-cols-3 gap-4 px-5 pt-1.5 pb-1">
        {HOME_ROW_1.map((c, i) => (
          <HomeCard key={c.id} c={c} delay={i * 60} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 px-5 pt-1.5 pb-1">
        {HOME_ROW_2.map((c, i) => (
          <HomeCard key={c.id} c={c} delay={180 + i * 60} />
        ))}
      </div>

      {/* Variants button — собрать фразу */}
      <button
        onClick={() => navigate('/child/phrase-builder')}
        className="mx-5 mt-3 mb-1.5 w-[calc(100%-2.5rem)] rounded-[22px] p-4 cursor-pointer flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #eef4fb 0%, #f3eefb 100%)' }}
        aria-label="Собрать фразу"
      >
        <Puzzle2DIcon size={34} animated={false} />
        <div className="text-left">
          <div className="text-base font-black text-ink">Собрать фразу</div>
          <div className="text-[13px] text-ink-soft font-semibold">
            Выбрать из вариантов
          </div>
        </div>
      </button>

      <div style={{ height: 12 }} />
    </div>
  );
};
