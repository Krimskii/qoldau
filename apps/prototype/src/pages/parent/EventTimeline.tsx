import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useEventStore } from '@/store/useEventStore';

export const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Лента событий"
        subtitle="Сегодня, 1 июля"
      />

      <div className="relative mt-2">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#D9E8E5]" />
        {events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            onClick={() => navigate(`/parent/events/${event.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
