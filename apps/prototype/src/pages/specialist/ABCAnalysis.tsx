import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

export const ABCAnalysis: React.FC = () => {
  const { events } = useEventStore();

  // Build ABC from events — sensory events become "Antecedent",
  // behavior events become "Behavior", calm_mode / state events become "Consequence"
  const abc = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === DEMO_PRIMARY_CHILD.id);

    const antecedent = childEvents
      .filter((e) => e.type === 'sensory' || (e.tags && e.tags.includes('шум')) || (e.tags && e.tags.includes('переход')))
      .slice(-3);

    const behavior = childEvents
      .filter((e) => e.type === 'behavior')
      .slice(-3);

    const consequence = childEvents
      .filter((e) => e.type === 'calm_mode' || e.type === 'state')
      .slice(-3);

    return { antecedent, behavior, consequence };
  }, [events]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="ABC-анализ"
        subtitle="Триггеры и последствия"
        showBack
      />

      {/* ABC Columns */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-soft border border-blue/20 rounded-2xl p-3">
          <h4 className="text-center font-bold text-sm mb-3 text-blue">A — До</h4>
          <div className="space-y-2">
            {abc.antecedent.length === 0 ? (
              <p className="text-xs text-muted text-center">Нет данных</p>
            ) : (
              abc.antecedent.map((e) => (
                <div key={e.id} className="bg-white rounded-xl p-2 text-xs">
                  <p className="font-bold">{e.title}</p>
                  <p className="text-muted">{e.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-purple-soft border border-purple/20 rounded-2xl p-3">
          <h4 className="text-center font-bold text-sm mb-3 text-purple">B — Что</h4>
          <div className="space-y-2">
            {abc.behavior.length === 0 ? (
              <p className="text-xs text-muted text-center">Нет данных</p>
            ) : (
              abc.behavior.map((e) => (
                <div key={e.id} className="bg-white rounded-xl p-2 text-xs">
                  <p className="font-bold">{e.title}</p>
                  <p className="text-muted">{e.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-teal-soft border border-teal/20 rounded-2xl p-3">
          <h4 className="text-center font-bold text-sm mb-3 text-teal-dark">C — После</h4>
          <div className="space-y-2">
            {abc.consequence.length === 0 ? (
              <p className="text-xs text-muted text-center">Нет данных</p>
            ) : (
              abc.consequence.map((e) => (
                <div key={e.id} className="bg-white rounded-xl p-2 text-xs">
                  <p className="font-bold">{e.title}</p>
                  <p className="text-muted">{e.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Patterns from data */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Замеченные паттерны</h4>
        <ul className="space-y-3">
          <li className="text-sm">
            <span className="font-bold">Триггер:</span> Шум (громкая музыка, группа)
            <br />
            <span className="text-muted text-xs">→ Закрывает уши, отводит взгляд</span>
          </li>
          <li className="text-sm">
            <span className="font-bold">Триггер:</span> Смена активности
            <br />
            <span className="text-muted text-xs">→ Нервозность, отказ от задания</span>
          </li>
          <li className="text-sm">
            <span className="font-bold">Что помогло:</span> Пауза 2–3 минуты
            <br />
            <span className="text-muted text-xs">→ Похоже, стало спокойнее</span>
          </li>
        </ul>
      </Card>

      <AIInsightCard
        text="ABC-паттерны — гипотезы на основе наблюдений. Это не диагноз. Можно обсудить со специалистом и семьёй."
        variant="warning"
      />
    </div>
  );
};