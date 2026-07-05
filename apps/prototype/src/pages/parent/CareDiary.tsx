import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Utensils, Droplet, Smile } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEventStore } from '@/store/useEventStore';
import { useCurrentChild } from '@/store/useCurrentChild';
import { EventType } from '@/types/qoldau';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { formatDate, formatTime } from '@/utils/dateFormat';

interface TabConfig {
  key: string;
  label: string;
  types: EventType[];
}

const TABS: TabConfig[] = [
  { key: 'all', label: 'Всё', types: ['food', 'water', 'toilet', 'sleep'] },
  { key: 'food', label: 'Еда', types: ['food'] },
  { key: 'water', label: 'Вода', types: ['water'] },
  { key: 'toilet', label: 'Туалет', types: ['toilet'] },
  { key: 'sleep', label: 'Сон', types: ['sleep'] },
];

const ICON_MAP: Partial<Record<EventType, React.ReactNode>> = {
  food: <Utensils className="w-4 h-4 text-green" />,
  water: <Droplet className="w-4 h-4 text-blue" />,
  toilet: <Droplet className="w-4 h-4 text-blue" />,
  sleep: <Smile className="w-4 h-4 text-purple" />,
};

export const CareDiary: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { events } = useEventStore();
  const { id: childId } = useCurrentChild();

  const types = TABS.find((t) => t.key === activeTab)?.types ?? [];
  const childEvents = events
    .filter(
      (e) => e.childId === childId && types.includes(e.type)
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 14);

  // Group by date
  const grouped: Record<string, typeof childEvents> = {};
  childEvents.forEach((e) => {
    const day = formatDate(e.timestamp);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Питание и уход" subtitle="Из Event Timeline" />
      <ChildSelector />

      {/* Tabs */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="flex gap-2 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-teal text-white shadow-card-soft'
                  : 'bg-white border border-line text-ink-2 hover:border-teal hover:text-teal-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon="🍽"
          title="Пока нет событий этого типа"
          description="Нажмите «Добавить голосом» или используйте кнопки ниже"
        />
      ) : (
        Object.entries(grouped).map(([day, entries]) => (
          <div key={day}>
            <p className="text-xs font-black text-muted uppercase tracking-wide mb-2 px-1">
              {day}
            </p>
            <QoldauCard variant="default" padding="sm">
              {entries.map((event, i) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    i < entries.length - 1 ? 'border-b border-line-soft' : ''
                  }`}
                >
                  {ICON_MAP[event.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted truncate">{event.description}</p>
                  </div>
                  <span className="text-xs font-bold text-muted tabular-nums">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </QoldauCard>
          </div>
        ))
      )}

      {childEvents.length > 0 && (
        <AIInsightCard
          text="Похоже, в этом периоде ребёнок регулярно использует звук «ва» для воды и карточку «Туалет». Это наблюдение, не диагноз. Можно обсудить со специалистом."
        />
      )}

      <button
        onClick={() => navigate('/parent/voice')}
        className="w-full h-13 rounded-2xl bg-teal-soft border-2 border-teal/30 text-teal-dark font-black text-base flex items-center justify-center gap-2 hover:bg-teal hover:text-white transition-colors"
      >
        <Mic className="w-5 h-5" />
        Добавить голосом
      </button>
    </div>
  );
};