import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useEventStore } from '@/store/useEventStore';

export const SpecialistEvents: React.FC = () => {
  const { events } = useEventStore();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="События"
        subtitle="Лента за период"
      />

      {/* Filters */}
      <div className="flex gap-2">
        {['Все', 'Родитель', 'Тьютор', 'Устройство', 'AI'].map((f, i) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              i === 0 ? 'bg-teal text-white' : 'bg-white border border-line text-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative mt-2">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#D9E8E5]" />
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
