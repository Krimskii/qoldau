import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowRightLeft, Mic, Lightbulb, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const TABS = [
  { key: 'triggers', label: 'Ситуации' },
  { key: 'helped', label: 'Что помогло' },
  { key: 'calm', label: 'Спокойный режим' },
] as const;

export const BehaviorSensory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('triggers');
  const { events } = useEventStore();

  const childEvents = useMemo(
    () => events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id),
    [events]
  );

  const sensoryEvents = useMemo(
    () =>
      childEvents
        .filter((e) => e.type === 'sensory' || e.type === 'behavior')
        .slice(-8),
    [childEvents]
  );

  const calmEvents = useMemo(
    () => childEvents.filter((e) => e.type === 'calm_mode').slice(-5),
    [childEvents]
  );

  const triggerStats = useMemo(() => {
    const stats: Record<string, number> = {
      Шум: 0,
      'Смена активности': 0,
      'Громкий звук': 0,
    };
    sensoryEvents.forEach((e) => {
      const text = (e.description + ' ' + (e.tags?.join(' ') || '')).toLowerCase();
      if (text.includes('шум') || text.includes('громк') || text.includes('уши')) stats['Шум']++;
      if (text.includes('переход') || text.includes('новой активности')) stats['Смена активности']++;
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
      <PageHeader title="Сенсорика и поведение" subtitle="Что повторяется и что помогает" />

      {/* Tabs */}
      <div className="bg-bg border border-line-soft rounded-2xl p-1 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
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
          <Card variant="default">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-black text-ink">Сенсорные события</h4>
              <span className="text-xs text-muted">{sensoryEvents.length} за неделю</span>
            </div>
            {sensoryEvents.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">
                Пока нет сенсорных событий
              </p>
            ) : (
              sensoryEvents.map((event, i) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    i < sensoryEvents.length - 1 ? 'border-b border-line-soft' : ''
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-purple flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink">{event.title}</p>
                    <p className="text-xs text-muted truncate">{event.description}</p>
                  </div>
                  <span className="text-xs text-muted tabular-nums">
                    {new Date(event.timestamp).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))
            )}
          </Card>

          <Card variant="default">
            <h4 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-coral" />
              Повторяющиеся ситуации (гипотезы)
            </h4>
            {Object.entries(triggerStats).map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-line-soft last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-coral" />
                  <span className="text-sm font-bold text-ink">{name}</span>
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
            <p className="text-[11px] text-muted mt-3 italic">
              Это гипотезы на основе наблюдений. Не являются медицинским диагнозом.
            </p>
          </Card>
        </>
      )}

      {activeTab === 'helped' && (
        <Card variant="default">
          <h4 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow" />
            Что помогало
          </h4>
          {helpers.map((h, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 py-2.5 ${
                i < helpers.length - 1 ? 'border-b border-line-soft' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-4 h-4 text-green flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-ink">{h.name}</p>
                  <p className="text-[11px] text-muted">{h.count} раз за неделю</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
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
            <h4 className="text-sm font-black text-ink mb-3">Спокойный режим</h4>
            {calmEvents.length === 0 ? (
              <EmptyState
                icon="☁️"
                title="Пока не было Calm Mode"
                description="Можно запустить в любое время"
              />
            ) : (
              calmEvents.map((event, i) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    i < calmEvents.length - 1 ? 'border-b border-line-soft' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-soft flex items-center justify-center text-2xl flex-shrink-0">
                    ☁️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink">{event.title}</p>
                    <p className="text-xs text-muted truncate">{event.description}</p>
                  </div>
                  <span className="text-xs text-muted tabular-nums">
                    {new Date(event.timestamp).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))
            )}
          </Card>
          <AIInsightCard
            text="Похоже, короткие паузы и тихое место помогают снизить напряжение. Это наблюдение, не диагноз. Можно попробовать и дальше, если это работает."
          />
        </>
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