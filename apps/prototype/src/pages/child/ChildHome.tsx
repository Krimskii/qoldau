import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { DinoMascot } from '@/components/illustrations/DinoMascot';
import {
  WaterIcon,
  ToiletIcon,
  HelpIcon,
  PauseIcon,
  FavoritesIcon,
  SpeakIcon,
  FoodIcon,
  PlayIcon,
  SparkleIcon,
  BellIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  type IconProps,
} from '@/components/icons';

// 6 крупных action-кнопок — flat SVG-иконки вместо эмодзи.
interface ActionItem {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  iconColor: string;
  bg: string;
  path: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'water', label: 'Хочу пить', Icon: WaterIcon, iconColor: 'text-[#1c6cb8]', bg: 'bg-[#EAF5FF]', path: '/child/cards' },
  { id: 'toilet', label: 'Туалет', Icon: ToiletIcon, iconColor: 'text-[#5a3eb4]', bg: 'bg-[#F1EDFF]', path: '/child/cards' },
  { id: 'help', label: 'Помощь', Icon: HelpIcon, iconColor: 'text-[#158647]', bg: 'bg-[#EAF8F0]', path: '/child/call' },
  { id: 'pause', label: 'Пауза', Icon: PauseIcon, iconColor: 'text-[#9a7820]', bg: 'bg-[#FFF6DF]', path: '/child/calm' },
  { id: 'favorites', label: 'Любимые', Icon: FavoritesIcon, iconColor: 'text-[#5a3eb4]', bg: 'bg-[#F1EDFF]', path: '/child/favorites' },
  { id: 'speak', label: 'Сказать', Icon: SpeakIcon, iconColor: 'text-[#00796F]', bg: 'bg-[#E3FBF8]', path: '/child/speak' },
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
          <BellIcon size={20} className="text-[#53677e]" />
        </button>
        <button
          onClick={() => navigate('/child/interface-guide')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Что важно в интерфейсе"
        >
          <SettingsIcon size={20} className="text-[#53677e]" />
        </button>
      </div>

      {/* Hero — DinoMascot + мягкое приветствие + статус */}
      <div className="flex items-center gap-4 mb-2 px-2 py-3 rounded-3xl bg-gradient-to-br from-[#F0FBFF] to-[#EAF5FF] border border-[#dceaf4]">
        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <DinoMascot animated className="w-24 h-24" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-black tracking-tight text-ink">
            Привет, {child.name}!
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e7faee] text-[#158647] font-bold text-sm mt-1.5">
            <SparkleIcon size={14} className="text-[#158647]" />
            <span>Я в порядке</span>
          </div>
        </div>
      </div>

      {/* 6 крупных кнопок в сетке 3×2 — мягкие pressed states */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {ACTIONS.map(({ id, label, Icon, iconColor, bg, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`min-h-[110px] rounded-2xl border border-[rgba(60,106,151,0.15)] ${bg} flex flex-col items-center justify-center gap-2 p-3 text-base font-black text-[#173760] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_12px_rgba(42,73,108,0.05)] transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40`}
            aria-label={label}
          >
            <Icon size={42} className={iconColor} />
            {label}
          </button>
        ))}
        {/* Кнопка «Выбор» — выбор из вариантов */}
        <button
          onClick={() => navigate('/child/choice')}
          className="col-span-3 min-h-[88px] rounded-2xl border-2 border-[#dce9f4] bg-gradient-to-r from-[#FFF6DF] to-[#F1EDFF] flex items-center justify-center gap-3 text-base font-black text-ink transition-transform duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]"
          aria-label="Выбрать из вариантов"
        >
          <span className="flex items-center gap-2" aria-hidden="true">
            <FoodIcon size={22} className="text-[#cc251d]" />
            <PlayIcon size={22} className="text-[#158647]" />
            <FavoritesIcon size={22} className="text-[#5a3eb4]" />
          </span>
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
            <SunIcon size={20} className="text-[#E3A62F]" />
            <span className="text-sm text-muted">Сейчас</span>
          </div>
          <span className="text-base">Занятие</span>
        </div>
        <div className="w-px bg-[#b5c9df]" aria-hidden="true" />
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Потом</span>
            <MoonIcon size={20} className="text-[#5a3eb4]" />
          </div>
          <span className="text-base">Отдых</span>
        </div>
      </button>
    </div>
  );
};