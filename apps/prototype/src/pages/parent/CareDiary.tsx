import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { EventType } from '@/types/qoldau';
import { Utensils, Droplet } from 'lucide-react';

const tabs: { key: string; label: string; types: EventType[] }[] = [
  { key: 'Питание', label: 'Питание', types: ['food'] },
  { key: 'Вода', label: 'Вода', types: ['water'] },
  { key: 'Туалет', label: 'Туалет', types: ['toilet'] },
];

export const CareDiary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Питание');
  const { events } = useEventStore();

  const activeTypes = tabs.find((t) => t.key === activeTab)?.types || ['food'];
  const todayEvents = events.filter((e) => {
    const today = new Date().toISOString().split('T')[0];
    return activeTypes.includes(e.type) && e.timestamp.startsWith(today);
  });

  const getIcon = (type: EventType) => {
    switch (type) {
      case 'food':
        return <Utensils className="w-4 h-4 text-green" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-blue" />;
      case 'toilet':
        return <Droplet className="w-4 h-4 text-blue" />;
      default:
        return <Utensils className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Питание и туалет"
        subtitle="Уходовые события дня"
        rightAction={
          <button className="text-teal font-bold text-sm">+ Добавить</button>
        }
      />

      {/* Tabs */}
      <div className="flex bg-[#F3F7F6] border border-line rounded-xl p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-teal-dark shadow-[0_3px_10px_rgba(0,0,0,0.04)]'
                : 'text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data from EventStore */}
      <div className="bg-white border border-line rounded-2xl p-4">
        {todayEvents.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">
            Пока нет событий за сегодня
          </p>
        ) : (
          todayEvents.map((event) => (
            <MetricCard
              key={event.id}
              icon={getIcon(event.type)}
              label={`${new Date(event.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · ${event.description}`}
              value={event.title}
              status={event.type === 'toilet' ? 'important' : 'normal'}
            />
          ))
        )}
      </div>

      <AIInsightCard text="Похоже, сегодня в рационе мало воды. Возможно, стоит предложить больше воды. Это наблюдение, не диагноз. Можно обсудить со специалистом." />

      <Button onClick={() => {}} className="mt-auto">
        Добавить голосом
      </Button>
    </div>
  );
};
