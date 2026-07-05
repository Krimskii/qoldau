import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import {
  Breath2DIcon,
  Play2DIcon,
  Mom2DIcon,
  Pause2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';
import { formatDuration } from '@/utils/formatDuration';
import { triggerHaptic } from '@/lib/feedback/haptics';

const TIMER_SECONDS = 60;
// Mock-длительность «аудио от мамы» — имитирует воспроизведение без реального файла.
const MOCK_AUDIO_DURATION = 18;

interface CalmCard {
  id: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  go?: string;
}

const CalmTile: React.FC<{ c: CalmCard; onClick: () => void }> = ({
  c,
  onClick,
}) => {
  const family = CHILD_FAMILY_STYLES[c.family];
  const handle = () => {
    triggerHaptic('tap');
    onClick();
  };
  return (
    <button
      onClick={handle}
      className="flex items-center justify-center bg-white rounded-[24px] shadow-card cursor-pointer aspect-square w-full min-h-[110px] transition-transform active:scale-[0.96] qoldau-tap-ring"
      aria-label={c.id}
    >
      <div className={`w-[80px] h-[80px] rounded-[20px] ${family.icoBg} flex items-center justify-center`}>
        <c.Icon size={60} animated={false} />
      </div>
    </button>
  );
};

/**
 * CalmMode — минималистичный экран паузы (v1.5+).
 *
 * v1.5+ bugfix: убраны «облачное» mascot, заголовок «Можно отдохнуть»,
 * «Ты в безопасности · Я рядом», подзаголовки-параграфы, блок
 * «Голос мамы» (отдельная карточка с прогрессом), footer-кнопка
 * «На главную» и soft disclaimer. Остались:
 *   - Таймер (1 минута) + кнопки «Спокойно»/«Выйти»
 *   - 4 плитки: Таймер / Запись (аудио) / Дыхание / Позвать маму
 *   - Минимальный header: только кнопка «назад»
 */
export const CalmMode: React.FC = () => {
  const navigate = useNavigate();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [audioProgress, setAudioProgress] = useState(0);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  useEffect(() => {
    if (audioState !== 'playing') {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      return;
    }
    audioIntervalRef.current = setInterval(() => {
      setAudioProgress((p) => {
        if (p + 1 >= MOCK_AUDIO_DURATION) {
          if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          setAudioState('idle');
          return MOCK_AUDIO_DURATION;
        }
        return p + 1;
      });
    }, 1000);
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [audioState]);

  const toggleAudio = () => {
    if (audioState === 'idle') {
      setAudioProgress(0);
      setAudioState('playing');
    } else if (audioState === 'playing') {
      setAudioState('paused');
    } else {
      setAudioState('playing');
    }
  };

  const stopAudio = () => {
    setAudioState('idle');
    setAudioProgress(0);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
  };
  void stopAudio;

  const handleTileClick = (c: CalmCard) => {
    if (c.id === 'timer') {
      // Кнопка-таймер — стартует/останавливает секундомер в верхней карточке.
      if (startedAt === null) handleStart();
      else handleFinish(false);
      return;
    }
    if (c.id === 'recording') {
      toggleAudio();
      return;
    }
    if (c.go) navigate(c.go);
  };

  const handleStart = () => {
    const now = Date.now();
    setStartedAt(now);
    setRemaining(TIMER_SECONDS);
    const evt = addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'calm_mode',
      title: 'Calm Mode',
      description: 'Ребёнок вошёл в Calm Mode',
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { startedAt: new Date(now).toISOString() },
    });
    setCurrentEventId(evt.id);
  };

  const handleFinish = (calmer: boolean) => {
    if (currentEventId && startedAt) {
      const durationSec = Math.round((Date.now() - startedAt) / 1000);
      updateEvent(currentEventId, {
        description: calmer
          ? `Ребёнок вышел из Calm Mode спокойнее (${durationSec} сек)`
          : `Ребёнок вышел из Calm Mode досрочно (${durationSec} сек)`,
        payload: {
          startedAt: new Date(startedAt).toISOString(),
          durationSec,
          calmer,
          source: 'calm_mode',
        },
      });
    }
    showToast(calmer ? 'Отмечено: спокойнее' : 'Вышли из паузы', 'success');
    navigate('/child/home');
  };

  // 4 плитки — 2×2: Таймер / Запись / Дыхание / Позвать маму.
  const CALM_TILES: CalmCard[] = [
    { id: 'timer',     Icon: Pause2DIcon,  family: 'feel' },
    { id: 'recording', Icon: Play2DIcon,   family: 'fav'  },
    { id: 'breath',    Icon: Breath2DIcon, family: 'need' },
    { id: 'call-mom',  Icon: Mom2DIcon,    family: 'help', go: '/child/home' },
  ];

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div
      className="px-5 pt-2 pb-4 min-h-[calc(100vh-80px)] text-center"
      style={{
        background: 'linear-gradient(180deg, #eaf4fb 0%, #f0f7fb 60%, #f4f8f8 100%)',
      }}
    >
      {/* Header — только кнопка назад. */}
      <div className="flex items-center pt-1.5 pb-1">
        <button
          onClick={() => {
            triggerHaptic('tap');
            navigate('/child/home');
          }}
          className="w-9 h-9 rounded-[12px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors active:scale-[0.94] qoldau-tap-ring"
          aria-label="Назад"
        >
          <BackArrowIcon size={18} />
        </button>
      </div>

      {/* Timer card — единый блок с большим таймером и кнопками. */}
      <div className="bg-white rounded-3xl p-5 mt-3 shadow-card">
        <div className="text-[56px] font-black tabular-nums tracking-tight leading-none" style={{ color: '#0d5c5c' }}>
          {startedAt === null ? '1:00' : `${minutes}:${String(seconds).padStart(2, '0')}`}
        </div>
        {startedAt === null ? (
          <button
            onClick={() => {
              triggerHaptic('tap');
              handleStart();
            }}
            className="mt-4 w-full min-h-[56px] border-0 rounded-[18px] text-white text-[18px] font-black cursor-pointer active:scale-[0.96] transition-transform qoldau-tap-ring"
            style={{
              background: '#1ba39a',
              boxShadow: '0 8px 20px rgba(27,163,154,0.28)',
            }}
            aria-label="Начать"
          >
            ▶
          </button>
        ) : (
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                triggerHaptic('success');
                handleFinish(true);
              }}
              className="w-12 h-12 rounded-full bg-green-soft text-green flex items-center justify-center hover:bg-[#d6f1e0] transition-colors active:scale-[0.92] qoldau-tap-ring"
              aria-label="Спокойно"
            >
              ✓
            </button>
            <button
              onClick={() => {
                triggerHaptic('tap');
                handleFinish(false);
              }}
              className="w-12 h-12 rounded-full bg-white border-2 border-line text-muted flex items-center justify-center hover:bg-bg transition-colors active:scale-[0.92] qoldau-tap-ring"
              aria-label="Выйти"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 4 плитки: 2×2 (Таймер / Запись / Дыхание / Позвать маму) — без надписей. */}
      <div className="grid grid-cols-2 gap-3.5 px-0 pt-4">
        {CALM_TILES.map((c) => (
          <CalmTile
            key={c.id}
            c={c}
            onClick={() => handleTileClick(c)}
          />
        ))}
      </div>

      {/* Мини-прогресс «Запись» — без отдельной карточки. */}
      {audioState !== 'idle' && (
        <div className="mt-4 px-2 text-[11px] text-muted text-center tabular-nums">
          {formatDuration(audioProgress)} / {formatDuration(MOCK_AUDIO_DURATION)}
        </div>
      )}

      <div style={{ height: 12 }} />
    </div>
  );
};