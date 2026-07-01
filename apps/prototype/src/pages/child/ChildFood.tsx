import React from 'react';
import { NeedCard, type NeedCardConfig } from './NeedCard';
import {
  Food2DIcon,
  User2DIcon,
  Heart2DIcon,
} from '@/components/icons/child2d';

/**
 * /child/food — «Хочу есть».
 * 4 слова: Я (pron) | хочу (verb) | есть (verb) | кашу (noun).
 */
const CONFIG: NeedCardConfig = {
  title: 'Хочу есть',
  HeroIcon: Food2DIcon,
  phraseHint: 'Я хочу есть …',
  words: [
    { text: 'Я',     icon: User2DIcon, func: 'pron' },
    { text: 'хочу',  icon: Heart2DIcon, func: 'verb' },
    { text: 'есть',  icon: Food2DIcon,  func: 'verb' },
    { text: 'кашу',  icon: Food2DIcon,  func: 'noun' },
  ],
  eventType: 'food',
  eventTitle: 'Просьба о еде',
  makeEventDescription: ({ phrase }) =>
    phrase
      ? `Ребёнок собрал фразу: «${phrase}». Похоже, это просьба о еде. Это наблюдение, не диагноз.`
      : 'Ребёнок подтвердил потребность в еде. Это наблюдение, не диагноз.',
};

export const ChildFood: React.FC = () => <NeedCard config={CONFIG} />;
