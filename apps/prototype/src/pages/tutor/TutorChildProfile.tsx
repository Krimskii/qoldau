import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Badge } from '@/components/ui/Badge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';

const whatHelps = ['Пауза 2–3 мин', 'Тихое место', 'Визуальное расписание', 'Наушники с тихой музыкой', 'AAC карточки'];
const avoidList = [
  'Резкие переходы между активностями',
  'Громкие групповые занятия без наушников',
  'Длинные инструкции без визуальной поддержки',
];
const preferences = [
  'Любит конструкторы',
  'Предпочитает короткие задания',
  'Хорошо реагирует на похвалу',
  'Спокойнее работает в первой половине дня',
];

export const TutorChildProfile: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId } = useDemoControlsStore();
  const child = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Профиль — ${child.name}`}
        subtitle={`${child.age} лет · Сейчас: ${child.currentState}`}
        showBack
      />

      <ChildSelector />

      {/* Signals */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-black text-ink mb-3">Ключевые сигналы</h4>
        {child.mainSignals.map((signal) => (
          <div
            key={signal.id}
            className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink">{signal.signal}</p>
              <p className="text-xs text-muted">{signal.possibleMeaning}</p>
            </div>
            <Badge variant="purple">{signal.confirmedCount} раз</Badge>
          </div>
        ))}
      </QoldauCard>

      {/* What helps */}
      <QoldauCard variant="tinted-green">
        <h4 className="text-sm font-black text-ink mb-3">Что помогает</h4>
        <div className="flex flex-wrap gap-2">
          {whatHelps.map((h) => (
            <Badge key={h} variant="green">{h}</Badge>
          ))}
        </div>
      </QoldauCard>

      {/* Avoid */}
      <QoldauCard variant="tinted-coral">
        <h4 className="text-sm font-black text-ink mb-3">Чего избегать</h4>
        <ul className="space-y-1.5">
          {avoidList.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
              <span className="text-coral mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      {/* Preferences */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-black text-ink mb-3">Предпочтения</h4>
        <ul className="space-y-1.5">
          {preferences.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
              <span className="text-teal mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      <button
        onClick={() => navigate('/specialist/communication-profile')}
        className="w-full h-12 rounded-2xl bg-white border border-line text-ink font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-bg transition-colors"
      >
        Коммуникационный профиль →
      </button>

      <QoldauCard variant="tinted-yellow">
        <p className="text-xs text-ink-2 leading-relaxed">
          Это профиль наблюдений, не медицинский диагноз. Все формулировки осторожные.
        </p>
      </QoldauCard>
    </div>
  );
};