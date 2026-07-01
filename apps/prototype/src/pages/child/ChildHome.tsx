import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { DinoMascot } from '@/components/illustrations/DinoMascot';
import {
  WaterSoftIcon,
  ToiletSoftIcon,
  HelpSoftIcon,
  PauseSoftIcon,
  FavoritesSoftIcon,
  SpeakIcon,
  FoodSoftIcon,
  PlaySoftIcon,
  HugIcon,
  SparkleIcon,
  SunIcon,
  MoonIcon,
  SettingsIcon,
  type IconProps,
} from '@/components/icons';
import { QoldauActionCard } from '@/components/ui/QoldauActionCard';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionCard } from '@/components/ui/SectionCard';
import type { QoldauIconColor } from '@/components/ui/QoldauIconCard';

/**
 * ChildHome — главный экран ребёнка.
 *
 * Принципы:
 * - Не более 6 ключевых карточек на первом экране.
 * - Всё вторичное — в «Быстрые карточки» (/child/cards).
 * - Чёткий primary CTA: «Позвать маму» (в hero).
 * - Hero: приветствие + статус + CTA, мягкий gradient.
 *
 * Header (TopBar с именем ребёнка + bell) — в AppShell.
 */

interface ActionItem {
  id: string;
  label: string;
  Icon: React.FC<IconProps>;
  color: QoldauIconColor;
  path: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'water', label: 'Хочу пить', Icon: WaterSoftIcon, color: 'blue', path: '/child/cards' },
  { id: 'toilet', label: 'Туалет', Icon: ToiletSoftIcon, color: 'purple', path: '/child/cards' },
  { id: 'help', label: 'Помощь', Icon: HelpSoftIcon, color: 'green', path: '/child/call' },
  { id: 'pause', label: 'Пауза', Icon: PauseSoftIcon, color: 'yellow', path: '/child/calm' },
  { id: 'favorites', label: 'Любимые', Icon: FavoritesSoftIcon, color: 'purple', path: '/child/favorites' },
  { id: 'speak', label: 'Сказать', Icon: SpeakIcon, color: 'teal', path: '/child/speak' },
];

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100vh-80px)]">
      {/* Hero — приветствие + статус + CTA «Позвать маму» */}
      <section
        aria-label="Приветствие"
        className="px-5 py-5 rounded-3xl bg-gradient-to-br from-[#F0FBFF] via-[#EAF5FF] to-[#F1EDFF] border border-[#dceaf4] flex flex-col gap-4 shadow-card-soft"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <DinoMascot animated className="w-20 h-20" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-ink leading-tight">
              Привет, {child.name}!
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusBadge
                kind="ok"
                label="Я в порядке"
                icon={<SparkleIcon size={14} className="text-[#158647]" />}
              />
            </div>
          </div>
        </div>

        {/* Primary CTA — крупная кнопка «Позвать маму» */}
        <button
          onClick={() => navigate('/child/call')}
          className="w-full min-h-[68px] px-5 rounded-2xl bg-[#FFEAEA] border-2 border-[#FFC2BE] flex items-center justify-center gap-3 text-base font-black text-[#cc251d] transition-transform duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E56F5D]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(204,37,29,0.06)]"
          aria-label="Позвать маму"
        >
          <HugIcon size={28} className="text-[#cc251d]" />
          Позвать маму
        </button>
      </section>

      {/* 6 ключевых действий — единая сетка 3×2 */}
      <SectionCard title="Что хочешь сделать?" accent="teal">
        <div className="grid grid-cols-3 gap-2.5">
          {ACTIONS.map(({ id, label, Icon, color, path }) => (
            <QoldauActionCard
              key={id}
              icon={Icon}
              label={label}
              color={color}
              onClick={() => navigate(path)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Вторичное — выбор из вариантов и Сейчас/Потом */}
      <QoldauCard padding="md" className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/child/choice')}
          className="w-full min-h-[72px] rounded-2xl border-2 border-[#dce9f4] bg-gradient-to-r from-[#FFF6DF] to-[#F1EDFF] flex items-center justify-center gap-3 text-base font-black text-ink transition-transform duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]"
          aria-label="Выбрать из вариантов"
        >
          <span className="flex items-center gap-2" aria-hidden="true">
            <FoodSoftIcon size={22} className="text-[#cc251d]" />
            <PlaySoftIcon size={22} className="text-[#158647]" />
            <FavoritesSoftIcon size={22} className="text-[#5a3eb4]" />
          </span>
          Выбрать из вариантов
        </button>

        {/* Сейчас / Потом */}
        <button
          onClick={() => navigate('/child/now-next')}
          className="grid grid-cols-[1fr_auto_1fr] bg-gradient-to-r from-[#edfff4] to-[#f3ebff] border border-[#dce9f4] rounded-2xl overflow-hidden min-h-[72px] hover:shadow-card-soft transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
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
      </QoldauCard>

      {/* Подсказки для интерфейса (settings для взрослого) */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => navigate('/child/interface-guide')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-line text-xs font-bold text-muted hover:text-ink hover:bg-bg transition-colors"
          aria-label="Подсказки по интерфейсу"
        >
          <SettingsIcon size={14} />
          Подсказки
        </button>
      </div>
    </div>
  );
};