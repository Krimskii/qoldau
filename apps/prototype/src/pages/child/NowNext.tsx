import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackArrowIcon, Now2DIcon, Cartoon2DIcon, Music2DIcon } from '@/components/icons/child2d';
import { speak } from '@/lib/tts/speak';

interface ScheduleItem {
  id: string;
  label: string;
  text: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  gradient: string;
  textColor: string;
}

const SCHEDULE: ScheduleItem[] = [
  { id: '1', label: 'Сейчас', text: 'Ужин',          Icon: Now2DIcon,     gradient: 'linear-gradient(135deg, #FFEDEA 0%, #FFD9D3 100%)', textColor: 'text-[#a24545]' },
  { id: '2', label: 'Потом',  text: 'Мультфильм',    Icon: Cartoon2DIcon, gradient: 'linear-gradient(135deg, #F0EBFF 0%, #E0D6F7 100%)', textColor: 'text-[#5b47a0]' },
  { id: '3', label: 'После',  text: 'Спокойная музыка', Icon: Music2DIcon, gradient: 'linear-gradient(135deg, #FFF6DF 0%, #FFEAB8 100%)', textColor: 'text-[#8a5d17]' },
];

const TOTAL_DURATION = 60;

/**
 * NowNext — расписание + таймер (v0.3.15).
 *
 * Структура:
 * - ChildTopBar без settings.
 * - 3 карточки в сетке 1fr auto 1fr auto 1fr (со стрелками).
 * - Таймер с progress bar.
 * - "Готово!" → /child/calm.
 */
export const NowNext: React.FC = () => {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(TOTAL_DURATION * 60);
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
    speak(running ? 'Таймер на паузе' : 'Таймер запущен');
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progressPct = ((TOTAL_DURATION * 60 - remaining) / (TOTAL_DURATION * 60)) * 100;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex items-center gap-2.5 px-5 pt-1 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Таймер</div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-1.5 items-stretch px-5 pt-4">
        {SCHEDULE.map((item, i) => (
          <React.Fragment key={item.id}>
            <button
              type="button"
              onClick={() => speak(item.text)}
              className="rounded-2xl p-3 flex flex-col items-center justify-center gap-2 min-h-[140px] border-0 shadow-card active:scale-[0.97] transition-transform"
              style={{ background: item.gradient }}
              aria-label={`${item.label}: ${item.text}`}
            >
              <span className="text-xs font-bold text-muted">{item.label}</span>
              <div className="w-14 h-14 rounded-3xl bg-white flex items-center justify-center">
                <item.Icon size={42} />
              </div>
              <span className={`text-sm font-black text-center ${item.textColor}`}>{item.text}</span>
            </button>
            {i < SCHEDULE.length - 1 && (
              <div className="flex items-center justify-center px-1">
                <span className="text-2xl font-black text-teal" aria-hidden="true">→</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Timer card */}
      <div
        className="mx-5 mt-5 rounded-3xl p-6 text-center border-0 shadow-card"
        style={{ background: 'linear-gradient(135deg, #F0EBFF 0%, #E0D6F7 100%)' }}
      >
        <p className="text-sm font-bold text-purple mb-3">Сейчас идёт</p>
        <div className="text-5xl font-black text-purple tabular-nums mb-4">
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
              : 'text-white shadow-card'
          }`}
          style={!running ? { background: 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)' } : {}}
        >
          {running ? 'Пауза' : remaining === 0 ? 'Готово!' : 'Запустить таймер'}
        </button>
      </div>

      <button
        onClick={() => navigate('/child/calm')}
        className="mx-5 mt-auto w-[calc(100%-2.5rem)] py-5 text-white font-black rounded-2xl text-lg shadow-card flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)' }}
      >
        Готово! <span className="text-2xl" aria-hidden="true">✓</span>
      </button>

      <p className="px-5 mt-2 text-center text-sm text-muted">
        Когда время выйдет — взрослый нажмёт «Готово», и мы перейдём в спокойный режим.
      </p>

      <div style={{ height: 12 }} />
    </div>
  );
};