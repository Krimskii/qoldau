import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { EventTypeBadge, EventStatusBadge } from '@/components/ui/Primitives';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventListSkeleton } from '@/components/ui/Skeleton';
import { useEventStore } from '@/store/useEventStore';
import { EventTimelineIcon } from '@/components/icons';
import { AppIcon } from '@/components/ui/AppIcon';
import { QoldauEvent } from '@/types/qoldau';
import { eventTypeColors, toneToColor, type EventTone } from '@/styles/tokens';
import { formatDate, formatTime } from '@/utils/dateFormat';

type FilterType = 'all' | string;

const FILTERS: Array<{ key: FilterType; label: string; tone: EventTone }> = [
  { key: 'all', label: 'Все', tone: 'teal' },
  { key: 'voice_observation', label: 'Голос', tone: 'teal' },
  { key: 'food', label: 'Питание', tone: 'coral' },
  { key: 'water', label: 'Вода', tone: 'blue' },
  { key: 'toilet', label: 'Туалет', tone: 'purple' },
  { key: 'sleep', label: 'Сон', tone: 'blue' },
  { key: 'behavior', label: 'Поведение', tone: 'yellow' },
  { key: 'sensory', label: 'Сенсорика', tone: 'yellow' },
  { key: 'communication', label: 'Коммуникация', tone: 'purple' },
  { key: 'aac_card', label: 'AAC', tone: 'teal' },
  { key: 'phrase', label: 'Фразы', tone: 'purple' },
  { key: 'calm_mode', label: 'Спокойствие', tone: 'green' },
  { key: 'sos', label: 'SOS', tone: 'coral' },
  { key: 'tutor_note', label: 'Тьютор', tone: 'purple' },
];

const SOURCE_LABEL: Record<string, string> = {
  parent: 'Родитель',
  child: 'Ребёнок',
  tutor: 'Тьютор',
  specialist: 'Специалист',
  device: 'Устройство',
  ai: 'AI',
};

interface TimelineRowProps {
  event: QoldauEvent;
  onClick: () => void;
}

const TimelineRow: React.FC<TimelineRowProps> = ({ event, onClick }) => {
  const cfg = (eventTypeColors as Record<string, { tone: EventTone; emoji: string }>)[event.type];
  const tone: EventTone = cfg?.tone ?? 'blue';
  const color = toneToColor(tone);

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-3 items-start py-3 px-3 -mx-1 rounded-2xl hover:bg-bg transition-colors group"
    >
      {/* Time + colored dot */}
      <div className="flex flex-col items-center min-w-[44px] pt-1 flex-shrink-0">
        <span className="text-xs font-bold text-ink tabular-nums">
          {formatTime(event.timestamp)}
        </span>
        <div
          className="mt-2 w-2.5 h-2.5 rounded-full ring-4"
          style={{ backgroundColor: color, borderColor: `${color}20` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3 border-b border-line-soft last:border-0">
        <h4 className="text-sm font-black text-ink leading-tight">{event.title}</h4>
        <p className="text-xs text-muted leading-relaxed mt-0.5 line-clamp-2">
          {event.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <EventTypeBadge eventType={event.type} size="sm" />
          <span
            className="inline-flex items-center h-6 px-2 rounded-full text-[11px] font-bold border border-line bg-white text-ink-2"
            aria-label="Источник события"
          >
            {SOURCE_LABEL[event.sourceRole] ?? event.sourceRole}
          </span>
          <EventStatusBadge status={event.status} size="sm" />
        </div>
      </div>
    </button>
  );
};

const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}> = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
      active
        ? 'bg-teal text-white border-teal shadow-card-soft'
        : 'bg-white border-line text-muted hover:text-ink hover:border-teal/40'
    }`}
    aria-pressed={active}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1.5 ${active ? 'opacity-80' : 'opacity-60'}`}>·{count}</span>
    )}
  </button>
);

export const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { events, isLoading, error } = useEventStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // v0.8 (per-device): события приходят только из локального стора.
  // Backend stateless-прокси, WebSocket-дубли убраны — источник правды один.

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, QoldauEvent[]> = {};
    [...filtered]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .forEach((e) => {
        const day = formatDate(e.timestamp);
        if (!map[day]) map[day] = [];
        map[day].push(e);
      });
    return Object.entries(map);
  }, [filtered]);

  const aiObservation = useMemo(() => {
    const sensoryCount = events.filter((e) => e.type === 'sensory').length;
    const communicationCount = events.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card',
    ).length;
    if (sensoryCount >= 2) {
      return 'Похоже, сегодня несколько событий связаны с сенсорной чувствительностью. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    if (communicationCount >= 2) {
      return 'Похоже, ребёнок активно использовал коммуникацию сегодня. Это хороший знак! Нужно подтвердить наблюдениями.';
    }
    return 'Сегодня собрано достаточно наблюдений. Чем больше данных — тем точнее паттерны.';
  }, [events]);

  // Counts per filter (для badge на chip)
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: events.length };
    for (const f of FILTERS) {
      if (f.key === 'all') continue;
      m[f.key] = events.filter((e) => e.type === f.key).length;
    }
    return m;
  }, [events]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="События"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'событие' : filtered.length < 5 ? 'события' : 'событий'}`}
      />

      {/* Hero — visual brand для Event Timeline */}
      <div className="bg-gradient-to-br from-teal-soft to-teal-tint border border-teal/20 rounded-3xl p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white border border-teal/20 flex items-center justify-center flex-shrink-0">
          <EventTimelineIcon size={36} className="text-teal" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-teal-dark uppercase tracking-wide">
            Event Timeline
          </p>
          <p className="text-sm text-ink-2 leading-snug mt-0.5">
            {aiObservation}
          </p>
        </div>
      </div>

      {/* Filters — horizontal scrollable chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <AppIcon
          component={Filter}
          size={16}
          colorClass="text-muted"
          className="flex-shrink-0"
        />
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            active={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
            label={f.label}
            count={counts[f.key]}
          />
        ))}
        {activeFilter !== 'all' && (
          <button
            onClick={() => setActiveFilter('all')}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-muted hover:text-coral transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* Timeline by day */}
      {isLoading && events.length === 0 ? (
        <EventListSkeleton count={4} />
      ) : error && events.length === 0 ? (
        <QoldauCard variant="tinted-warm" padding="md">
          <p className="text-sm font-black text-coral-dark">Не удалось загрузить наблюдения</p>
          <p className="text-xs text-ink-2 mt-1 leading-relaxed">
            {error}
            {' '}Можно попробовать перезагрузить страницу.
          </p>
        </QoldauCard>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Нет событий этого типа"
          description="Попробуйте другой фильтр или добавьте наблюдение голосом"
          action={
            <button
              onClick={() => navigate('/parent/voice')}
              className="px-5 py-3 rounded-2xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-colors"
            >
              Сказать наблюдение
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([day, items]) => (
            <section key={day}>
              <header className="flex items-center gap-2 mb-2 px-1">
                <Calendar size={14} className="text-muted" />
                <h3 className="text-xs font-bold text-muted uppercase tracking-wide">
                  {day}
                </h3>
                <span className="text-xs font-bold text-muted/70">
                  · {items.length}
                </span>
              </header>
              <QoldauCard variant="default" padding="sm">
                {items.map((event) => (
                  <TimelineRow
                    key={event.id}
                    event={event}
                    onClick={() => navigate(`/parent/events/${event.id}`)}
                  />
                ))}
              </QoldauCard>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};