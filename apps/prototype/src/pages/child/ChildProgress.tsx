import React from 'react';

const achievements = [
  { id: 'water', label: 'Попросил воду', emoji: '💧', done: true },
  { id: 'toilet', label: 'Попросил туалет', emoji: '🚽', done: true },
  { id: 'phrase', label: 'Попробовал фразу', emoji: '💬', done: true },
  { id: 'pause', label: 'Сделал паузу', emoji: '☁️', done: true },
];

export const ChildProgress: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Celebration Card */}
      <div className="bg-gradient-to-br from-[#fffdf4] to-white border border-[#f2e1b6] rounded-2xl p-4 text-center">
        <div className="text-3xl">🎉</div>
        <strong className="text-base">Сегодня получилось!</strong>
        <div className="text-7xl my-3">⭐</div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {achievements.map((a) => (
          <div key={a.id} className="bg-[#f8fbff] border border-[#dce9f4] rounded-2xl min-h-[98px] flex flex-col items-center justify-center gap-1 p-2 text-xs font-bold text-[#315171]">
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

      {/* Bravo */}
      <div className="mt-2 rounded-2xl bg-gradient-to-r from-[#bff2d3] to-[#79dba2] p-4 font-black text-xl text-[#185d36] flex items-center justify-center gap-2">
        🏆 Молодец! <span className="text-base">Ты отлично справился!</span>
      </div>
    </div>
  );
};
