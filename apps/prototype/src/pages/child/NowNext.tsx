import React from 'react';
import { useNavigate } from 'react-router-dom';

const schedule = [
  { id: '1', label: 'Сейчас', text: 'Занятие', emoji: '☀', color: 'bg-gradient-to-br from-[#edfff4] to-[#ddf5f0]', active: true },
  { id: '2', label: 'Потом', text: 'Перекус', emoji: '🍎', color: 'bg-gradient-to-br from-[#fff8e1] to-[#fff3ce]' },
  { id: '3', label: 'После', text: 'Прогулка', emoji: '🌳', color: 'bg-gradient-to-br from-[#e3fbf8] to-[#cdf0ff]' },
  { id: '4', label: 'Затем', text: 'Отдых', emoji: '☾', color: 'bg-gradient-to-br from-[#f3ebff] to-[#e3dff7]' },
];

export const NowNext: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="text-3xl font-black text-[#203a60]"
          aria-label="Назад"
        >
          ‹
        </button>
        <h2 className="text-lg font-black text-[#143259]">Сейчас и потом</h2>
        <div className="w-8" />
      </div>

      <p className="text-sm text-muted text-center px-2">
        Что будем делать по очереди. Когда закончим — взрослый нажмёт «Готово».
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {schedule.map((item) => (
          <div
            key={item.id}
            className={`${item.color} border border-line rounded-2xl p-5 flex items-center gap-4 ${
              item.active ? 'shadow-card-soft ring-2 ring-teal' : 'opacity-90'
            }`}
          >
            <div className="text-4xl">{item.emoji}</div>
            <div className="flex-1">
              <p className="text-xs text-muted font-bold">{item.label}</p>
              <p className="text-lg font-black text-ink">{item.text}</p>
            </div>
            {item.active && (
              <span className="px-3 py-1 rounded-full bg-teal text-white text-xs font-bold">
                Сейчас
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/child/calm')}
        className="w-full py-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-black rounded-2xl text-lg shadow-card hover:shadow-card-soft transition-shadow mt-2"
      >
        Готово ✓
      </button>
    </div>
  );
};