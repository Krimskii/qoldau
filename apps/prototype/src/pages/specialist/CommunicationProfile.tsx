import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockChild } from '@/data/mockChild';
import { mockSpecialistData } from '@/data/mockSpecialist';

export const CommunicationProfile: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Коммуникационный профиль"
        subtitle={`${mockChild.name}, ${mockChild.age} лет`}
        showBack
      />

      {/* Signals */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Сигналы ребёнка</h4>
        <p className="text-xs text-muted mb-3">Сигнал → Возможное значение → Подтверждён</p>
        {mockSpecialistData.signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
            <div className="flex-1">
              <span className="text-sm font-bold">{s.signal}</span>
            </div>
            <span className="text-xs text-muted mx-2">→</span>
            <span className="text-xs text-ink-2 flex-1">{s.possibleMeaning}</span>
            <Badge>{s.confirmed} раз</Badge>
          </div>
        ))}
      </Card>

      {/* Communication Methods */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Методы коммуникации</h4>
        <div className="flex flex-wrap gap-2">
          {['AAC карточки', 'Жесты', 'Звуки', 'Взгляд'].map((m) => (
            <Badge key={m}>{m}</Badge>
          ))}
        </div>
      </Card>

      {/* Progress */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Прогресс за месяц</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Новых сигналов</span>
            <span className="text-xs font-bold text-teal">+2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Использование AAC</span>
            <span className="text-xs font-bold text-teal">+15%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Спонтанные звуки</span>
            <span className="text-xs font-bold text-green">↑</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
