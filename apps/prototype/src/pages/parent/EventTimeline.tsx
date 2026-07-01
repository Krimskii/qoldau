import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Filter, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEventStore } from '@/store/useEventStore';
import { EventType, QoldauEvent } from '@/types/qoldau';
import {
  getEventStatusLabel,
  getEventStatusClassName,
  getEventSourceLabel,
  getEventSourceClassName,
  getEventTypeClassName,
} from '@/utils/eventLabels';

type FilterType = 'all' | EventType;

interface FilterConfig {
  key: FilterType;
  label: string;
}

const FILTERS: FilterConfig[] = [
  { key: 'all', label: 'Все' },
  { key: 'voice_observation', label: 'Голос' },
  { key: 'food', label: 'Питание' },
  { key: 'water', label: 'Вода' },
  { key: 'toilet', label: 'Туалет' },
  { key: 'sleep', label: 'Сон' },
  { key: 'behavior', label: 'Поведение' },
  { key: 'sensory', label: 'Сенсорика' },
  { key: 'communication', label: 'Коммуникация' },
  { key: 'aac_card', label: 'AAC' },
  { key: 'phrase', label: 'Фразы' },
  { key: 'tutor_note', label: 'Тьютор' },
  { key: 'sos', label: 'SOS' },
];

const DOT_COLOR: Record<string, string> = {
  voice_observation: 'bg-teal',
  food: 'bg-green',
  water: 'bg-blue',
  toilet: 'bg-blue',
  sleep: 'bg-purple',
  behavior: 'bg-yellow',
  sensory: 'bg-yellow',
  communication: 'bg-purple',
  aac_card: 'bg-teal',
  phrase: 'bg-teal',
  media_request: 'bg-purple',
  sos: 'bg-coral',
  calm_mode: 'bg-blue',
  tutor_note: 'bg-purple',
  specialist_note: 'bg-blue',
  state: 'bg-teal',
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

interface TimelineRowProps {
  event: QoldauEvent;
  onClick: () => void;
}

const TimelineRow: React.FC<TimelineRowProps> = ({ event, onClick }) => {
  const dotColor = DOT_COLOR[event.type] ?? 'bg-teal';
  const typeClass = getEventTypeClassName(event.type);
  const sourceClass = getEventSourceClassName(event.sourceRole);
  const statusClass = getEventStatusClassName(event.status);

  return (
    <button
      onClick={onClick}
      className="w-full flex gap-3 items-start text-left py-3 px-2 -mx-2 rounded-2xl hover:bg-bg transition-colors"
    >
      <div className="flex flex-col items-center min-w-[44px] pt-0.5">
        <span className="text-xs font-bold text-ink tabular-nums">
          {formatTime(event.timestamp)}
        </span>
        <div
          className={`mt-2 w-3 h-3 rounded-full ${dotColor} ring-4 ring-bg shadow-card-soft flex-shrink-0`}
        />
      </div>

      <div className="flex-1 min-w-0 pb-2 border-b border-line-soft last:border-0">
        <h4 className="text-sm font-bold text-ink leading-tight">{event.title}</h4>
        <p className="text-xs text-muted leading-relaxed mt-0.5 line-clamp-2">
          {event.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${typeClass}`}>
            {getTypeShort(event.type)}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${sourceClass}`}>
            {getEventSourceLabel(event.sourceRole)}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusClass}`}>
            {getEventStatusLabel(event.status)}
          </span>
        </div>
      </div>
    </button>
  );
};

const TYPE_LABELS: Record<string, string> = {
  voice_observation: 'Голос',
  food: 'Питание',
  water: 'Вода',
  toilet: 'Туалет',
  sleep: 'Сон',
  behavior: 'Поведение',
  sensory: 'Сенсорика',
  communication: 'Коммуникация',
  aac_card: 'AAC',
  phrase: 'Фраза',
  media_request: 'Медиа',
  sos: 'SOS',
  calm_mode: 'Спокойствие',
  tutor_note: 'Тьютор',
  specialist_note: 'Специалист',
  state: 'Состояние',
};

const getTypeShort = (type: string) => TYPE_LABELS[type] ?? type;

interface FilterDropdownProps {
  value: FilterType;
  onChange: (v: FilterType) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = FILTERS.find((f) => f.key === value) ?? FILTERS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 h-11 px-4 rounded-2xl text-sm font-bold transition-colors ${
          value !== 'all'
            ? 'bg-teal text-white shadow-card-soft'
            : 'bg-white border border-line text-ink hover:border-teal'
        }`}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Filter className="w-4 h-4 opacity-80 flex-shrink-0" />
          <span className="truncate">
            {value === 'all' ? 'Все события' : current.label}
          </span>
        </span>
        <svg
          className={`w-4 h-4 opacity-80 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-line rounded-2xl shadow-card max-h-72 overflow-y-auto animate-fade-in">
          {FILTERS.map((f) => {
            const isActive = f.key === value;
            return (
              <button
                key={f.key}
                onClick={() => {
                  onChange(f.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-left transition-colors ${
                  isActive
                    ? 'bg-teal-soft text-teal-dark'
                    : 'text-ink hover:bg-bg'
                }`}
              >
                <span>{f.label}</span>
                {isActive && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, QoldauEvent[]> = {};
    [...filtered]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .forEach((e) => {
        const day = formatDay(e.timestamp);
        if (!map[day]) map[day] = [];
        map[day].push(e);
      });
    return Object.entries(map);
  }, [filtered]);

  const aiObservation = useMemo(() => {
    const sensoryCount = events.filter((e) => e.type === 'sensory').length;
    const communicationCount = events.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card'
    ).length;
    if (sensoryCount >= 2) {
      return 'Похоже, сегодня несколько событий связаны с сенсорной чувствительностью. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    if (communicationCount >= 2) {
      return 'Похоже, ребёнок активно использовал коммуникацию сегодня. Это хороший знак! Нужно подтвердить наблюдениями.';
    }
    return 'Сегодня собрано достаточно наблюдений. Чем больше данных — тем точнее паттерны.';
  }, [events]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="События"
        subtitle={`${filtered.length} событий`}
        rightAction={
          <button
            onClick={() => navigate('/specialist/reports')}
            className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center text-teal hover:bg-teal-soft transition-colors shadow-card-soft"
            aria-label="В отчёт"
          >
            <FileText className="w-4 h-4" />
          </button>
        }
      />

      {/* Filter dropdown (collapsible) */}
      <FilterDropdown value={activeFilter} onChange={setActiveFilter} />

      {/* AI observation */}
      <AIInsightCard text={aiObservation} />

      {/* Timeline by day */}
      {grouped.length === 0 ? (
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
        grouped.map(([day, items]) => (
          <div key={day}>
            <div className="flex items-center gap-2 mb-1 px-1">
              <Calendar className="w-4 h-4 text-muted" />
              <h3 className="text-xs font-bold text-muted uppercase tracking-wide">
                {day}
              </h3>
            </div>
            <Card variant="default" padding="sm">
              <div>
                {items.map((event) => (
                  <TimelineRow
                    key={event.id}
                    event={event}
                    onClick={() => navigate(`/parent/events/${event.id}`)}
                  />
                ))}
              </div>
            </Card>
          </div>
        ))
      )}
    </div>
  );
};