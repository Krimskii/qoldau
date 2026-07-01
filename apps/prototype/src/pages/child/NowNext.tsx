import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface ScheduleItem {
  id: string;
  label: string;
  text: string;
  emoji: string;
  bg: string;
}

const SCHEDULE: ScheduleItem[] = [
  { id: '1', label: 'Сейчас', text: 'Ужин', emoji: '🍲', bg: 'bg-gradient-to-br from-[#FFEDEA] to-[#FFD9D3]' },
  { id: '2', label: 'Потом', text: 'Мультфильм', emoji: '📺', bg: 'bg-gradient-to-br from-[#F0EBFF] to-[#E0D6F7]' },
  { id: '3', label: 'После', text: 'Спокойная музыка', emoji: '🎵', bg: 'bg-gradient-to-br from-[#FFF3CE] to-[#F7E5A3]' },
];

const TOTAL_DURATION = 60; // минут в таймере

export const NowNext: React.FC = () => {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(TOTAL_DURATION * 60); // секунды
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    setRunning((r) => !r);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progressPct = ((TOTAL_DURATION * 60 - remaining) / (TOTAL_DURATION * 60)) * 100;

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <h2 className="text-lg font-black text-[#143259] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Таймер
        </h2>
        <div className="w-10" />
      </div>

      {/* Расписание — 2 карточки с стрелкой */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
        {SCHEDULE.map((item, i) => (
          <React.Fragment key={item.id}>
            <div
              className={`${item.bg} border-2 border-line rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[140px]`}
            >
              <span className="text-xs font-bold text-muted">{item.label}</span>
              <span className="text-6xl" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="text-base font-black text-ink">{item.text}</span>
            </div>
            {i < SCHEDULE.length - 1 && (
              <div className="flex items-center justify-center px-1">
                <span
                  className="text-3xl font-black text-teal"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Таймер */}
      <div className="bg-gradient-to-br from-[#F0EBFF] to-[#E0D6F7] border-2 border-purple/20 rounded-3xl p-6 text-center">
        <p className="text-sm font-bold text-purple mb-3 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Сейчас идёт
        </p>
        <div className="text-5xl font-black text-purple-dark tabular-nums mb-4">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-purple transition-all duration-1000 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          onClick={toggle}
          className={`px-8 py-3 rounded-2xl font-black text-base transition-all ${
            running
              ? 'bg-white text-purple border-2 border-purple'
              : 'bg-gradient-to-br from-teal to-teal-dark text-white shadow-card'
          }`}
        >
          {running ? 'Пауза' : remaining === 0 ? 'Готово!' : 'Запустить таймер'}
        </button>
      </div>

      {/* Большая кнопка готовности */}
      <button
        onClick={() => navigate('/child/calm')}
        className="mt-auto w-full py-5 bg-gradient-to-br from-teal to-teal-dark text-white font-black rounded-2xl text-lg shadow-card flex items-center justify-center gap-2"
      >
        Готово! <span className="text-2xl" aria-hidden="true">✓</span>
      </button>

      <p className="text-center text-sm text-muted">
        Когда время выйдет — взрослый нажмёт «Готово», и мы перейдём в спокойный режим.
      </p>
    </div>
  );
};