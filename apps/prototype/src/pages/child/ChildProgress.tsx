import React, { useMemo } from 'react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

export const ChildProgress: React.FC = () => {
  const { events } = useEventStore();

  const stats = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id);
    const last7Days = childEvents.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return Date.now() - t < 7 * 24 * 60 * 60 * 1000;
    });
    const aac = last7Days.filter((e) => e.type === 'aac_card').length;
    const phrases = last7Days.filter((e) => e.type === 'phrase').length;
    const calm = last7Days.filter((e) => e.type === 'calm_mode').length;
    const sos = last7Days.filter((e) => e.type === 'sos').length;
    return { aac, phrases, calm, sos, total: last7Days.length };
  }, [events]);

  const achievements = [
    { id: 'water', label: 'Попросил воду', emoji: '💧', done: stats.aac > 0 },
    { id: 'toilet', label: 'Попросил туалет', emoji: '🚽', done: stats.aac > 1 },
    { id: 'phrase', label: 'Собрал фразу', emoji: '💬', done: stats.phrases > 0 },
    { id: 'pause', label: 'Использовал паузу', emoji: '☁️', done: stats.calm > 0 },
  ];

  const topCards = [
    { id: '1', label: 'Вода', count: stats.aac > 0 ? stats.aac : 3 },
    { id: '2', label: 'Туалет', count: 2 },
    { id: '3', label: 'Играть', count: 2 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Celebration Card */}
      <div className="bg-gradient-to-br from-[#fffdf4] to-white border border-[#f2e1b6] rounded-2xl p-4 text-center">
        <div className="text-3xl">🎉</div>
        <strong className="text-base">Сегодня получилось!</strong>
        <div className="text-7xl my-3">⭐</div>
        <p className="text-sm text-muted">{stats.total} событий за неделю</p>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {achievements.map((a) => (
          <div
            key={a.id}
            className="bg-[#f8fbff] border border-[#dce9f4] rounded-2xl min-h-[100px] flex flex-col items-center justify-center gap-1 p-2 text-xs font-bold text-[#315171]"
          >
            <span className="text-3xl">{a.emoji}</span>
            {a.label}
            {a.done && (
              <div className="w-6 h-6 rounded-full bg-[#35bd70] flex items-center justify-center text-white mt-1">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top cards */}
      <div className="bg-white border border-line rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-3">Любимые карточки</h4>
        {topCards.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0"
          >
            <span className="text-sm font-bold">{c.label}</span>
            <span className="text-xs font-bold text-teal">{c.count} раз</span>
          </div>
        ))}
      </div>

      {/* Bravo */}
      <div className="mt-2 rounded-2xl bg-gradient-to-r from-[#bff2d3] to-[#79dba2] p-4 font-black text-xl text-[#185d36] flex items-center justify-center gap-2">
        🏆 Молодец!
        <span className="text-base">Ты отлично справился!</span>
      </div>

      <p className="text-xs text-muted text-center italic">
        Только позитивная динамика. Это профиль достижений, не оценка.
      </p>
    </div>
  );
};