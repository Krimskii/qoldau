import React, { useMemo } from 'react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

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

  const achievements = [
    { id: 'water', label: 'Попросил воду', emoji: '💧', done: stats.aac > 0 },
    { id: 'toilet', label: 'Попросил туалет', emoji: '🚽', done: stats.aac > 1 },
    { id: 'phrase', label: 'Собрал фразу', emoji: '💬', done: stats.phrases > 0 },
    { id: 'pause', label: 'Использовал паузу', emoji: '☁️', done: stats.calm > 0 },
  ];

  const topCards = [
    { id: '1', label: 'Вода', emoji: '💧', count: stats.aac > 0 ? stats.aac : 3 },
    { id: '2', label: 'Туалет', emoji: '🚽', count: 2 },
    { id: '3', label: 'Играть', emoji: '🎈', count: 2 },
  ];

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Праздничная карточка */}
      <div className="bg-gradient-to-br from-[#FFFDF4] via-[#FFFCEC] to-white border-2 border-[#f2e1b6] rounded-3xl p-6 text-center">
        <div className="text-4xl" aria-hidden="true">🎉</div>
        <strong className="text-lg font-black block mt-1">Сегодня получилось!</strong>
        <div className="text-8xl my-3" aria-hidden="true">⭐</div>
        <p className="text-sm text-muted">{stats.total} событий за неделю</p>
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
                  ? 'border-teal/30 bg-teal-soft/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]'
                  : 'border-line opacity-60'
              }`}
            >
              <span className="text-4xl" aria-hidden="true">
                {a.emoji}
              </span>
              <span className="text-sm font-bold text-ink text-center leading-tight">
                {a.label}
              </span>
              {a.done ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green to-[#1e7a52] flex items-center justify-center text-white text-sm font-black mt-1 shadow-sm">
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
          <span aria-hidden="true">⭐</span> Любимые карточки
        </h3>
        {topCards.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
              <span className="text-sm font-bold">{c.label}</span>
            </div>
            <span className="text-sm font-black text-teal">{c.count} раз</span>
          </div>
        ))}
      </div>

      {/* Молодец! */}
      <div className="mt-auto rounded-2xl bg-gradient-to-r from-[#bff2d3] to-[#79dba2] p-5 font-black text-xl text-[#185d36] flex items-center justify-center gap-3 shadow-card">
        <span className="text-3xl" aria-hidden="true">🏆</span>
        Молодец!
        <span className="text-base font-bold">Ты отлично справился!</span>
      </div>

      <p className="text-xs text-muted text-center italic">
        Только позитивная динамика. Это профиль достижений, не оценка.
      </p>
    </div>
  );
};