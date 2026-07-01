import React, { useMemo } from 'react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { AchievementCard } from '@/components/game/AchievementCard';
import { DailyProgressStrip } from '@/components/game/DailyProgressStrip';
import { SparkleIcon, WaterIcon, ToiletIcon, HugIcon } from '@/components/icons';
import { computeAchievements } from '@/lib/game/achievementRules';

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

  const topCards = [
    { id: '1', label: 'Вода', Icon: WaterIcon, iconColor: 'text-[#1c6cb8]', count: stats.aac > 0 ? stats.aac : 3 },
    { id: '2', label: 'Туалет', Icon: ToiletIcon, iconColor: 'text-[#5a3eb4]', count: 2 },
    { id: '3', label: 'Играть', Icon: HugIcon, iconColor: 'text-[#158647]', count: 2 },
  ];

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Celebratory hero */}
      <div className="bg-gradient-to-br from-[#FFFCEC] via-[#FFF8F0] to-[#EAF5FF] border-2 border-[#f2e1b6] rounded-3xl p-6 text-center">
        <div className="flex justify-center mb-2">
          <SuccessSparkle className="w-20 h-20" />
        </div>
        <strong className="text-lg font-black block mt-1 text-[#102544]">
          Ты молодец!
        </strong>
        <p className="text-sm text-muted mt-1">{stats.total} событий за неделю</p>
      </div>

      {/* Daily Progress Strip — горизонтальный soft strip */}
      <div>
        <h3 className="text-sm font-black text-ink-2 mb-2 px-1">Что сегодня получилось</h3>
        <DailyProgressStrip achievements={achievements} />
      </div>

      {/* Achievements — 2×2 через AchievementCard */}
      <div>
        <h3 className="text-sm font-black text-ink-2 mb-2 px-1">Все достижения</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => (
            <AchievementCard key={a.rule.id} achievement={a} />
          ))}
        </div>
      </div>

      {/* Любимые карточки */}
      <div className="bg-white border-2 border-line rounded-2xl p-4">
        <h3 className="text-sm font-black text-ink-2 mb-3 flex items-center gap-2">
          <SparkleIcon size={16} className="text-[#E3A62F]" />
          Любимые карточки
        </h3>
        {topCards.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0"
          >
            <div className="flex items-center gap-3">
              <c.Icon size={26} className={c.iconColor} />
              <span className="text-sm font-bold">{c.label}</span>
            </div>
            <span className="text-sm font-black text-teal">{c.count} раз</span>
          </div>
        ))}
      </div>

      {/* Поддерживающее завершение */}
      <div className="mt-auto rounded-2xl bg-gradient-to-r from-[#EAF8F0] to-[#DDF5F0] p-5 font-black text-xl text-[#185d36] flex flex-col items-center justify-center gap-1.5 shadow-card">
        <SparkleIcon size={26} className="text-[#185d36]" />
        <span>У тебя получается</span>
        <span className="text-sm font-bold opacity-90">Спасибо, что показал</span>
      </div>

      <p className="text-xs text-muted text-center italic">
        Только позитивная динамика. Это профиль достижений, не оценка.
      </p>
    </div>
  );
};