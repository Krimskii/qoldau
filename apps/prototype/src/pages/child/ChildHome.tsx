import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Water2DIcon,
  Food2DIcon,
  Toilet2DIcon,
  Pause2DIcon,
  Fav2DIcon,
  Mic2DIcon,
  Heart2DIcon,
  Puzzle2DIcon,
  type ChildCardFamily,
} from '@/components/icons/child2d';
import { childFamily, ctaChildHome, childHomeSizes } from '@/styles/tokens';
import { useChildSettingsStore } from '@/store/useChildSettingsStore';
import { triggerHaptic } from '@/lib/feedback/haptics';
import { speak } from '@/lib/tts/speak';

interface ChildHomeCard {
  /** Фикс-порядок для моторной памяти. */
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  go: string;
}

/**
 * ChildHome — главный экран ребёнка (v1.5+ polish).
 *
 * Структура:
 * - TopBar ~48 (mute + выйти в calm/standard; +аватар26+имя в playful).
 * - Сетка 3×2 карточки: aspect-square min-h-[112px] rounded-[28px] белая
 *   shadow-card, плитка 84×84 rounded-[22px] с иконкой 64, лейбл 12px
 *   font-black (цвет семьи). В calm лейблы скрыты.
 * - CTA «Позвать маму» mx-5 mt-4 min-h-[76px], coral, soft-pulse.
 * - CTA «Собрать фразу» mx-5 mt-2 min-h-[88px], blue/purple, статичный.
 *
 * Состояния карточек:
 * - default: белая, плитка цветная.
 * - pressed: active:scale-[0.94] + opacity-90 + TTS + haptic.
 * - selected: ring-2 ring-teal/40.
 * - disabled: opacity-40.
 *
 * Регулятор (sensoryMode):
 * - calm:     лейблы скрыты, soft-pulse выкл, гаптик off.
 * - standard: лейблы видны, обычный ритм.
 * - playful:  лейблы видны, искра-cue + soft-pulse на «Позвать маму».
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

interface HomeCardProps {
  c: ChildHomeCard;
  /** Скрывать ли лейбл (calm-режим). */
  hideLabel?: boolean;
}

/**
 * Большая квадратная карточка с цветной плиткой-иконкой и лейблом
 * (опционально, скрыт в calm).
 */
const HomeCard: React.FC<HomeCardProps> = ({ c, hideLabel }) => {
  const navigate = useNavigate();
  const family = childFamily[c.family];
  const handleClick = () => {
    triggerHaptic('tap');
    speak(c.label);
    navigate(c.go);
  };
  return (
    <button
      onClick={handleClick}
      // E8.6: добавлен overflow-hidden + min-w-0 — без этого CSS-grid не
      // сжимает элемент меньше intrinsic-content-width, и длинный лейбл
      // (напр. «Хочу кушать», kk «Тамақ ішкім келеді») мог вылезать в
      // соседнюю колонку (симптом: буква «ы» между карточками).
      className="child-home-card flex flex-col items-center justify-center gap-1.5 bg-white rounded-[28px] shadow-card aspect-square w-full min-w-0 min-h-[112px] overflow-hidden transition-all duration-200 ease-out active:scale-[0.94] active:opacity-90 hover:-translate-y-0.5 hover:shadow-card-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 qoldau-tap-ring"
      aria-label={c.label}
      data-card-id={c.id}
    >
      <div
        className="flex items-center justify-center rounded-[22px] flex-shrink-0"
        style={{
          background: family.icoBg,
          width: childHomeSizes.tileSize,
          height: childHomeSizes.tileSize,
        }}
      >
        <c.Icon size={childHomeSizes.tileIcon} animated={false} />
      </div>
      {!hideLabel && (
        <span
          className="text-[12px] font-black leading-tight text-center w-full px-1.5"
          style={{
            color: family.lbl,
            // 2 строки максимум, потом ellipsis. Для kk/en где фразы
            // длиннее ru.
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {c.label}
        </span>
      )}
    </button>
  );
};

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  const sensoryMode = useChildSettingsStore((s) => s.sensoryMode);
  const hideLabel = sensoryMode === 'calm';

  const handleCallMom = () => {
    // playful → cue (двойной), standard → tap, calm → off (см. haptics.ts).
    triggerHaptic('cue');
    speak('Позвать маму');
    navigate('/child/call');
  };

  const handlePhraseBuilder = () => {
    triggerHaptic('tap');
    speak('Собрать фразу');
    navigate('/child/phrase-builder');
  };

  return (
    <div className="child-home max-w-[430px] mx-auto flex flex-col pb-6">
      {/* Сетка 3×2 фикс-порядок: пить / кушать / туалет / отдохнуть / любимые / сказать. */}
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-3">
        {HOME_ROW_1.map((c) => (
          <HomeCard key={c.id} c={c} hideLabel={hideLabel} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-3.5">
        {HOME_ROW_2.map((c) => (
          <HomeCard key={c.id} c={c} hideLabel={hideLabel} />
        ))}
      </div>

      {/* CTA «Позвать маму» — coral, soft-pulse (гейт по CSS). */}
      <button
        onClick={handleCallMom}
        className="mx-5 mt-4 rounded-[24px] px-4 cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform shadow-card min-h-[76px] qoldau-soft-pulse qoldau-tap-ring"
        style={{
          background: `linear-gradient(135deg, ${ctaChildHome.callMom.bgFrom} 0%, ${ctaChildHome.callMom.bgTo} 100%)`,
          color: ctaChildHome.callMom.text,
          boxShadow: ctaChildHome.callMom.shadow,
        }}
        aria-label="Позвать маму"
        data-testid="childhome-call-mom"
      >
        <Heart2DIcon size={childHomeSizes.callMomIcon} animated={false} />
        <span className="text-[16px] font-black leading-none">
          Позвать маму
        </span>
      </button>

      {/* CTA «Собрать фразу» — blue/purple tint. */}
      <button
        onClick={handlePhraseBuilder}
        className="mx-5 mt-2 rounded-[24px] px-4 cursor-pointer flex items-center justify-center gap-2.5 shadow-card active:scale-[0.97] transition-transform min-h-[88px] qoldau-tap-ring"
        style={{
          background: `linear-gradient(135deg, ${ctaChildHome.phrase.bgFrom} 0%, ${ctaChildHome.phrase.bgTo} 100%)`,
          color: ctaChildHome.phrase.text,
        }}
        aria-label="Собрать фразу"
        data-testid="childhome-phrase-builder"
      >
        <Puzzle2DIcon size={childHomeSizes.phraseIcon} animated={false} />
        <span className="text-[15px] font-black leading-none">
          Собрать фразу
        </span>
      </button>
    </div>
  );
};