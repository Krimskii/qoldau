import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { mockSpecialistData } from '@/data/mockSpecialist';

export const CarePatterns: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Паттерны ухода"
        subtitle="Связь событий"
        showBack
      />

      {/* Care Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div className="text-2xl font-black text-green">{mockSpecialistData.careSummary.food.count}</div>
          <p className="text-xs text-muted">Приёмы пищи</p>
          <p className="text-xs text-yellow mt-1">{mockSpecialistData.careSummary.food.note}</p>
        </Card>
        <Card>
          <div className="text-2xl font-black text-blue">{mockSpecialistData.careSummary.toilet.count}</div>
          <p className="text-xs text-muted">Туалет</p>
          <p className="text-xs text-yellow mt-1">{mockSpecialistData.careSummary.toilet.note}</p>
        </Card>
        <Card>
          <div className="text-2xl font-black text-yellow">{mockSpecialistData.careSummary.sleep.count}</div>
          <p className="text-xs text-muted">Сон (дневной)</p>
          <p className="text-xs text-green mt-1">{mockSpecialistData.careSummary.sleep.note}</p>
        </Card>
      </div>

      {/* Food-Water Link */}
      <Card variant="food">
        <h4 className="text-sm font-bold mb-2">Питание и вода</h4>
        <p className="text-xs text-ink-2">
          Сегодня в рационе мало воды ({mockSpecialistData.careSummary.food.note.toLowerCase()}). 
          Это может влиять на самочувствие и стул.
        </p>
      </Card>

      {/* Behavior Connection */}
      <Card variant="behavior">
        <h4 className="text-sm font-bold mb-2">Связь с поведением</h4>
        <p className="text-xs text-ink-2">
          Нервозность часто появляется через 20-30 минут после еды, перед туалетом или при шуме.
          Возможна связь с пищеварением или сенсорной перегрузкой.
        </p>
      </Card>

      <AIInsightCard
        text="Похоже, можно попробовать увеличить потребление воды и отслеживать консистенцию стула. Это наблюдение, не диагноз. Можно обсудить со специалистом."
        variant="warning"
      />
    </div>
  );
};
