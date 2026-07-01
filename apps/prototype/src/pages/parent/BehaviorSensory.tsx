import React, { useState, useMemo } from 'react';
import { Volume2, ArrowRightLeft, Mic, Lightbulb, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const TABS = [
  { key: 'triggers', label: 'Триггеры' },
  { key: 'helped', label: 'Что помогло' },
  { key: 'calm', label: 'Спокойный режим' },
] as const;

export const BehaviorSensory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('triggers');
  const { events } = useEventStore();
  const { showToast } = useToastStore();

  const childEvents = events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id);

  // Triggers — sensory + behavior events
  const sensoryEvents = useMemo(
    () => childEvents.filter((e) => e.type === 'sensory' || e.type === 'behavior').slice(-10),
    [childEvents]
  );

  // What helped — calm_mode events
  const calmEvents = useMemo(
    () => childEvents.filter((e) => e.type === 'calm_mode').slice(-5),
    [childEvents]
  );

  // Triggers by tag
  const triggerStats = useMemo(() => {
    const stats: Record<string, number> = { 'Шум': 0, 'Переход': 0, 'Новый вкус': 0, 'Громкий звук': 0 };
    sensoryEvents.forEach((e) => {
      const text = (e.description + ' ' + (e.tags?.join(' ') || '')).toLowerCase();
      if (text.includes('шум') || text.includes('громк') || text.includes('уши')) stats['Шум']++;
      if (text.includes('переход') || text.includes('новой активности')) stats['Переход']++;
    });
    return stats;
  }, [sensoryEvents]);

  const helpers = [
    { name: 'Пауза / отдых', count: 4, status: 'Помогло' },
    { name: 'Тихое место', count: 3, status: 'Помогло' },
    { name: 'Наушники с тихой музыкой', count: 2, status: 'Помогло' },
    { name: 'Вода', count: 2, status: 'Немного' },
    { name: 'Визуальное расписание', count: 3, status: 'Помогло' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Поведение и сенсорика"
        subtitle="Триггеры и что помогло"
      />

      {/* Tabs */}
      <div className="flex bg-bg border border-line rounded-xl p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-teal-dark shadow-card-soft'
                : 'text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'triggers' && (
        <>
          {/* Triggers from EventStore */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold">Сенсорные события</h4>
              <span className="text-xs text-muted">{sensoryEvents.length} за неделю</span>
            </div>
            {sensoryEvents.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">
                Пока нет сенсорных событий
              </p>
            ) : (
              sensoryEvents.map((event) => (
                <button
                  key={event.id}
                  className="w-full flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0 text-left hover:bg-bg rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-purple" />
                    <div>
                      <h4 className="text-xs font-bold">{event.title}</h4>
                      <p className="text-xs text-muted">{event.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(event.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </button>
              ))
            )}
          </Card>

          {/* Trigger stats */}
          <Card variant="default">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-coral" />
              Частые триггеры (гипотезы)
            </h4>
            {Object.entries(triggerStats).map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-coral" />
                  <span className="text-sm font-bold">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{count} раз</span>
                  <div className="w-16 h-1.5 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coral rounded-full"
                      style={{ width: `${Math.min(100, count * 30)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted mt-3 italic">
              Это гипотезы на основе данных. Не являются медицинским диагнозом.
            </p>
          </Card>
        </>
      )}

      {activeTab === 'helped' && (
        <Card variant="default">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow" />
            Что помогало
          </h4>
          {helpers.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-4 h-4 text-green" />
                <div>
                  <h4 className="text-xs font-bold">{h.name}</h4>
                  <p className="text-xs text-muted">{h.count} раз за неделю</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  h.status === 'Помогло'
                    ? 'bg-green-soft text-green'
                    : 'bg-yellow-soft text-yellow'
                }`}
              >
                {h.status}
              </span>
            </div>
          ))}
        </Card>
      )}

      {activeTab === 'calm' && (
        <>
          <Card variant="default">
            <h4 className="text-sm font-bold mb-3">Спокойный режим</h4>
            {calmEvents.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">
                Пока не было запусков Calm Mode
              </p>
            ) : (
              calmEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 border-b border-line py-2.5 last:border-0"
                >
                  <span className="w-8 h-8 rounded-xl bg-blue-soft flex items-center justify-center text-blue">
                    🧘
                  </span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold">{event.title}</h4>
                    <p className="text-xs text-muted">{event.description}</p>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(event.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))
            )}
          </Card>
          <AIInsightCard
            text="Похоже, короткие паузы и тихое место помогают снизить напряжение. Это наблюдение, не диагноз. Можно попробовать и дальше, если это работает."
            variant="warning"
          />
        </>
      )}

      <button
        onClick={() => showToast('Опишите наблюдение голосом — например: «Закрывал уши при громкой музыке»', 'info')}
        className="w-full border border-teal rounded-xl bg-teal-soft text-teal-dark font-bold py-3 flex items-center justify-center gap-2"
      >
        <Mic className="w-4 h-4" />
        Добавить голосом
      </button>
    </div>
  );
};