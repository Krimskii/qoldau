import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Badge } from '@/components/ui/Badge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';

const schedule = ['Утро', 'Занятия', 'Обед', 'Отдых', 'Прогулка'];
const sensory = [
  { label: 'Тихий уголок', desc: 'Доступен всегда' },
  { label: 'Наушники', desc: 'При шуме' },
  { label: 'Пауза', desc: 'По запросу' },
];
const whatHelps = ['Визуальное расписание', 'AAC карточки', 'Паузы 2–3 мин', 'Тактильные инструменты'];
const toTry = ['Таймер перехода (2 мин до смены активности)', 'Карточка «Громко» для самостоятельного сигнала', 'Сенсорная коробка в уголке'];
const toConfirm = ['Связь шума и нервозности', 'Частота использования AAC', 'Эффект визуального расписания'];

export const SupportPlan: React.FC = () => {
  const { selectedChildId } = useDemoControlsStore();
  const child = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="План поддержки"
        subtitle={`${child.name}, ${child.age} лет`}
        showBack
      />

      <ChildSelector />

      <QoldauCard variant="default" className="bg-yellow-soft border-yellow/30">
        <p className="text-sm text-ink-2">
          <strong>Это план поддержки.</strong> Не план лечения. Все шаги — гипотезы, не медицинские назначения.
        </p>
      </QoldauCard>

      {/* Visual Schedule */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">Визуальное расписание</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {schedule.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-16 rounded-xl bg-gradient-to-br from-teal-soft to-white border border-teal/30 flex items-center justify-center text-xs font-bold text-teal-dark"
            >
              {s}
            </div>
          ))}
        </div>
      </QoldauCard>

      {/* Sensory Support */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">Сенсорная поддержка</h4>
        <div className="space-y-2">
          {sensory.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm font-bold">{s.label}</span>
              <Badge className="bg-blue-soft text-blue">{s.desc}</Badge>
            </div>
          ))}
        </div>
      </QoldauCard>

      {/* What helps */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">Что помогает</h4>
        <div className="flex flex-wrap gap-2">
          {whatHelps.map((h) => (
            <Badge key={h} className="bg-green-soft text-green">{h}</Badge>
          ))}
        </div>
      </QoldauCard>

      {/* To try */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">Что стоит попробовать</h4>
        <ul className="space-y-2">
          {toTry.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
              <span className="text-teal mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      {/* To confirm */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">Что подтвердить наблюдениями</h4>
        <ul className="space-y-2">
          {toConfirm.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
              <span className="text-yellow mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      <QoldauCard variant="default" className="bg-blue-soft border-blue/20">
        <p className="text-sm text-ink-2">
          <strong>Что обсудить со специалистом:</strong> текущие паттерны поведения, сенсорная поддержка, развитие коммуникации.
        </p>
      </QoldauCard>
    </div>
  );
};