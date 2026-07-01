import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const TIMER_SECONDS = 60;

interface CalmOption {
  id: string;
  label: string;
  emoji: string;
  bg: string;
}

const OPTIONS: CalmOption[] = [
  { id: 'music', label: 'Тихая музыка', emoji: '🎵', bg: 'bg-gradient-to-br from-[#F0EBFF] to-[#E0D6F7]' },
  { id: 'breath', label: 'Дыхание', emoji: '〰️', bg: 'bg-gradient-to-br from-[#E8F4FF] to-[#CCE6F7]' },
  { id: 'hug', label: 'Объятие', emoji: '💗', bg: 'bg-gradient-to-br from-[#FFEDEA] to-[#FFD9D3]' },
  { id: 'headphones', label: 'Наушники', emoji: '🎧', bg: 'bg-gradient-to-br from-[#E9F8F0] to-[#CCEBD9]' },
  { id: 'dark', label: 'Темно', emoji: '🌙', bg: 'bg-gradient-to-br from-[#244a85] to-[#0b2650]' },
  { id: 'pause', label: 'Пауза', emoji: '⏸', bg: 'bg-gradient-to-br from-[#FFF3CE] to-[#F7E5A3]' },
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
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Облако-маскот — мягкая анимация "дыхания" */}
      <div className="flex flex-col items-center pt-4">
        <div
          className={`text-7xl mb-3 ${startedAt ? 'calm-cloud-active' : ''}`}
          aria-hidden="true"
          style={{
            animation:
              startedAt
                ? 'breathe 4s ease-in-out infinite'
                : 'breathe 3s ease-in-out infinite',
          }}
        >
          ☁️
        </div>
        <h2 className="text-xl font-black text-[#143259]">Можно отдохнуть</h2>
        <p className="text-sm text-muted mt-1">Ты в безопасности</p>
      </div>

      {/* Таймер / кнопка старта */}
      <div className="bg-gradient-to-br from-[#E8F3FF] to-[#F0EBFF] border-2 border-mint rounded-3xl p-6 text-center">
        {startedAt === null ? (
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-br from-teal to-teal-dark text-white font-black rounded-2xl text-lg shadow-card hover:scale-105 transition-transform"
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
                className="px-5 py-3 rounded-full bg-green-soft text-green font-bold hover:bg-green hover:text-white transition-colors"
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

      {/* Опции — 3×2 сетка, мягкие пастельные фоны */}
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            aria-label={option.label}
            className={`min-h-[100px] rounded-2xl border border-[#d8e8f3] ${option.bg} flex flex-col items-center justify-center gap-2 text-sm font-black hover:scale-[0.97] transition-transform ${
              option.id === 'dark'
                ? 'text-white'
                : 'text-[#163760]'
            }`}
          >
            <span className="text-4xl" aria-hidden="true">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-center font-black text-[#2c5e9e] mt-2 text-sm">
        Ты в безопасности <span className="text-[#ff7e9b] text-lg">❤</span>
      </p>

      {/* Анимация дыхания */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};