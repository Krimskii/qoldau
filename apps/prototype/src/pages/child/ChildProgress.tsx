import React, { useMemo } from 'react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { AchievementCard } from '@/components/game/AchievementCard';
import { DailyProgressStrip } from '@/components/game/DailyProgressStrip';
import { QoldauCard } from '@/components/ui/QoldauCard';
import {
  Water2DIcon,
  Toilet2DIcon,
  Play2DIcon,
  Hug2DIcon,
  Sparkle2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';
import { computeAchievements } from '@/lib/game/achievementRules';

interface TopCard {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
  count: number;
}

export const ChildProgress: React.FC = () => {
  const { events } = useEventStore();

  const stats = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id);
    const last7 = childEvents.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return Date.now() - t < 7 * 24 * 60 * 60 * 1000;
    });
    return {
      aac: last7.filter((e) => e.type === 'aac_card').length,
      phrases: last7.filter((e) => e.type === 'phrase').length,
      calm: last7.filter((e) => e.type === 'calm_mode').length,
      sos: last7.filter((e) => e.type === 'sos').length,
      total: last7.length,
    };
  }, [events]);

  const achievements = useMemo(
    () => computeAchievements(events, DEMO_PRIMARY_CHILD.id, 7),
    [events],
  );

  const topCards: TopCard[] = [
    { id: '1', label: 'Вода',    Icon: Water2DIcon,  family: 'need', count: stats.aac > 0 ? stats.aac : 3 },
    { id: '2', label: 'Туалет',  Icon: Toilet2DIcon, family: 'need', count: 2 },
    { id: '3', label: 'Играть',  Icon: Play2DIcon,   family: 'do',   count: 2 },
    { id: '4', label: 'Обниматься', Icon: Hug2DIcon, family: 'feel', count: stats.phrases },
  ];

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Hero — celebratory tinted card */}
      <QoldauCard variant="tinted-yellow" padding="lg" className="text-center mx-5">
        <div className="flex justify-center mb-2">
          <SuccessSparkle className="w-20 h-20" />
        </div>
        <strong className="text-lg font-black block mt-1 text-ink">
          Ты молодец!
        </strong>
        <p className="text-sm text-muted mt-1">{stats.total} событий за неделю</p>
      </QoldauCard>

      {/* Daily progress strip */}
      <div className="px-5">
        <h3 className="text-sm font-black text-ink-2 mb-2">Что сегодня получилось</h3>
        <DailyProgressStrip achievements={achievements} />
      </div>

      {/* Achievements grid 2x2 */}
      <div className="px-5">
        <h3 className="text-sm font-black text-ink-2 mb-2">Все достижения</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => (
            <AchievementCard key={a.rule.id} achievement={a} />
          ))}
        </div>
      </div>

      {/* Top cards — 3-col grid с 2D иконками */}
      <div className="px-5">
        <h3 className="text-sm font-black text-ink-2 mb-2 flex items-center gap-2">
          <Sparkle2DIcon size={20} className="" />
          Любимые карточки
        </h3>
        <div className="grid grid-cols-4 gap-2.5">
          {topCards.map((c) => {
            const family = CHILD_FAMILY_STYLES[c.family];
            return (
              <div
                key={c.id}
                className="flex flex-col items-center gap-1.5 p-2 bg-white rounded-3xl shadow-card"
              >
                <div className={`w-12 h-12 rounded-[18px] ${family.icoBg} flex items-center justify-center`}>
                  <c.Icon size={36} />
                </div>
                <span className={`text-[11px] font-black text-center leading-tight ${family.lbl}`}>
                  {c.label}
                </span>
                <span className="text-[10px] font-bold text-teal">{c.count}×</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Поддерживающее завершение */}
      <QoldauCard
        variant="tinted-green"
        padding="md"
        className="mx-5 text-center flex flex-col items-center gap-1.5"
      >
        <Hug2DIcon size={32} className="" />
        <span className="font-black text-xl text-green-dark">У тебя получается</span>
        <span className="text-sm font-bold opacity-90 text-green-dark">Спасибо, что показал</span>
      </QoldauCard>

      <p className="px-5 text-xs text-muted text-center italic">
        Только позитивная динамика. Это профиль достижений, не оценка.
      </p>

      <div style={{ height: 12 }} />
    </div>
  );
};