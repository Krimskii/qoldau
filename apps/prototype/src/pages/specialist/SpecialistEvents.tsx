import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useEventStore } from '@/store/useEventStore';
import { getEventSourceClassName, getEventSourceLabel } from '@/utils/eventLabels';

type SourceFilter = 'all' | 'parent' | 'tutor' | 'specialist' | 'child' | 'device' | 'ai';

const FILTERS: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'parent', label: 'Родитель' },
  { key: 'child', label: 'Ребёнок' },
  { key: 'tutor', label: 'Тьютор' },
  { key: 'specialist', label: 'Специалист' },
];

export const SpecialistEvents: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const [filter, setFilter] = useState<SourceFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.sourceRole === filter);
  }, [events, filter]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="События"
        subtitle={`${filtered.length} событий`}
        showBack
      />

      {/* Source filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-teal text-white'
                : 'bg-white border border-line text-ink-2 hover:border-teal'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-6 text-center">
          <p className="text-sm font-bold mb-1">Нет событий этого источника</p>
          <p className="text-xs text-muted">Попробуйте другой фильтр</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-line" />
          {filtered.slice(0, 30).map((event) => (
            <div
              key={event.id}
              className="relative mb-3 cursor-pointer"
              onClick={() => navigate(`/parent/events/${event.id}`)}
            >
              <div className="absolute left-4 top-4 w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_0_5px_#E7F8F5]" />
              <div className="ml-12 bg-white border border-line rounded-xl p-3 hover:shadow-card-soft transition-shadow">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getEventSourceClassName(event.sourceRole)}`}>
                    {getEventSourceLabel(event.sourceRole)}
                  </span>
                </div>
                <TimelineItem event={event} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};