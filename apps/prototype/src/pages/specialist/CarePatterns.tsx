import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { QoldauEvent } from '@/types/qoldau';

export const CarePatterns: React.FC = () => {
  const { events } = useEventStore();

  const childEvents = useMemo(
    () => events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id),
    [events]
  );

  const summary = useMemo(() => {
    const byType = (t: QoldauEvent['type']) =>
      childEvents.filter((e) => e.type === t).length;

    return {
      food: byType('food'),
      water: byType('water'),
      toilet: byType('toilet'),
      sleep: byType('sleep'),
      sensory: byType('sensory'),
      behavior: byType('behavior'),
    };
  }, [childEvents]);

  // Pattern: food → sensory within 30 min
  const foodToSensoryPatterns = useMemo(() => {
    const foods = childEvents.filter((e) => e.type === 'food');
    const sensory = childEvents.filter((e) => e.type === 'sensory' || e.type === 'behavior');
    const patterns: { food: QoldauEvent; reaction: QoldauEvent; gap: number }[] = [];

    foods.forEach((f) => {
      sensory.forEach((s) => {
        const gap = (new Date(s.timestamp).getTime() - new Date(f.timestamp).getTime()) / 60000;
        if (gap > 0 && gap <= 30) {
          patterns.push({ food: f, reaction: s, gap });
        }
      });
    });
    return patterns.slice(0, 3);
  }, [childEvents]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Паттерны ухода"
        subtitle="Связь событий"
        showBack
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="default">
          <div className="text-2xl font-black text-green">{summary.food}</div>
          <p className="text-xs text-muted">Приёмы пищи</p>
        </Card>
        <Card variant="default">
          <div className="text-2xl font-black text-blue">{summary.water}</div>
          <p className="text-xs text-muted">Вода</p>
        </Card>
        <Card variant="default">
          <div className="text-2xl font-black text-purple">{summary.toilet}</div>
          <p className="text-xs text-muted">Туалет</p>
        </Card>
      </div>

      {/* Patterns from data */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Связи событий (гипотезы)</h4>
        {foodToSensoryPatterns.length === 0 ? (
          <p className="text-xs text-muted text-center py-3">
            Пока недостаточно данных для построения паттернов
          </p>
        ) : (
          foodToSensoryPatterns.map((p, i) => (
            <div key={i} className="py-2.5 border-b border-line last:border-0">
              <p className="text-sm">
                <strong>{p.food.title}</strong>{' '}
                <span className="text-muted text-xs">
                  ({new Date(p.food.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })})
                </span>
              </p>
              <p className="text-xs text-muted">
                → через {Math.round(p.gap)} мин: {p.reaction.title.toLowerCase()}
              </p>
            </div>
          ))
        )}
        <p className="text-xs text-muted mt-3 italic">
          Это гипотезы на основе наблюдений. Не являются медицинским диагнозом.
        </p>
      </Card>

      {/* Behavior connection */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Связь с поведением</h4>
        <p className="text-sm text-ink-2 leading-relaxed">
          Похоже, нервозность иногда появляется через 20–30 минут после еды или при шуме.
          Возможна связь с пищеварением или сенсорной перегрузкой. Это наблюдение, не диагноз.
        </p>
      </Card>

      <AIInsightCard
        text="Похоже, можно отслеживать потребление воды и связь с событиями поведения. Это наблюдение, не диагноз. Можно обсудить со специалистом."
        variant="warning"
      />
    </div>
  );
};