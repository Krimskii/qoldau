import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockChild } from '@/data/mockChild';
import { mockTutorChild } from '@/data/mockTutor';

export const TutorChildProfile: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Профиль ребёнка"
        subtitle={`${mockChild.name}, ${mockChild.age} лет`}
        showBack
      />

      {/* Signals */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Ключевые сигналы</h4>
        {mockChild.mainSignals.slice(0, 4).map((signal) => (
          <div key={signal.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
            <div>
              <span className="text-sm font-bold">{signal.signal}</span>
              <p className="text-xs text-muted">{signal.possibleMeaning}</p>
            </div>
            <Badge>{signal.confirmedCount} раз</Badge>
          </div>
        ))}
      </Card>

      {/* What Helps */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Что помогает</h4>
        <div className="flex flex-wrap gap-2">
          {mockTutorChild.whatHelps.map((h) => (
            <Badge key={h}>{h}</Badge>
          ))}
        </div>
      </Card>

      {/* Sensory Triggers */}
      <Card variant="sensory">
        <h4 className="text-sm font-bold mb-3">Сенсорные триггеры</h4>
        <div className="flex flex-wrap gap-2">
          {mockTutorChild.sensoryTriggers.map((t) => (
            <Badge key={t} variant="alt">{t}</Badge>
          ))}
        </div>
      </Card>

      {/* Parent Contact */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Контакты родителей</h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#eefbf2] flex items-center justify-center text-xl">👩</div>
          <div>
            <p className="text-sm font-bold">Мама</p>
            <p className="text-xs text-muted">+7 (999) 123-45-67</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
