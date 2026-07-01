import React from 'react';
import { ChildActionSpeak, type ActionSpeakConfig } from './ChildActionSpeak';
import {
  Water2DIcon,
  Help2DIcon,
  User2DIcon,
  Heart2DIcon,
  Hug2DIcon,
  No2DIcon,
} from '@/components/icons/child2d';

/**
 * /child/water — sub-page для «Хочу пить».
 * 3 главные кнопки (явные) с иконками: Ва | Вода | Дай.
 * 6 нижних чипов: Я | хочу | пить | воду | пожалуйста | не хочу.
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
    { id: 'va',    label: 'Ва',    spoken: 'Вода',  hint: 'ва',   icon: Water2DIcon },
    { id: 'water', label: 'Вода',  spoken: 'Вода',  hint: 'вода', icon: Water2DIcon },
    { id: 'give',  label: 'Дай',   spoken: 'Дай',   hint: 'дай',  icon: Help2DIcon },
  ],
  phraseWords: [
    { text: 'Я',          icon: User2DIcon,   bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
    { text: 'хочу',       icon: Heart2DIcon,  bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
    { text: 'пить',       icon: Water2DIcon,  bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
    { text: 'воду',       icon: Water2DIcon,  bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
    { text: 'пожалуйста', icon: Hug2DIcon,    bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]', wide: true },
    { text: 'не хочу',    icon: No2DIcon,     bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
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
