import React from 'react';
import { NeedCard, type NeedCardConfig } from './NeedCard';
import {
  Water2DIcon,
  User2DIcon,
  Heart2DIcon,
} from '@/components/icons/child2d';

/**
 * /child/water — «Хочу пить».
 * 4 слова: Я (pron) | хочу (verb) | пить (verb) | воду (noun).
 */
const CONFIG: NeedCardConfig = {
  title: 'Хочу пить',
  HeroIcon: Water2DIcon,
  phraseHint: 'Я хочу пить …',
  words: [
    { text: 'Я',     icon: User2DIcon,  func: 'pron' },
    { text: 'хочу',  icon: Heart2DIcon, func: 'verb' },
    { text: 'пить',  icon: Water2DIcon, func: 'verb' },
    { text: 'воду',  icon: Water2DIcon, func: 'noun' },
  ],
  eventType: 'water',
  eventTitle: 'Просьба о воде',
  makeEventDescription: ({ phrase }) =>
    phrase
      ? `Ребёнок собрал фразу: «${phrase}». Похоже, это просьба о воде. Это наблюдение, не диагноз.`
      : 'Ребёнок подтвердил потребность в воде. Это наблюдение, не диагноз.',
};

export const ChildWater: React.FC = () => <NeedCard config={CONFIG} />;
