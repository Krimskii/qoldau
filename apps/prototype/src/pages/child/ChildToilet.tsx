import React from 'react';
import { ChildActionSpeak, type ActionSpeakConfig } from './ChildActionSpeak';
import { Toilet2DIcon } from '@/components/icons/child2d';

/**
 * /child/toilet — sub-page для «Туалет».
 * Внутри: микрофон (mock) + 3 слова (Ту-ту/Туалет/Дай) + phrase-builder + ТАЙМЕР.
 * Таймер: старт → отсчёт 5 минут → можно остановить в любой момент → событие «сходил».
 */
const CONFIG: ActionSpeakConfig = {
  actionId: 'toilet',
  title: 'Туалет',
  accent: {
    from: '#9ec3e8',
    to: '#3a7fb5',
    text: '#1c6cb8',
    chipBg: '#EAF5FF',
    chipText: '#1c6cb8',
  },
  HeroIcon: Toilet2DIcon,
  speakWords: [
    { id: 'tutu',  label: 'Ту-ту',  spoken: 'Туалет',  hint: 'ту-ту' },
    { id: 'toilet', label: 'Туалет', spoken: 'Туалет',  hint: 'туалет' },
    { id: 'help',  label: 'Помощь',  spoken: 'Помощь',  hint: 'помощь' },
  ],
  phraseWords: [
    { text: 'Я',          bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
    { text: 'хочу',       bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
    { text: 'в туалет',   bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]', wide: true },
    { text: 'ту-ту',      bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
    { text: 'помоги',     bg: 'bg-[#FBEDED]', color: 'text-[#a24545]' },
    { text: 'не хочу',    bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
  ],
  showTimer: true,
  timerSeconds: 300, // 5 минут
  micHint: 'Нажми и скажи «ту-ту» или «туалет»',
  phraseHint: 'Собрать фразу про туалет →',
  eventType: 'toilet',
  eventTitle: 'Сигнал о туалете',
  makeEventDescription: ({ spoken, phrase, finishedTimer }) => {
    if (finishedTimer) return 'Ребёнок отметил «сходил» по таймеру. Это наблюдение, не диагноз.';
    if (phrase) return `Ребёнок собрал фразу: «${phrase}». Похоже, это сигнал о туалете. Это наблюдение, не диагноз.`;
    if (spoken) return `Ребёнок сказал «${spoken}». Похоже, идёт в туалет. Это наблюдение, не диагноз.`;
    return 'Сигнал о туалете';
  },
};

export const ChildToilet: React.FC = () => <ChildActionSpeak config={CONFIG} />;
