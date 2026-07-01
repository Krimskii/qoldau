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
  HugIcon,
  type IconProps,
} from '@/components/icons';
import { QoldauActionCard } from '@/components/ui/QoldauActionCard';
import type { QoldauIconColor } from '@/components/ui/QoldauIconCard';

// 6 крупных action-кнопок — через универсальный QoldauActionCard.
interface ActionItem {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  color: QoldauIconColor;
  path: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'water', label: 'Хочу пить', Icon: WaterIcon, color: 'blue', path: '/child/cards' },
  { id: 'toilet', label: 'Туалет', Icon: ToiletIcon, color: 'purple', path: '/child/cards' },
  { id: 'help', label: 'Помощь', Icon: HelpIcon, color: 'green', path: '/child/call' },
  { id: 'pause', label: 'Пауза', Icon: PauseIcon, color: 'yellow', path: '/child/calm' },
  { id: 'favorites', label: 'Любимые', Icon: FavoritesIcon, color: 'purple', path: '/child/favorites' },
  { id: 'speak', label: 'Сказать', Icon: SpeakIcon, color: 'teal', path: '/child/speak' },
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

      {/* Hero — мягкий gradient, DinoMascot, приветствие, статус, CTA «Позвать маму» */}
      <div className="px-4 py-4 rounded-3xl bg-gradient-to-br from-[#F0FBFF] via-[#EAF5FF] to-[#F1EDFF] border border-[#dceaf4] flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <DinoMascot animated className="w-20 h-20" />
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

        {/* CTA — крупная кнопка "Позвать маму" в hero */}
        <button
          onClick={() => navigate('/child/call')}
          className="w-full min-h-[64px] px-5 rounded-2xl bg-[#FFEAEA] border-2 border-[#FFC2BE] flex items-center justify-center gap-3 text-base font-black text-[#cc251d] transition-transform duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E56F5D]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(204,37,29,0.06)]"
          aria-label="Позвать маму"
        >
          <HugIcon size={26} className="text-[#cc251d]" />
          Позвать маму
        </button>
      </div>

      {/* 6 крупных кнопок в сетке 3×2 — через QoldauActionCard */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {ACTIONS.map(({ id, label, Icon, color, path }) => (
          <QoldauActionCard
            key={id}
            icon={Icon}
            label={label}
            color={color}
            onClick={() => navigate(path)}
          />
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

      {/* Now / Next — компактный strip */}
      <button
        onClick={() => navigate('/child/now-next')}
        className="mt-2 grid grid-cols-[1fr_auto_1fr] bg-gradient-to-r from-[#edfff4] to-[#f3ebff] border border-[#dce9f4] rounded-2xl overflow-hidden min-h-[72px] hover:shadow-card-soft transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
        aria-label="Сейчас и потом"
      >
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-2.5 px-2">
          <div className="flex items-center gap-2">
            <SunIcon size={20} className="text-[#E3A62F]" />
            <span className="text-sm text-muted">Сейчас</span>
          </div>
          <span className="text-base">Занятие</span>
        </div>
        <div className="w-px bg-[#b5c9df]" aria-hidden="true" />
        <div className="flex flex-col items-center justify-center gap-1 font-black text-[#163b62] py-2.5 px-2">
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