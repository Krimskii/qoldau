import React from 'react';
import { ChildActionSpeak, type ActionSpeakConfig } from './ChildActionSpeak';
import { Food2DIcon } from '@/components/icons/child2d';

/**
 * /child/food — sub-page для «Хочу кушать».
 * Внутри: микрофон (mock) + 3 слова (Ам/Есть/Дай) + phrase-builder.
 */
const CONFIG: ActionSpeakConfig = {
  actionId: 'food',
  title: 'Хочу кушать',
  accent: {
    from: '#9ad7a7',
    to: '#3aa06b',
    text: '#276b48',
    chipBg: '#EAF6EF',
    chipText: '#276b48',
  },
  HeroIcon: Food2DIcon,
  mainWords: [
    { id: 'am',   label: 'Ам',   spoken: 'Есть',   hint: 'ам' },
    { id: 'eat',  label: 'Есть', spoken: 'Есть',   hint: 'есть' },
    { id: 'give', label: 'Дай',  spoken: 'Дай',    hint: 'дай' },
  ],
  phraseWords: [
    { text: 'Я',          bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
    { text: 'хочу',       bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
    { text: 'есть',       bg: 'bg-[#EAF6EF]', color: 'text-[#276b48]' },
    { text: 'кашу',       bg: 'bg-[#EAF6EF]', color: 'text-[#276b48]' },
    { text: 'пожалуйста', bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]', wide: true },
    { text: 'не хочу',    bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
  ],
  showTimer: false,
  eventType: 'food',
  eventTitle: 'Просьба о еде',
  makeEventDescription: ({ phrase }) =>
    phrase
      ? `Ребёнок собрал фразу: «${phrase}». Похоже, это просьба о еде. Это наблюдение, не диагноз.`
      : 'Просьба о еде',
};

export const ChildFood: React.FC = () => <ChildActionSpeak config={CONFIG} />;
