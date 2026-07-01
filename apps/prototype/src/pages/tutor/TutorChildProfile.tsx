import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const whatHelps = ['Пауза 2–3 мин', 'Тихое место', 'Визуальное расписание', 'Наушники с тихой музыкой', 'AAC карточки'];
const avoidList = ['Резкие переходы между активностями', 'Громкие групповые занятия без наушников', 'Длинные инструкции без визуальной поддержки'];
const preferences = ['Любит конструкторы', 'Предпочитает короткие задания', 'Хорошо реагирует на похвалу', 'Спокойнее работает в первой половине дня'];

export const TutorChildProfile: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Профиль — ${child.name}`}
        subtitle={`${child.age} лет · Сейчас: ${child.currentState}`}
        showBack
      />

      {/* Signals */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Ключевые сигналы</h4>
        {child.mainSignals.map((signal) => (
          <div
            key={signal.id}
            className="flex items-center justify-between py-2.5 border-b border-line last:border-0"
          >
            <div>
              <span className="text-sm font-bold">{signal.signal}</span>
              <p className="text-xs text-muted">{signal.possibleMeaning}</p>
            </div>
            <Badge className="bg-purple-soft text-purple">{signal.confirmedCount} раз</Badge>
          </div>
        ))}
      </Card>

      {/* What helps */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Что помогает</h4>
        <div className="flex flex-wrap gap-2">
          {whatHelps.map((h) => (
            <Badge key={h} className="bg-green-soft text-green">{h}</Badge>
          ))}
        </div>
      </Card>

      {/* Avoid */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Чего избегать</h4>
        <ul className="space-y-1.5">
          {avoidList.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
              <span className="text-coral mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* Preferences */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Предпочтения</h4>
        <ul className="space-y-1.5">
          {preferences.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
              <span className="text-teal mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* Communication profile link */}
      <button
        onClick={() => navigate('/specialist/communication-profile')}
        className="bg-white border border-line rounded-2xl p-4 flex items-center justify-between hover:shadow-card-soft transition-shadow"
      >
        <span className="text-sm font-bold">Коммуникационный профиль</span>
        <span className="text-muted">→</span>
      </button>

      <Card variant="default" className="bg-yellow-soft border-yellow/20">
        <p className="text-xs text-ink-2 leading-relaxed">
          Это профиль наблюдений, не медицинский диагноз. Все формулировки осторожные.
        </p>
      </Card>
    </div>
  );
};