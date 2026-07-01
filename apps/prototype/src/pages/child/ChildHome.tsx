import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { mockChild } from '@/data/mockChild';

const actions = [
  { id: 'water', label: 'Хочу пить', emoji: '💧', color: 'bg-[#e5f4ff]' },
  { id: 'toilet', label: 'Туалет', emoji: '🚽', color: 'bg-[#f2ecff]' },
  { id: 'help', label: 'Помощь', emoji: '✋', color: 'bg-[#ffecec]' },
  { id: 'pause', label: 'Пауза', emoji: '⏸', color: 'bg-[#fff2d7]' },
  { id: 'favorites', label: 'Любимые', emoji: '⭐', color: 'bg-[#fff3ce]' },
  { id: 'speak', label: 'Сказать', emoji: '🎙', color: 'bg-[#e3fbf8]' },
];

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <button className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#53677e]" />
        </button>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ffe7be] to-[#e4f8ff] flex items-center justify-center text-5xl border border-[#d4e8f7]">
          👦
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight">Привет, {mockChild.name}!</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e7faee] text-[#158647] font-bold text-sm mt-1">
            <span>☺</span> Я в порядке
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.id === 'favorites') navigate('/child/favorites');
              else if (action.id === 'speak') navigate('/child/speak');
              else if (action.id === 'pause') navigate('/child/calm');
              else if (action.id === 'water') navigate('/child/cards');
            }}
            className={`min-h-[86px] rounded-xl border border-[rgba(60,106,151,0.15)] ${action.color} flex flex-col items-center justify-center gap-2 p-2 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px_rgba(42,73,108,0.05)]`}
          >
            <span className="text-3xl leading-none">{action.emoji}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Now/Next */}
      <div className="mt-4 grid grid-cols-[1fr_1px_1fr] bg-gradient-to-r from-[#edfff4] to-[#f3ebff] border border-[#dce9f4] rounded-2xl overflow-hidden min-h-[72px]">
        <div className="flex items-center justify-center gap-2 font-black text-[#163b62]">
          <span className="text-3xl">☀</span>Сейчас
        </div>
        <div className="bg-[#b5c9df]" />
        <div className="flex items-center justify-center gap-2 font-black text-[#163b62]">
          Потом<span className="text-3xl">☾</span>
        </div>
      </div>
    </div>
  );
};
