import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import {
  Music2DIcon,
  Breath2DIcon,
  Headphones2DIcon,
  Pause2DIcon,
  Dark2DIcon,
  Mom2DIcon,
  ChildCloudMascot,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';

const TIMER_SECONDS = 60;

interface CalmCard {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  go?: string;
}

const CALM_ROW_1: CalmCard[] = [
  { id: 'music',     label: 'Тихая музыка', Icon: Music2DIcon,     family: 'fav'  },
  { id: 'breath',    label: 'Дыхание',      Icon: Breath2DIcon,    family: 'need' },
  { id: 'head',      label: 'Наушники',     Icon: Headphones2DIcon, family: 'do'   },
];
const CALM_ROW_2: CalmCard[] = [
  { id: 'pause',     label: 'Пауза',        Icon: Pause2DIcon,     family: 'feel' },
  { id: 'dark',      label: 'Темно',        Icon: Dark2DIcon,      family: 'need' },
  { id: 'call-mom',  label: 'Позвать маму', Icon: Mom2DIcon,       family: 'help', go: '/child/home' },
];

const CalmTile: React.FC<{ c: CalmCard; delay: number; onClick: () => void }> = ({
  c,
  delay,
  onClick,
}) => {
  const family = CHILD_FAMILY_STYLES[c.family];
  return (
    <button
      onClick={onClick}
      className="qoldau-icon-pop flex flex-col items-center gap-2.5 px-2 py-4 bg-white rounded-3xl shadow-card cursor-pointer min-h-[120px] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.94]"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={c.label}
    >
      <div className={`w-14 h-14 rounded-[18px] ${family.icoBg} flex items-center justify-center`}>
        <c.Icon size={46} />
      </div>
      <div className={`text-sm font-black text-center leading-tight ${family.lbl}`}>
        {c.label}
      </div>
    </button>
  );
};

/**
 * CalmMode — самый спокойный экран (v0.3.15).
 *
 * Структура (как в child_v2.html):
 * - Back button.
 * - CloudMascot (124×124, cloudFloat анимация).
 * - "Можно отдохнуть" + "Ты в безопасности · Я рядом".
 * - Timer card + "Начать" big-btn + "Вернуться на главную" link.
 * - 6 calm options в 2×3 сетке.
 * - "Я рядом 💚" footer note.
 */
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
      'success',
    );
    navigate('/child/home');
  };

  const handleExitToHome = () => {
    if (currentEventId) {
      updateEvent(currentEventId, {
        description: 'Calm Mode прерван. Выход.',
        payload: {
          startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
          finishedAt: new Date().toISOString(),
          duration: TIMER_SECONDS - remaining,
          interrupted: true,
        },
      });
    }
    navigate('/child/home');
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div
      className="-mx-5 -mt-2 px-5 pt-2 pb-4 rounded-t-3xl min-h-[calc(100vh-80px)] text-center"
      style={{
        background: 'linear-gradient(180deg, #eaf4fb 0%, #f0f7fb 60%, #f4f8f8 100%)',
      }}
    >
      {/* Back button (no title для calm — minimalist) */}
      <div className="flex items-center gap-2.5 pt-3.5 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
      </div>

      {/* Cloud mascot */}
      <div className="mx-auto w-[124px] h-[124px] mt-6 mb-1.5">
        <ChildCloudMascot size={124} animated />
      </div>

      <h2 className="text-[26px] mt-1.5 mb-0.5 font-black">Можно отдохнуть</h2>
      <div className="font-bold mb-[18px]" style={{ color: '#12807a' }}>
        Ты в безопасности · Я рядом
      </div>

      {/* Timer card */}
      <div className="bg-white rounded-3xl p-5 mx-5 shadow-card text-left">
        {startedAt === null ? (
          <div className="flex flex-col items-center gap-3">
            <p className="m-0 mb-0 text-ink-soft font-semibold text-sm">
              Таймер на 1 минуту. В любой момент можно выйти.
            </p>
            <button
              onClick={handleStart}
              className="w-full border-0 rounded-[18px] py-[18px] text-white text-[18px] font-black cursor-pointer"
              style={{
                background: '#1ba39a',
                boxShadow: '0 8px 20px rgba(27,163,154,0.28)',
              }}
            >
              Начать (1 минута)
            </button>
            <button
              onClick={handleExitToHome}
              className="bg-transparent border-0 font-bold mt-3 cursor-pointer text-[15px]"
              style={{ color: '#12807a' }}
            >
              Вернуться на главную
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="text-[44px] font-black tabular-nums tracking-tight"
              style={{ color: '#0d5c5c' }}
              aria-live="polite"
            >
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted mt-2">Спокойно и ровно</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => handleFinish(true)}
                className="px-5 py-3 rounded-full bg-green-soft text-green font-bold hover:bg-[#d6f1e0] transition-colors"
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

      {/* 6 calm options: 2×3 */}
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-4">
        {CALM_ROW_1.map((c, i) => (
          <CalmTile
            key={c.id}
            c={c}
            delay={i * 60}
            onClick={() => {
              if (c.go) navigate(c.go);
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-1.5">
        {CALM_ROW_2.map((c, i) => (
          <CalmTile
            key={c.id}
            c={c}
            delay={180 + i * 60}
            onClick={() => {
              if (c.go) navigate(c.go);
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center font-bold mt-4 mb-2" style={{ color: '#12807a' }}>
        Я рядом <span aria-hidden="true">💚</span>
      </div>

      <div style={{ height: 12 }} />
    </div>
  );
};