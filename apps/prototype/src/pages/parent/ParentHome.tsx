import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Mic,
  Settings,
  Utensils,
  Droplet,
  Moon,
  MessageCircle,
  Zap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionCard } from '@/components/ui/SectionCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD, DEMO_PARENTS } from '@/data/demoDataset';
import { formatTime } from '@/utils/dateFormat';
import { iconButtonSize } from '@/styles/tokens';
import { triggerHaptic } from '@/lib/feedback/haptics';
import type { StatusKind } from '@/components/ui/StatusBadge';

/**
 * ParentHome — родительский дашборд (v1.5+ polish per design C).
 *
 * Структура (сверху вниз):
 * 1. Hero — карточка ребёнка (QoldauCard tinted-teal + аватар + StatusBadge).
 * 2. CTA «Сказать наблюдение» (teal gradient, min-h ~88px).
 * 3. Сводка дня — 3 мини-метрики (НОВОЕ в spec C).
 * 4. Быстрые действия — 3×2 (приведены к семантике eventTypeColors).
 * 5. AI-наблюдение.
 * 6. «Сегодня» — последние события (4).
 * 7. Дисклеймер «профиль наблюдений, не диагноз».
 *
 * Тач-таргеты: adult ≥48px, icon-button ≥44px (в отличие от child ≥112px).
 */

type ActionTone = 'coral' | 'blue' | 'purple' | 'yellow';

interface QuickAction {
  id: string;
  label: string;
  Icon: LucideIcon;
  /** Tone из eventTypeColors (coral|blue|purple|yellow|teal|green). */
  tone: ActionTone;
  path: string;
}

/**
 * 6 quick-actions в фикс-порядке (motor memory):
 * 1) Еда (coral) 2) Вода (blue) 3) Туалет (purple)
 * 4) Сон (blue) 5) Поведение (yellow) 6) Коммуникация (purple)
 *
 * Источник иконок/тонов: eventTypeColors в tokens.ts.
 */
const QUICK_ACTIONS: QuickAction[] = [
  { id: 'food',   label: 'Еда',           Icon: Utensils,      tone: 'coral',   path: '/parent/care' },
  { id: 'water',  label: 'Вода',          Icon: Droplet,       tone: 'blue',    path: '/parent/care' },
  { id: 'toilet', label: 'Туалет',        Icon: Droplet,       tone: 'purple',  path: '/parent/care' },
  { id: 'sleep',  label: 'Сон',           Icon: Moon,          tone: 'blue',    path: '/parent/care' },
  { id: 'behav',  label: 'Поведение',     Icon: Zap,           tone: 'yellow',  path: '/parent/behavior' },
  { id: 'comms',  label: 'Коммуникация',  Icon: MessageCircle, tone: 'purple',  path: '/parent/events' },
];

const TONE_BG: Record<ActionTone, string> = {
  coral: 'bg-coral-soft',
  blue: 'bg-blue-soft',
  purple: 'bg-purple-soft',
  yellow: 'bg-yellow-soft',
};

const TONE_TEXT: Record<ActionTone, string> = {
  coral: 'text-coral',
  blue: 'text-blue',
  purple: 'text-purple',
  yellow: 'text-yellow',
};

/** Маппинг currentState ребёнка → StatusKind (без хардкода 'ok'). */
function pickStatusKind(currentState: string): StatusKind {
  const s = currentState.toLowerCase();
  if (
    s.includes('тревог') ||
    s.includes('плох') ||
    s.includes('неспок')
  ) {
    return 'help';
  }
  if (s.includes('устал') || s.includes('устал')) {
    return 'tired';
  }
  if (s.includes('спокоен') || s.includes('спокойств')) {
    return 'calm';
  }
  if (s.includes('сосредоточен') || s.includes('фокус')) {
    return 'focus';
  }
  return 'ok';
}

export const ParentHome: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const child = DEMO_PRIMARY_CHILD;
  const mother = DEMO_PARENTS[0];

  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = useMemo(
    () => events.filter((e) => e.timestamp.startsWith(today) && !e.deleted),
    [events, today]
  );

  // 3 метрики для сводки дня (см. спеку C §A3).
  const todayTotal = todayEvents.length;
  const todayComm = todayEvents.filter(
    (e) => e.type === 'communication' || e.type === 'aac_card',
  ).length;
  const todaySensory = todayEvents.filter((e) => e.type === 'sensory').length;

  const lastEvents = todayEvents.slice(0, 4);

  const aiObservation = useMemo(() => {
    if (todayEvents.length === 0) {
      return 'Сегодня пока нет наблюдений. Можно начать с голосовой записи — это самый быстрый способ зафиксировать, что произошло.';
    }
    const sensoryCount = todaySensory;
    const communicationCount = todayComm;
    if (sensoryCount >= 1 && communicationCount >= 2) {
      return 'Похоже, сегодня было несколько сенсорных событий и активная коммуникация. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    return 'Сегодня уже есть наблюдения. Продолжайте фиксировать — это помогает видеть повторяющиеся ситуации и реакции.';
  }, [todayEvents, todaySensory, todayComm]);

  const statusKind = pickStatusKind(child.currentState);

  return (
    <div className="flex flex-col gap-5">
      {/* A1. Hero — карточка ребёнка */}
      <QoldauCard variant="tinted-teal" padding="md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-yellow-soft to-blue-soft border-2 border-white flex items-center justify-center flex-shrink-0 shadow-card-soft">
            <Sparkles className="w-7 h-7 text-teal-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-ink leading-tight">
              {child.name}, {child.age} лет
            </h2>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusBadge kind={statusKind} label={child.currentState} />
            </div>
          </div>
          {/* Фикс: settings 36px → 44px (iconButtonSize). */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              navigate('/parent/profile');
            }}
            className="rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
            style={{ width: iconButtonSize, height: iconButtonSize }}
            aria-label="Профиль и настройки"
            data-testid="parent-settings"
          >
            <Settings className="w-5 h-5 text-ink-2" />
          </button>
        </div>
      </QoldauCard>

      {/* A2. CTA «Сказать наблюдение» */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          navigate('/parent/voice');
        }}
        className="w-full rounded-3xl p-5 bg-gradient-to-br from-teal to-teal-dark text-white shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Сказать наблюдение"
        data-testid="parent-cta-voice"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
          <Mic className="w-7 h-7" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs opacity-90 font-bold uppercase tracking-wide">
            Главное действие
          </p>
          <p className="text-xl font-black leading-tight mt-0.5">Сказать наблюдение</p>
        </div>
        <ChevronRight className="w-5 h-5 opacity-90" />
      </button>

      {/* A3. Сводка дня — 3 мини-метрики (НОВОЕ) */}
      <div className="grid grid-cols-3 gap-2.5" data-testid="parent-today-summary">
        <QoldauCard variant="default" padding="sm">
          <div className="text-center">
            <div className="text-2xl font-black leading-none text-teal">{todayTotal}</div>
            <div className="text-[11px] text-muted mt-1.5 leading-tight">Событий сегодня</div>
          </div>
        </QoldauCard>
        <QoldauCard variant="default" padding="sm">
          <div className="text-center">
            <div className="text-2xl font-black leading-none text-purple">{todayComm}</div>
            <div className="text-[11px] text-muted mt-1.5 leading-tight">Коммуникация</div>
          </div>
        </QoldauCard>
        <QoldauCard variant="default" padding="sm">
          <div className="text-center">
            <div className="text-2xl font-black leading-none text-yellow">{todaySensory}</div>
            <div className="text-[11px] text-muted mt-1.5 leading-tight">Сенсорика</div>
          </div>
        </QoldauCard>
      </div>

      {/* A4. Быстрые действия 3×2 */}
      <SectionCard title="Быстрые действия" accent="teal">
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map(({ id, label, Icon, tone, path }) => (
            <button
              key={id}
              onClick={() => {
                triggerHaptic('tap');
                navigate(path);
              }}
              className={`min-h-[88px] rounded-2xl ${TONE_BG[tone]} border border-line flex flex-col items-center justify-center gap-1.5 p-2 hover:scale-[0.97] active:scale-[0.94] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40`}
              aria-label={label}
              data-quick-action={id}
            >
              <Icon className={`w-7 h-7 ${TONE_TEXT[tone]}`} aria-hidden="true" />
              <span className="text-xs font-bold text-ink-2">{label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* A5. AI observation */}
      <AIInsightCard text={aiObservation} />

      {/* A6. «Сегодня» — последние события */}
      <SectionCard
        title="Сегодня"
        accent="teal"
        action={
          <button
            onClick={() => navigate('/parent/events')}
            className="text-xs font-bold text-teal flex items-center gap-1"
          >
            Все <ChevronRight className="w-3 h-3" />
          </button>
        }
      >
        {lastEvents.length === 0 ? (
          <p className="text-sm text-muted text-center py-3">
            Сегодня пока нет событий
          </p>
        ) : (
          <div>
            {lastEvents.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => navigate(`/parent/events/${event.id}`)}
                className={`w-full flex items-center gap-3 py-2.5 text-left hover:bg-bg transition-colors rounded-xl px-2 -mx-2 ${
                  idx < lastEvents.length - 1 ? 'border-b border-line-soft' : ''
                }`}
              >
                <span className="text-xs text-muted font-bold tabular-nums min-w-[40px]">
                  {formatTime(event.timestamp)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted truncate">{event.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      {/* A7. Disclaimer */}
      <p className="text-[11px] text-muted text-center italic px-4">
        Это профиль наблюдений {mother.name}. Не медицинский диагноз.
      </p>
    </div>
  );
};