import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Brain, CheckCircle, Edit, FileText, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useEventStore } from '@/store/useEventStore';
import { QoldauEvent } from '@/types/qoldau';

type FilterType = 'all' | 'food' | 'toilet' | 'sensory' | 'communication' | 'behavior' | 'sleep' | 'state';

const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: 'all', label: 'Все', color: 'bg-teal' },
  { key: 'food', label: 'Питание', color: 'bg-green' },
  { key: 'toilet', label: 'Туалет', color: 'bg-blue' },
  { key: 'sensory', label: 'Сенсорика', color: 'bg-yellow' },
  { key: 'communication', label: 'Коммуникация', color: 'bg-purple' },
  { key: 'behavior', label: 'Поведение', color: 'bg-orange' },
  { key: 'sleep', label: 'Сон', color: 'bg-indigo' },
  { key: 'state', label: 'Состояние', color: 'bg-teal' },
];

const SOURCE_COLORS: Record<string, string> = {
  parent: 'bg-teal-soft text-teal',
  child: 'bg-coral-soft text-coral',
  tutor: 'bg-purple-soft text-purple',
  ai: 'bg-blue-soft text-blue',
};

const STATUS_BADGES: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Подтверждено', color: 'bg-green-soft text-green', icon: <CheckCircle className="w-3 h-3" /> },
  needs_verification: { label: 'Проверить', color: 'bg-yellow-soft text-yellow', icon: <AlertCircle className="w-3 h-3" /> },
  edited: { label: 'Исправлено', color: 'bg-blue-soft text-blue', icon: <Edit className="w-3 h-3" /> },
};

export const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter(e => e.type === activeFilter);
  }, [events, activeFilter]);

  const groupedByTime = useMemo(() => {
    const groups: { label: string; events: QoldauEvent[] }[] = [
      { label: 'Утро', events: [] },
      { label: 'День', events: [] },
      { label: 'Вечер', events: [] },
      { label: 'Ночь', events: [] },
    ];

    filteredEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      if (hour >= 6 && hour < 12) groups[0].events.push(event);
      else if (hour >= 12 && hour < 18) groups[1].events.push(event);
      else if (hour >= 18 && hour < 23) groups[2].events.push(event);
      else groups[3].events.push(event);
    });

    return groups.filter(g => g.events.length > 0);
  }, [filteredEvents]);

  // Generate AI observation based on events
  const aiObservation = useMemo(() => {
    if (events.length === 0) return null;
    
    const sensoryCount = events.filter(e => e.type === 'sensory').length;
    const communicationCount = events.filter(e => e.type === 'communication').length;
    const foodCount = events.filter(e => e.type === 'food').length;
    
    if (sensoryCount >= 2) {
      return 'Похоже, сегодня несколько событий связаны с сенсорной чувствительностью. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    if (communicationCount >= 2) {
      return 'Ребёнок активно использовал коммуникацию сегодня. Это хороший знак! Нужно подтвердить наблюдениями.';
    }
    if (foodCount >= 3) {
      return 'Сегодня было несколько событий, связанных с питанием. Это может быть полезной информацией для специалиста.';
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
        <div className="flex gap-2 min-w-max">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
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
              <p className="text-xs text-muted mt-2 italic">Это AI-наблюдение, не медицинский факт</p>
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
          <p className="text-sm text-muted">Попробуйте другой фильтр или добавьте наблюдение</p>
        </div>
      ) : (
        groupedByTime.map(group => (
          <div key={group.label} className="px-4">
            <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wide">{group.label}</h3>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#D9E8E5]" />
              {group.events.map(event => {
                const sourceBadge = SOURCE_COLORS[event.sourceRole] || 'bg-gray-soft text-gray';
                const statusBadge = STATUS_BADGES[event.status] || null;
                
                return (
                  <div key={event.id} className="relative mb-3">
                    <div className="absolute left-4 top-4 w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_0_5px_#E7F8F5]" />
                    <div className="ml-12 bg-white border border-line rounded-xl p-3 hover:shadow-card-soft transition-shadow cursor-pointer"
                         onClick={() => navigate(`/parent/events/${event.id}`)}>
                      {/* Badges row */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sourceBadge}`}>
                          {event.sourceRole === 'parent' ? 'Родитель' : 
                           event.sourceRole === 'child' ? 'Ребёнок' : 
                           event.sourceRole === 'tutor' ? 'Тьютор' : 'AI'}
                        </span>
                        {statusBadge && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        )}
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
