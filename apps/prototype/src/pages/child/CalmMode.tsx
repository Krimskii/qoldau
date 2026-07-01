import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { CloudMascot } from '@/components/illustrations/CloudMascot';
import {
  MusicIcon,
  BreathIcon,
  HeadphonesIcon,
  MoonIcon,
  PauseIcon,
  HugIcon,
  type IconProps,
} from '@/components/icons';

const TIMER_SECONDS = 60;

interface CalmOption {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  iconColor: string;
  bg: string;
  textColor: string;
  path?: string;
}

// 6 спокойных опций — flat SVG вместо эмодзи.
const OPTIONS: CalmOption[] = [
  { id: 'music', label: 'Тихая музыка', Icon: MusicIcon, iconColor: 'text-[#5a3eb4]', bg: 'bg-[#F1EDFF]', textColor: 'text-[#173760]' },
  { id: 'breath', label: 'Дыхание', Icon: BreathIcon, iconColor: 'text-[#1c6cb8]', bg: 'bg-[#EAF5FF]', textColor: 'text-[#173760]' },
  { id: 'headphones', label: 'Наушники', Icon: HeadphonesIcon, iconColor: 'text-[#158647]', bg: 'bg-[#EAF8F0]', textColor: 'text-[#173760]' },
  { id: 'dark', label: 'Темно', Icon: MoonIcon, iconColor: 'text-[#EAF5FF]', bg: 'bg-[#244a85]', textColor: 'text-white' },
  { id: 'pause', label: 'Пауза', Icon: PauseIcon, iconColor: 'text-[#9a7820]', bg: 'bg-[#FFF6DF]', textColor: 'text-[#173760]' },
  { id: 'call-mom', label: 'Позвать маму', Icon: HugIcon, iconColor: 'text-[#5a3eb4]', bg: 'bg-[#F1EDFF]', textColor: 'text-[#173760]', path: '/child/call' },
];

export const CalmMode: React.FC = () => {
  const navigate = useNavigate();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const { addEvent, updateEvent } = useEventStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, TIMER_SECONDS - elapsed);
      setRemaining(left);
      if (left === 0) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [startedAt]);

  const handleStart = () => {
    if (startedAt !== null) return;
    setStartedAt(Date.now());
    const newEvent = addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'calm_mode',
      title: 'Спокойный режим',
      description: 'Запустил Calm Mode — таймер 1 минута',
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { startedAt: new Date().toISOString(), duration: TIMER_SECONDS },
    });
    setCurrentEventId(newEvent.id);
  };

  const handleFinish = (feltCalmer: boolean) => {
    if (currentEventId) {
      updateEvent(currentEventId, {
        description: `Calm Mode завершён. ${feltCalmer ? 'Похоже, стало спокойнее.' : 'Завершено.'} Это наблюдение, не диагноз.`,
        payload: {
          startedAt: new Date(startedAt!).toISOString(),
          finishedAt: new Date().toISOString(),
          duration: TIMER_SECONDS,
          feltCalmer,
        },
      });
    }
    showToast(
      feltCalmer ? 'Отмечено: стало спокойнее' : 'Отмечено: завершено',
      'success'
    );
    navigate('/child/home');
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#EAF5FF] via-[#F9FCFC] to-[#F1EDFF] -mx-4 -mt-2 px-4 pt-2 pb-4 rounded-t-3xl">
      {/* Hero — CloudMascot + поддерживающие тексты */}
      <div className="flex flex-col items-center pt-4">
        <CloudMascot mood={startedAt ? 'happy' : 'calm'} animated className="w-28 h-auto" />
        <h2 className="text-xl font-black text-[#143259] mt-3">Можно отдохнуть</h2>
        <p className="text-sm text-muted mt-1">Ты в безопасности</p>
      </div>

      {/* Таймер / кнопка старта */}
      <div className="bg-white/70 backdrop-blur-sm border-2 border-[#DDF5F0] rounded-3xl p-6 text-center">
        {startedAt === null ? (
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-br from-teal to-teal-dark text-white font-black rounded-2xl text-lg shadow-card transition-transform duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
          >
            Начать (1 минута)
          </button>
        ) : (
          <div>
            <div className="text-5xl font-black text-teal-dark tabular-nums">
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted mt-2">Дыши спокойно</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => handleFinish(true)}
                className="px-5 py-3 rounded-full bg-[#EAF8F0] text-[#158647] font-bold hover:bg-[#d6f1e0] transition-colors"
              >
                Стало спокойнее
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="px-5 py-3 rounded-full bg-white border-2 border-line text-muted font-bold hover:bg-bg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6 опций — flat SVG-иконки на pastel-фонах */}
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map(({ id, label, Icon, iconColor, bg, textColor, path }) => (
          <button
            key={id}
            aria-label={label}
            onClick={() => {
              if (path) navigate(path);
            }}
            className={`min-h-[100px] rounded-2xl border border-[#d8e8f3] ${bg} flex flex-col items-center justify-center gap-2 text-sm font-black transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${textColor}`}
          >
            <Icon size={36} className={iconColor} />
            {label}
          </button>
        ))}
      </div>

      <p className="text-center font-black text-[#2c5e9e] mt-2 text-sm">
        Я рядом <span className="text-[#4EC28A] text-lg" aria-hidden="true">♥</span>
      </p>
    </div>
  );
};