import React, { useState, useEffect, useRef } from 'react';
import { NeedCard, type NeedCardConfig } from './NeedCard';
import {
  Toilet2DIcon,
  User2DIcon,
  Heart2DIcon,
  Sparkle2DIcon,
  Pause2DIcon,
} from '@/components/icons/child2d';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

/**
 * TimerExtra — компактный таймер для NeedCard (v0.3.24).
 * Показывается только на /child/toilet, передаётся через `config.extra`.
 * Start → отсчёт 5 мин → можно остановить в любой момент → создаёт событие.
 */
const TimerExtra: React.FC = () => {
  const { addEvent } = useEventStore();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt === null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStartedAt(Date.now());
  };
  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStartedAt(null);
    if (elapsed > 0) {
      addEvent({
        childId: DEMO_PRIMARY_CHILD.id,
        type: 'toilet',
        title: 'Таймер туалета',
        description: `Ребёнок отметил «сходил» (${elapsed} сек). Это наблюдение, не диагноз.`,
        timestamp: new Date().toISOString(),
        sourceRole: 'child',
        status: 'confirmed',
        payload: { action: 'toilet', source: 'timer', durationSec: elapsed },
      });
    }
  };

  return (
    <div className="bg-white border border-line rounded-[20px] p-4 shadow-card-soft">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#e9f7f5' }}
        >
          <Pause2DIcon size={16} animated={false} />
        </div>
        <div className="text-sm font-black text-ink">Таймер</div>
        {startedAt !== null && (
          <span className="ml-auto text-xs text-muted font-bold">идёт</span>
        )}
      </div>
      {startedAt === null ? (
        <>
          <p className="text-xs text-muted leading-relaxed mb-2">
            Запусти, когда пойдёшь. Можно остановить в любой момент.
          </p>
          <button
            onClick={handleStart}
            className="w-full border-0 rounded-[14px] py-2.5 text-white text-sm font-black flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)',
              boxShadow: '0 4px 12px rgba(27,163,154,0.24)',
            }}
          >
            ▶ Запустить таймер
          </button>
        </>
      ) : (
        <>
          <div
            className="text-3xl font-black tabular-nums text-center mb-2"
            style={{ color: '#0d5c5c' }}
            aria-live="polite"
          >
            {fmt(elapsed)}
          </div>
          <button
            onClick={handleStop}
            className="w-full border-0 rounded-[14px] py-2.5 text-white text-sm font-black flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #E56F5D 0%, #cc251d 100%)',
              boxShadow: '0 4px 12px rgba(229,111,93,0.24)',
            }}
          >
            ⏹ Стоп и отметить
          </button>
        </>
      )}
    </div>
  );
};

/**
 * /child/toilet — «Хочу в туалет».
 * 4 слова: Я (pron) | хочу (verb) | в туалет (noun) | срочно (verb).
 * + TimerExtra (компактный таймер 5 мин).
 */
const CONFIG: NeedCardConfig = {
  title: 'Хочу в туалет',
  HeroIcon: Toilet2DIcon,
  phraseHint: 'Я хочу в туалет',
  words: [
    { text: 'Я',         icon: User2DIcon,    func: 'pron' },
    { text: 'хочу',      icon: Heart2DIcon,   func: 'verb' },
    { text: 'в туалет',  icon: Toilet2DIcon,  func: 'noun' },
    { text: 'срочно',    icon: Sparkle2DIcon, func: 'verb' },
  ],
  eventType: 'toilet',
  eventTitle: 'Сигнал о туалете',
  makeEventDescription: ({ phrase }) =>
    phrase
      ? `Ребёнок собрал фразу: «${phrase}». Похоже, это сигнал о туалете. Это наблюдение, не диагноз.`
      : 'Ребёнок подтвердил потребность в туалете. Это наблюдение, не диагноз.',
  extra: <TimerExtra />,
};

export const ChildToilet: React.FC = () => <NeedCard config={CONFIG} />;
