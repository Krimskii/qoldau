import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell } from 'lucide-react';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const actions = [
  { id: 'water', label: 'Хочу пить', emoji: '💧', color: 'bg-[#e5f4ff]', path: '/child/cards' },
  { id: 'toilet', label: 'Туалет', emoji: '🚽', color: 'bg-[#f2ecff]', path: '/child/cards' },
  { id: 'help', label: 'Помощь', emoji: '✋', color: 'bg-[#ffecec]', path: '/child/call' },
  { id: 'pause', label: 'Пауза', emoji: '⏸', color: 'bg-[#fff2d7]', path: '/child/calm' },
  { id: 'favorites', label: 'Любимые', emoji: '⭐', color: 'bg-[#fff3ce]', path: '/child/favorites' },
  { id: 'speak', label: 'Сказать', emoji: '🎙', color: 'bg-[#e3fbf8]', path: '/child/speak' },
];

const nowNext = {
  now: { label: 'Сейчас', text: 'Занятие', emoji: '☀' },
  next: { label: 'Потом', text: 'Отдых', emoji: '☾' },
};

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <button
          onClick={() => navigate('/child/progress')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Прогресс"
        >
          <Bell className="w-5 h-5 text-[#53677e]" />
        </button>
        <button
          onClick={() => navigate('/child/progress')}
          className="w-10 h-10 ml-2 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Настройки"
        >
          <Settings className="w-5 h-5 text-[#53677e]" />
        </button>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ffe7be] to-[#e4f8ff] flex items-center justify-center text-5xl border border-[#d4e8f7]">
          👦
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight">Привет, {child.name}!</div>
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
            onClick={() => navigate(action.path)}
            className={`min-h-[90px] rounded-xl border border-[rgba(60,106,151,0.15)] ${action.color} flex flex-col items-center justify-center gap-2 p-2 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px_rgba(42,73,108,0.05)] hover:scale-[0.97] transition-transform`}
          >
            <span className="text-3xl leading-none">{action.emoji}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Now/Next */}
      <button
        onClick={() => navigate('/child/now-next')}
        className="mt-2 grid grid-cols-[1fr_1px_1fr] bg-gradient-to-r from-[#edfff4] to-[#f3ebff] border border-[#dce9f4] rounded-2xl overflow-hidden min-h-[80px] hover:shadow-card-soft transition-shadow"
      >
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{nowNext.now.emoji}</span>
            <span className="text-sm text-muted">{nowNext.now.label}</span>
          </div>
          <span className="text-base">{nowNext.now.text}</span>
        </div>
        <div className="bg-[#b5c9df]" />
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{nowNext.next.label}</span>
            <span className="text-2xl">{nowNext.next.emoji}</span>
          </div>
          <span className="text-base">{nowNext.next.text}</span>
        </div>
      </button>
    </div>
  );
};