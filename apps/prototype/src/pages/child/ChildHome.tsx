import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { DinoMascot } from '@/components/illustrations/DinoMascot';

// 6 крупных кнопок как в референсе — простые слова + эмодзи, без описаний.
// Палитра — спокойные пастельные тона (см. docs/SENSORY_SAFE_DESIGN_GUIDE.md).
const ACTIONS = [
  { id: 'water', label: 'Хочу пить', emoji: '💧', color: 'bg-[#E5F4FF]', textColor: 'text-[#173760]', path: '/child/cards' },
  { id: 'toilet', label: 'Туалет', emoji: '🚽', color: 'bg-[#F2ECFF]', textColor: 'text-[#173760]', path: '/child/cards' },
  { id: 'help', label: 'Помощь', emoji: '✋', color: 'bg-[#EAF8F0]', textColor: 'text-[#173760]', path: '/child/call' },
  { id: 'pause', label: 'Пауза', emoji: '⏸', color: 'bg-[#FFF6DF]', textColor: 'text-[#173760]', path: '/child/calm' },
  { id: 'favorites', label: 'Любимые', emoji: '⭐', color: 'bg-[#F1EDFF]', textColor: 'text-[#173760]', path: '/child/favorites' },
  { id: 'speak', label: 'Сказать', emoji: '🎙', color: 'bg-[#E3FBF8]', textColor: 'text-[#173760]', path: '/child/speak' },
];

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10" />
        <button
          onClick={() => navigate('/child/progress')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Уведомления"
        >
          <Bell className="w-5 h-5 text-[#53677e]" />
        </button>
        <button
          onClick={() => navigate('/child/interface-guide')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Что важно в интерфейсе"
        >
          <Settings className="w-5 h-5 text-[#53677e]" />
        </button>
      </div>

      {/* Hero — DinoMascot + мягкое приветствие + статус */}
      <div className="flex items-center gap-4 mb-2 px-2 py-3 rounded-3xl bg-gradient-to-br from-[#F0FBFF] to-[#EAF5FF] border border-[#dceaf4]">
        <div
          className="w-24 h-24 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <DinoMascot animated className="w-24 h-24" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-black tracking-tight text-ink">
            Привет, {child.name}!
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e7faee] text-[#158647] font-bold text-sm mt-1.5">
            <span aria-hidden="true">☺</span>
            <span>Я в порядке</span>
          </div>
        </div>
      </div>

      {/* 6 крупных кнопок в сетке 3×2 — мягкие pressed states, никакого мерцания */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className={`min-h-[110px] rounded-2xl border border-[rgba(60,106,151,0.15)] ${action.color} flex flex-col items-center justify-center gap-2 p-3 text-base font-black ${action.textColor} shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px_rgba(42,73,108,0.05)] transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40`}
            aria-label={action.label}
          >
            <span className="text-4xl leading-none" aria-hidden="true">
              {action.emoji}
            </span>
            {action.label}
          </button>
        ))}
        {/* Кнопка «Выбор» — выбор 2×2, как в референсе экран 6 */}
        <button
          onClick={() => navigate('/child/choice')}
          className="col-span-3 min-h-[88px] rounded-2xl border-2 border-[#dce9f4] bg-gradient-to-r from-[#FFF6DF] to-[#F1EDFF] flex items-center justify-center gap-3 text-base font-black text-ink transition-transform duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]"
          aria-label="Выбрать из вариантов"
        >
          <span className="text-3xl" aria-hidden="true">🍌🍲⚽🚗</span>
          Выбрать из вариантов
        </button>
      </div>

      {/* Now / Next — крупный таймер-блок внизу */}
      <button
        onClick={() => navigate('/child/now-next')}
        className="mt-2 grid grid-cols-[1fr_auto_1fr] bg-gradient-to-r from-[#edfff4] to-[#f3ebff] border border-[#dce9f4] rounded-2xl overflow-hidden min-h-[80px] hover:shadow-card-soft transition-shadow"
        aria-label="Сейчас и потом"
      >
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">☀</span>
            <span className="text-sm text-muted">Сейчас</span>
          </div>
          <span className="text-base">Занятие</span>
        </div>
        <div className="w-px bg-[#b5c9df]" aria-hidden="true" />
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Потом</span>
            <span className="text-2xl" aria-hidden="true">☾</span>
          </div>
          <span className="text-base">Отдых</span>
        </div>
      </button>
    </div>
  );
};