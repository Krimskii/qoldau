import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockChild } from '@/data/mockChild';

export const SupportPlan: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="План поддержки"
        subtitle={`${mockChild.name}, ${mockChild.age} лет`}
        showBack
      />

      {/* Visual Schedule */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Визуальное расписание</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['Утро', 'Занятия', 'Обед', 'Отдых', 'Прогулка'].map((s, i) => (
            <div key={i} className="flex-shrink-0 w-20 h-16 rounded-xl bg-gradient-to-br from-teal-soft to-white border border-teal flex items-center justify-center text-xs font-bold text-teal-dark">
              {s}
            </div>
          ))}
        </div>
      </Card>

      {/* Sensory Support */}
      <Card variant="sensory">
        <h4 className="text-sm font-bold mb-3">Сенсорная поддержка</h4>
        <div className="space-y-2">
          {[
            { label: 'Тихий уголок', desc: 'Доступен всегда' },
            { label: 'Наушники', desc: 'При шуме' },
            { label: 'Пауза', desc: 'По запросу' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-xs font-bold">{s.label}</span>
              <Badge variant="alt">{s.desc}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Choices */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Выбор из 2 опций</h4>
        <p className="text-xs text-muted mb-2">Помогает снизить тревогу при принятии решений</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#f3f6fa] rounded-xl p-3 text-center text-xs font-bold">Вариант A</div>
          <div className="flex-1 bg-[#f3f6fa] rounded-xl p-3 text-center text-xs font-bold">Вариант B</div>
        </div>
      </Card>

      {/* What to Track */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Что отслеживать</h4>
        <div className="flex flex-wrap gap-2">
          {['Вода', 'Стул', 'Сигналы', 'Помощь'].map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};
