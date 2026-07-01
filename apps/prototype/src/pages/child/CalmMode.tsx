import React from 'react';
import { useNavigate } from 'react-router-dom';

const calmOptions = [
  { id: 'music', label: 'Тихая музыка', emoji: '🎵' },
  { id: 'breath', label: 'Дыхание', emoji: '〰️' },
  { id: 'hug', label: 'Объятие', emoji: '💗' },
  { id: 'headphones', label: 'Наушники', emoji: '🎧' },
  { id: 'dark', label: 'Темно', emoji: '🌙', dark: true },
  { id: 'pause', label: 'Пауза', emoji: '⏸' },
];

export const CalmMode: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <div className="text-5xl mb-3">☁️</div>
        <h2 className="text-lg font-black text-[#143259]">Можно отдохнуть</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {calmOptions.map((option) => (
          <button
            key={option.id}
            className={`min-h-[88px] rounded-xl border border-[#d8e8f3] ${option.dark ? 'bg-gradient-to-br from-[#234a86] to-[#0e2b5b] text-white' : 'bg-gradient-to-br from-[#f7fbff] to-[#ecf7ff] text-[#163760]'} flex flex-col items-center justify-center gap-2 text-sm font-black`}
          >
            <span className="text-3xl">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-center font-black text-[#2c5e9e] mt-4">
        Ты в безопасности <span className="text-[#ff7e9b]">❤</span>
      </p>
    </div>
  );
};
