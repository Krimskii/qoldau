import React from 'react';
import { ChildActionSpeak, type ActionSpeakConfig } from './ChildActionSpeak';
import {
  Food2DIcon,
  Help2DIcon,
  User2DIcon,
  Heart2DIcon,
  Hug2DIcon,
  No2DIcon,
} from '@/components/icons/child2d';

/**
 * /child/food — sub-page для «Хочу кушать».
 * 3 главные кнопки (явные) с иконками: Ам | Есть | Дай.
 * 6 нижних чипов: Я | хочу | есть | кашу | пожалуйста | не хочу.
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
    { id: 'am',   label: 'Ам',   spoken: 'Есть',  hint: 'ам',   icon: Food2DIcon },
    { id: 'eat',  label: 'Есть', spoken: 'Есть',  hint: 'есть', icon: Food2DIcon },
    { id: 'give', label: 'Дай',  spoken: 'Дай',   hint: 'дай',  icon: Help2DIcon },
  ],
  phraseWords: [
    { text: 'Я',          icon: User2DIcon,  bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
    { text: 'хочу',       icon: Heart2DIcon, bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
    { text: 'есть',       icon: Food2DIcon,  bg: 'bg-[#EAF6EF]', color: 'text-[#276b48]' },
    { text: 'кашу',       icon: Food2DIcon,  bg: 'bg-[#EAF6EF]', color: 'text-[#276b48]' },
    { text: 'пожалуйста', icon: Hug2DIcon,   bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]', wide: true },
    { text: 'не хочу',    icon: No2DIcon,    bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
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
