import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { TrendingUp, BarChart3 } from 'lucide-react';

export const ParentAnalytics: React.FC = () => {
  const { events } = useEventStore();

  const summary = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id);
    const types = ['food', 'water', 'toilet', 'communication', 'aac_card', 'sensory', 'behavior', 'phrase'] as const;
    return types.map((type) => ({
      type,
      count: childEvents.filter((e) => e.type === type).length,
    }));
  }, [events]);

  const total = summary.reduce((acc, x) => acc + x.count, 0) || 1;

  const typeLabels: Record<string, string> = {
    food: 'Еда',
    water: 'Вода',
    toilet: 'Туалет',
    communication: 'Коммуникация',
    aac_card: 'AAC',
    sensory: 'Сенсорика',
    behavior: 'Поведение',
    phrase: 'Фразы',
  };

  const typeColors: Record<string, string> = {
    food: 'bg-green',
    water: 'bg-blue',
    toilet: 'bg-blue',
    communication: 'bg-purple',
    aac_card: 'bg-teal',
    sensory: 'bg-yellow',
    behavior: 'bg-yellow',
    phrase: 'bg-teal',
  };

  // Top signals
  const topSignals = DEMO_PRIMARY_CHILD.mainSignals.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Аналитика"
        subtitle="За 7 дней"
      />

      {/* Donut */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal" />
          Распределение событий
        </h4>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex-shrink-0 relative"
            style={{
              background: `conic-gradient(#07958B 0 ${Math.round((summary[0].count / total) * 360)}deg, #2385D6 ${Math.round((summary[0].count / total) * 360)}deg ${Math.round(((summary[0].count + summary[1].count + summary[2].count) / total) * 360)}deg, #7C5CCB ${Math.round(((summary[0].count + summary[1].count + summary[2].count) / total) * 360)}deg ${Math.round(((summary[0].count + summary[1].count + summary[2].count + summary[3].count + summary[4].count) / total) * 360)}deg, #E3A62F ${Math.round(((summary[0].count + summary[1].count + summary[2].count + summary[3].count + summary[4].count) / total) * 360)}deg 360deg)`,
            }}
          >
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col">
              <span className="text-lg font-black text-ink">{total}</span>
              <span className="text-[10px] text-muted">событий</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {summary.slice(0, 4).map((item) => (
              <div key={item.type} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-sm ${typeColors[item.type]}`} />
                <span className="flex-1">{typeLabels[item.type]}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Triggers */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Сенсорные триггеры</h4>
        {[
          { name: 'Шум', percent: 60 },
          { name: 'Переход', percent: 35 },
          { name: 'Новая активность', percent: 25 },
        ].map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow" />
              <span className="text-sm font-bold">{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-yellow rounded-full" style={{ width: `${t.percent}%` }} />
              </div>
              <span className="text-xs text-muted w-10 text-right">{t.percent}%</span>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted mt-3 italic">
          Это гипотезы на основе наблюдений. Не являются медицинским диагнозом.
        </p>
      </Card>

      {/* Top signals */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple" />
          Частые сигналы
        </h4>
        {topSignals.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0"
          >
            <div>
              <h4 className="text-sm font-bold">{s.signal}</h4>
              <p className="text-xs text-muted">{s.possibleMeaning}</p>
            </div>
            <span className="text-xs font-bold text-purple">{s.confirmedCount} раз</span>
          </div>
        ))}
      </Card>

      <AIInsightCard
        text="Похоже, за неделю больше всего событий связано с коммуникацией и AAC. Это хороший знак! Можно продолжать поддерживать."
        variant="warning"
      />
    </div>
  );
};