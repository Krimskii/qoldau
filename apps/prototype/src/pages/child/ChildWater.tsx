import React from 'react';
import { ChildActionSpeak, type ActionSpeakConfig } from './ChildActionSpeak';
import { Water2DIcon } from '@/components/icons/child2d';

/**
 * /child/water — sub-page для «Хочу пить».
 * Внутри: микрофон (mock) + 3 слова (Ва/Вода/Дай) + phrase-builder.
 */
const CONFIG: ActionSpeakConfig = {
  actionId: 'water',
  title: 'Хочу пить',
  accent: {
    from: '#7fd1c9',
    to: '#12807a',
    text: '#12807a',
    chipBg: '#EAF5FF',
    chipText: '#1c6cb8',
  },
  HeroIcon: Water2DIcon,
  mainWords: [
    { id: 'va',    label: 'Ва',    spoken: 'Вода',  hint: 'ва' },
    { id: 'water', label: 'Вода',  spoken: 'Вода',  hint: 'вода' },
    { id: 'give',  label: 'Дай',   spoken: 'Дай',   hint: 'дай' },
  ],
  phraseWords: [
    { text: 'Я',          bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
    { text: 'хочу',       bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
    { text: 'пить',       bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
    { text: 'воду',       bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
    { text: 'пожалуйста', bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]', wide: true },
    { text: 'не хочу',    bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
  ],
  showTimer: false,
  eventType: 'water',
  eventTitle: 'Просьба о воде',
  makeEventDescription: ({ phrase }) =>
    phrase
      ? `Ребёнок собрал фразу: «${phrase}». Похоже, это просьба о воде. Это наблюдение, не диагноз.`
      : 'Просьба о воде',
};

export const ChildWater: React.FC = () => <ChildActionSpeak config={CONFIG} />;
