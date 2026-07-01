import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { QoldauIconCard, type QoldauIconColor } from '@/components/ui/QoldauIconCard';
import { CalmPanel } from '@/components/ui/CalmPanel';
import { SectionCard } from '@/components/ui/SectionCard';
import { PrimaryAction } from '@/components/ui/Primitives';
import {
  MusicSoftIcon,
  BreathIcon,
  HeadphonesSoftIcon,
  MoonIcon,
  PauseSoftIcon,
  HugSoftIcon,
  type IconProps,
} from '@/components/icons';

const TIMER_SECONDS = 60;

interface CalmOption {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  color: QoldauIconColor;
  path?: string;
}

// 6 спокойных опций — единый QoldauIconCard для визуального порядка.
const OPTIONS: CalmOption[] = [
  { id: 'music', label: 'Музыка', Icon: MusicSoftIcon, color: 'purple' },
  { id: 'breath', label: 'Дыхание', Icon: BreathIcon, color: 'blue' },
  { id: 'headphones', label: 'Наушники', Icon: HeadphonesSoftIcon, color: 'green' },
  { id: 'pause', label: 'Пауза', Icon: PauseSoftIcon, color: 'yellow' },
  { id: 'dark', label: 'Темно', Icon: MoonIcon, color: 'teal' },
  { id: 'call-mom', label: 'Позвать маму', Icon: HugSoftIcon, color: 'coral', path: '/child/call' },
];

/**
 * CalmMode — самый спокойный экран Qoldau.
 *
 * Структура:
 * - CalmPanel: gradient фон + CloudMascot + поддерживающий текст.
 * - Карточка таймера / старта.
 * - 6 опций спокойствия в сетке 3×2.
 * - Footer note «Я рядом».
 *
 * Без анимаций > 360ms, без резких переходов.
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
    <CalmPanel
      title={startedAt === null ? 'Можно отдохнуть' : 'Дыши спокойно'}
      subtitle={startedAt === null ? 'Ты в безопасности · Я рядом' : 'В любой момент можно выйти'}
      mood={startedAt ? 'happy' : 'calm'}
      footerNote={
        <span>
          Я рядом <span className="text-[#4EC28A] text-base" aria-hidden="true">♥</span>
        </span>
      }
    >
      {/* Карточка таймера / старта */}
      <QoldauCard variant="elevated" padding="lg">
        {startedAt === null ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-ink-2 text-center leading-relaxed">
              Таймер на 1 минуту. В любой момент можно выйти.
            </p>
            <PrimaryAction
              label="Начать"
              onClick={handleStart}
              variant="primary"
              size="lg"
            />
            <button
              onClick={handleExitToHome}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="text-6xl font-black text-teal-dark tabular-nums tracking-tight"
              aria-live="polite"
            >
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted mt-2">Спокойно и ровно</p>
            <div className="mt-5 flex justify-center gap-3">
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
      </QoldauCard>

      {/* 6 опций — SectionCard для структуры */}
      <SectionCard
        title="Что поможет?"
        subtitle="Выбери, что тебе сейчас подходит"
        accent="teal"
      >
        <div className="grid grid-cols-3 gap-2.5">
          {OPTIONS.map(({ id, label, Icon, color, path }) => (
            <QoldauIconCard
              key={id}
              icon={Icon}
              label={label}
              color={color}
              size="md"
              onClick={() => {
                if (path) navigate(path);
              }}
            />
          ))}
        </div>
      </SectionCard>
    </CalmPanel>
  );
};