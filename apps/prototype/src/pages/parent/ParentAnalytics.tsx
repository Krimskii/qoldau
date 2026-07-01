import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { TrendingUp, BarChart3, Sparkles } from 'lucide-react';

export const ParentAnalytics: React.FC = () => {
  const { events } = useEventStore();

  const summary = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id);
    const types = ['food', 'water', 'toilet', 'communication', 'aac_card', 'sensory', 'behavior', 'phrase'] as const;
    return types.map((type) => ({
      type,
      count: childEvents.filter((e) => e.type === type).length,
      label:
        type === 'food' ? 'Еда' :
        type === 'water' ? 'Вода' :
        type === 'toilet' ? 'Туалет' :
        type === 'communication' ? 'Коммуникация' :
        type === 'aac_card' ? 'AAC' :
        type === 'sensory' ? 'Сенсорика' :
        type === 'behavior' ? 'Поведение' :
        'Фразы',
      color:
        type === 'food' ? 'bg-green' :
        type === 'water' ? 'bg-blue' :
        type === 'toilet' ? 'bg-blue' :
        type === 'communication' ? 'bg-purple' :
        type === 'aac_card' ? 'bg-teal' :
        type === 'sensory' ? 'bg-yellow' :
        type === 'behavior' ? 'bg-yellow' :
        'bg-teal',
    }));
  }, [events]);

  const total = summary.reduce((acc, x) => acc + x.count, 0) || 1;
  const top3 = [...summary].sort((a, b) => b.count - a.count).slice(0, 3);

  // Triggers
  const triggers = [
    { name: 'Шум', percent: 60 },
    { name: 'Смена активности', percent: 35 },
    { name: 'Громкий звук', percent: 25 },
  ];

  // Helpers
  const helpers = [
    { name: 'Пауза / отдых', count: 4 },
    { name: 'Тихое место', count: 3 },
    { name: 'Визуальное расписание', count: 3 },
  ];

  // Donut gradient stops
  const gradientStops = (() => {
    let acc = 0;
    const stops = top3.map((item) => {
      const start = acc;
      acc += (item.count / total) * 360;
      return `${item.color} ${start}deg ${acc}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  })();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Аналитика" subtitle="За 7 дней" />

      {/* Donut + Top signals */}
      <Card variant="default">
        <h4 className="text-sm font-black text-ink mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal" />
          Распределение событий
        </h4>
        <div className="flex items-center gap-4">
          <div
            className="w-24 h-24 rounded-full relative flex-shrink-0"
            style={{ background: gradientStops }}
          >
            <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
              <span className="text-xl font-black text-ink">{total}</span>
              <span className="text-[10px] text-muted">событий</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {top3.map((item) => (
              <div key={item.type} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-sm ${item.color}`} />
                <span className="flex-1">{item.label}</span>
                <span className="font-bold tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Triggers */}
      <Card variant="default">
        <h4 className="text-sm font-black text-ink mb-3">Ситуации, которые могли повлиять</h4>
        {triggers.map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-line-soft last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow" />
              <span className="text-sm font-bold text-ink">{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-yellow rounded-full" style={{ width: `${t.percent}%` }} />
              </div>
              <span className="text-xs text-muted w-10 text-right">{t.percent}%</span>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted mt-3 italic">
          Это гипотезы на основе наблюдений. Не являются медицинским диагнозом.
        </p>
      </Card>

      {/* What helped */}
      <Card variant="default">
        <h4 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal" />
          Что помогало
        </h4>
        {helpers.map((h) => (
          <div
            key={h.name}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-line-soft last:border-0"
          >
            <span className="text-sm font-bold text-ink">{h.name}</span>
            <span className="text-xs font-bold text-green">{h.count} раз</span>
          </div>
        ))}
      </Card>

      {/* Triggers chart */}
      <Card variant="default">
        <h4 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple" />
          Динамика
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-teal-soft rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-teal">+15%</p>
            <p className="text-[11px] text-muted">AAC</p>
          </div>
          <div className="bg-green-soft rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-green">+8%</p>
            <p className="text-[11px] text-muted">Коммуникация</p>
          </div>
          <div className="bg-blue-soft rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-blue">+5%</p>
            <p className="text-[11px] text-muted">Подтверждения</p>
          </div>
        </div>
      </Card>

      <AIInsightCard
        text="Похоже, за неделю больше всего событий связано с коммуникацией и AAC. Это хороший знак! Можно продолжать поддерживать."
      />
    </div>
  );
};