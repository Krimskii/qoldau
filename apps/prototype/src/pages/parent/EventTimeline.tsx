import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText } from 'lucide-react';
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
      className="w-full flex gap-3 items-start text-left py-3 px-2 -mx-2 rounded-2xl hover:bg-bg transition-colors group"
    >
      {/* Time + dot */}
      <div className="flex flex-col items-center min-w-[44px] pt-0.5">
        <span className="text-xs font-bold text-ink tabular-nums">
          {formatTime(event.timestamp)}
        </span>
        <div
          className={`mt-2 w-3 h-3 rounded-full ${dotColor} ring-4 ring-bg shadow-card-soft flex-shrink-0`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-2 border-b border-line-soft group-last:border-0">
        <h4 className="text-sm font-bold text-ink leading-tight">{event.title}</h4>
        <p className="text-xs text-muted leading-relaxed mt-0.5 line-clamp-2">
          {event.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${typeClass}`}>
            {event.type === 'voice_observation' && 'Голос'}
            {event.type === 'food' && 'Питание'}
            {event.type === 'water' && 'Вода'}
            {event.type === 'toilet' && 'Туалет'}
            {event.type === 'sleep' && 'Сон'}
            {event.type === 'behavior' && 'Поведение'}
            {event.type === 'sensory' && 'Сенсорика'}
            {event.type === 'communication' && 'Коммуникация'}
            {event.type === 'aac_card' && 'AAC'}
            {event.type === 'phrase' && 'Фраза'}
            {event.type === 'media_request' && 'Медиа'}
            {event.type === 'sos' && 'SOS'}
            {event.type === 'calm_mode' && 'Спокойствие'}
            {event.type === 'tutor_note' && 'Тьютор'}
            {event.type === 'specialist_note' && 'Специалист'}
            {event.type === 'state' && 'Состояние'}
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

export const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  // Group by date (descending)
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

      {/* Filter chips */}
      <div className="overflow-x-auto -mx-5 px-5 pb-1">
        <div className="flex gap-2 min-w-max">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? 'bg-teal text-white shadow-card-soft'
                  : 'bg-white border border-line text-ink-2 hover:border-teal hover:text-teal-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

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