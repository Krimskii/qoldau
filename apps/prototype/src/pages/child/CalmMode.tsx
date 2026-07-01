import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const TIMER_SECONDS = 60;

export const CalmMode: React.FC = () => {
  const navigate = useNavigate();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const { addEvent, updateEvent } = useEventStore();
  const { showToast } = useToastStore();
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

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
    showToast(feltCalmer ? 'Отмечено: стало спокойнее' : 'Отмечено: завершено', 'success');
    navigate('/child/home');
  };

  const calmOptions = [
    { id: 'music', label: 'Тихая музыка', emoji: '🎵' },
    { id: 'breath', label: 'Дыхание', emoji: '〰️' },
    { id: 'hug', label: 'Объятие', emoji: '💗' },
    { id: 'headphones', label: 'Наушники', emoji: '🎧' },
    { id: 'dark', label: 'Темно', emoji: '🌙' },
    { id: 'pause', label: 'Пауза', emoji: '⏸' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center pt-4">
        <div className="text-5xl mb-3">☁️</div>
        <h2 className="text-lg font-black text-[#143259]">Можно отдохнуть</h2>
      </div>

      {/* Timer */}
      <div className="bg-gradient-to-br from-[#E8F3FF] to-[#F0EBFF] border border-mint rounded-2xl p-6 text-center">
        {startedAt === null ? (
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-black rounded-2xl text-lg shadow-card"
          >
            Начать (1 минута)
          </button>
        ) : (
          <div>
            <div className="text-5xl font-black text-teal-dark tabular-nums">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted mt-2">Дыши спокойно</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => handleFinish(true)}
                className="px-5 py-3 rounded-full bg-green-soft text-green font-bold hover:bg-green hover:text-white transition-colors"
              >
                Стало спокойнее
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="px-5 py-3 rounded-full bg-white border border-line text-muted font-bold hover:bg-bg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {calmOptions.map((option) => (
          <button
            key={option.id}
            className="min-h-[88px] rounded-xl border border-[#d8e8f3] bg-gradient-to-br from-[#f7fbff] to-[#ecf7ff] flex flex-col items-center justify-center gap-2 text-sm font-black text-[#163760] hover:scale-[0.97] transition-transform"
          >
            <span className="text-3xl">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-center font-black text-[#2c5e9e] mt-4">
        Ты в безопасности <span className="text-[#ff7e9b]">❤</span>
      </p>
    </div>
  );
};