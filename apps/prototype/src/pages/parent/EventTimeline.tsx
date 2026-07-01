import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Brain, FileText, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useEventStore } from '@/store/useEventStore';
import { EventType, QoldauEvent } from '@/types/qoldau';
import {
  getEventStatusLabel,
  getEventStatusClassName,
  getEventSourceLabel,
  getEventSourceClassName,
} from '@/utils/eventLabels';

type FilterType = 'all' | EventType;

interface FilterConfig {
  key: FilterType;
  label: string;
  color: string;
}

// Filters must match real EventType values defined in src/types/qoldau.ts.
// Colors must use tokens defined in tailwind.config.js.
const FILTERS: FilterConfig[] = [
  { key: 'all', label: 'Все', color: 'bg-teal' },
  { key: 'voice_observation', label: 'Голос', color: 'bg-teal' },
  { key: 'food', label: 'Питание', color: 'bg-green' },
  { key: 'water', label: 'Вода', color: 'bg-blue' },
  { key: 'toilet', label: 'Туалет', color: 'bg-blue' },
  { key: 'sleep', label: 'Сон', color: 'bg-purple' },
  { key: 'behavior', label: 'Поведение', color: 'bg-yellow' },
  { key: 'sensory', label: 'Сенсорика', color: 'bg-yellow' },
  { key: 'communication', label: 'Коммуникация', color: 'bg-purple' },
  { key: 'aac_card', label: 'AAC', color: 'bg-teal' },
  { key: 'phrase', label: 'Фразы', color: 'bg-teal' },
  { key: 'tutor_note', label: 'Тьютор', color: 'bg-purple' },
  { key: 'sos', label: 'SOS', color: 'bg-coral' },
];

const STATUS_ICON = {
  confirmed: <CheckCircle className="w-3 h-3" />,
  ai_parsed: <AlertCircle className="w-3 h-3" />,
  corrected: <Edit className="w-3 h-3" />,
  draft: <span className="text-xs">○</span>,
  rejected: <span className="text-xs">✕</span>,
};

export const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  const groupedByTime = useMemo(() => {
    const groups: { label: string; events: QoldauEvent[] }[] = [
      { label: 'Утро', events: [] },
      { label: 'День', events: [] },
      { label: 'Вечер', events: [] },
      { label: 'Ночь', events: [] },
    ];

    filteredEvents.forEach((event) => {
      const hour = new Date(event.timestamp).getHours();
      if (hour >= 6 && hour < 12) groups[0].events.push(event);
      else if (hour >= 12 && hour < 18) groups[1].events.push(event);
      else if (hour >= 18 && hour < 23) groups[2].events.push(event);
      else groups[3].events.push(event);
    });

    return groups.filter((g) => g.events.length > 0);
  }, [filteredEvents]);

  // AI observation — cautious wording only
  const aiObservation = useMemo(() => {
    if (events.length === 0) return null;

    const sensoryCount = events.filter((e) => e.type === 'sensory').length;
    const communicationCount = events.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card'
    ).length;
    const foodCount = events.filter((e) => e.type === 'food').length;

    if (sensoryCount >= 2) {
      return 'Похоже, сегодня несколько событий связаны с сенсорной чувствительностью. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    if (communicationCount >= 2) {
      return 'Похоже, ребёнок активно использовал коммуникацию сегодня. Это хороший знак! Нужно подтвердить наблюдениями.';
    }
    if (foodCount >= 3) {
      return 'Похоже, сегодня было несколько событий, связанных с питанием. Это может быть полезной информацией для специалиста.';
    }
    return 'Сегодня собрано достаточно наблюдений. Чем больше данных — тем точнее паттерны.';
  }, [events]);

  return (
    <div className="flex flex-col gap-4 pb-20">
      <PageHeader
        title="Event Timeline"
        subtitle="Все события в одном месте"
        rightAction={
          <button className="flex items-center gap-2 text-sm font-bold text-teal">
            <FileText className="w-4 h-4" />
            В отчёт
          </button>
        }
      />

      {/* Filters */}
      <div className="px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === f.key
                  ? `${f.color} text-white`
                  : 'bg-white border border-line text-ink-2 hover:border-teal'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Observation */}
      {aiObservation && (
        <div className="mx-4 bg-gradient-to-r from-blue-soft to-purple-soft border border-blue/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-ink leading-relaxed">{aiObservation}</p>
              <p className="text-xs text-muted mt-2 italic">
                Это AI-наблюдение, не медицинский факт
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {groupedByTime.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-soft flex items-center justify-center mb-4">
            <Filter className="w-8 h-8 text-teal" />
          </div>
          <h3 className="font-bold text-ink mb-2">Нет событий</h3>
          <p className="text-sm text-muted">
            Попробуйте другой фильтр или добавьте наблюдение
          </p>
        </div>
      ) : (
        groupedByTime.map((group) => (
          <div key={group.label} className="px-4">
            <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wide">
              {group.label}
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-line" />
              {group.events.map((event) => {
                const sourceClassName = getEventSourceClassName(event.sourceRole);
                const statusClassName = getEventStatusClassName(event.status);

                return (
                  <div key={event.id} className="relative mb-3">
                    <div className="absolute left-4 top-4 w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_0_5px_#E7F8F5]" />
                    <div
                      className="ml-12 bg-white border border-line rounded-xl p-3 hover:shadow-card-soft transition-shadow cursor-pointer"
                      onClick={() => navigate(`/parent/events/${event.id}`)}
                    >
                      {/* Badges row */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${sourceClassName}`}
                        >
                          {getEventSourceLabel(event.sourceRole)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${statusClassName}`}
                        >
                          {STATUS_ICON[event.status]}
                          {getEventStatusLabel(event.status)}
                        </span>
                      </div>
                      {/* Event content */}
                      <div className="flex items-start gap-2">
                        <TimelineItem event={event} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};