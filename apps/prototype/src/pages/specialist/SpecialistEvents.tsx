import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { DataState } from '@/components/ui/DataState';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { getEventSourceClassName, getEventSourceLabel } from '@/utils/eventLabels';

type SourceFilter = 'all' | 'parent' | 'tutor' | 'specialist' | 'child' | 'device' | 'ai';

export const SpecialistEvents: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { events } = useEventStore();
  const { selectedChildId } = useDemoControlsStore();
  const [filter, setFilter] = useState<SourceFilter>('all');

  // Локализованные фильтры
  const FILTERS: { key: SourceFilter; label: string }[] = [
    { key: 'all', label: t('specialist.events.filterAll') },
    { key: 'parent', label: t('specialist.events.filterParent') },
    { key: 'child', label: t('specialist.events.filterChild') },
    { key: 'tutor', label: t('specialist.events.filterTutor') },
    { key: 'specialist', label: t('specialist.events.filterSpecialist') },
  ];

  const filtered = useMemo(() => {
    const childScoped = events.filter((e) => e.childId === selectedChildId);
    if (filter === 'all') return childScoped;
    return childScoped.filter((e) => e.sourceRole === filter);
  }, [events, filter, selectedChildId]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('specialist.events.title')}
        subtitle={t('specialist.events.subtitle', { count: filtered.length })}
        showBack
      />

      <ChildSelector />

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

      {/* Timeline — через DataState: loading/empty/error/data */}
      <DataState
        isLoading={false}
        error={null}
        isEmpty={filtered.length === 0}
        emptyState={{
          title: t('specialist.events.empty'),
          description: t('specialist.events.emptyHint'),
        }}
      >
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-line" />
          {filtered.slice(0, 30).map((event) => (
            <div
              key={event.id}
              className="relative mb-3 cursor-pointer"
              onClick={() => navigate(`/specialist/events/${event.id}`)}
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
      </DataState>
    </div>
  );
};