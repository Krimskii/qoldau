import React, { useMemo } from 'react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import {
  WaterIcon,
  ToiletIcon,
  HugIcon,
  MoonIcon,
  SparkleIcon,
  type IconProps,
} from '@/components/icons';

interface AchievementItem {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  iconColor: string;
  done: boolean;
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

  const achievements: AchievementItem[] = [
    { id: 'water', label: 'Попросил воду', Icon: WaterIcon, iconColor: 'text-[#1c6cb8]', done: stats.aac > 0 },
    { id: 'toilet', label: 'Попросил туалет', Icon: ToiletIcon, iconColor: 'text-[#5a3eb4]', done: stats.aac > 1 },
    { id: 'phrase', label: 'Собрал фразу', Icon: HugIcon, iconColor: 'text-[#cc251d]', done: stats.phrases > 0 },
    { id: 'pause', label: 'Использовал паузу', Icon: MoonIcon, iconColor: 'text-[#5a3eb4]', done: stats.calm > 0 },
  ];

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

      {/* Достижения — 2×2 */}
      <div>
        <h3 className="text-sm font-black text-ink-2 mb-2 px-1">Что получилось</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`bg-white border-2 rounded-2xl min-h-[110px] flex flex-col items-center justify-center gap-2 p-3 transition-shadow ${
                a.done
                  ? 'border-teal/30 bg-[#EAF8F0]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]'
                  : 'border-line opacity-60'
              }`}
            >
              <a.Icon size={40} className={a.done ? a.iconColor : 'text-muted'} />
              <span className="text-sm font-bold text-ink text-center leading-tight">
                {a.label}
              </span>
              {a.done ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4EC28A] to-[#1e7a52] flex items-center justify-center text-white text-sm font-black mt-1 shadow-sm">
                  ✓
                </div>
              ) : (
                <span className="text-xs text-muted">Скоро!</span>
              )}
            </div>
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