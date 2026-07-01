import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Button } from '@/components/ui/Button';
import { mockAIParsedObservation } from '@/data/mockEvents';

export const TutorAIReview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="AI-разбор"
        subtitle="Проверьте информацию"
        showBack
      />

      {/* Activity Summary */}
      <Card>
        <h4 className="text-sm font-bold mb-2">Активность</h4>
        <p className="text-xs text-ink-2">Отказ от задания, пауза 10 минут, еда</p>
      </Card>

      {/* Behavior */}
      <Card variant="behavior">
        <h4 className="text-sm font-bold mb-2">Поведение</h4>
        <p className="text-xs text-ink-2">Нервничал, закрывал уши, потом успокоился</p>
      </Card>

      {/* AI Insight */}
      <AIInsightCard
        text="Похоже, нервозность могла быть связана с переходом к новому заданию. Пауза и тихое место помогли снизить нагрузку. Это наблюдение, не диагноз."
        variant="warning"
      />

      {/* What Helped */}
      <Card>
        <h4 className="text-sm font-bold mb-2">Что помогло</h4>
        <div className="flex gap-2">
          <span className="text-xs bg-green-soft text-green px-2 py-1 rounded-full">Пауза</span>
          <span className="text-xs bg-green-soft text-green px-2 py-1 rounded-full">Тихое место</span>
        </div>
      </Card>

      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={() => navigate('/tutor/report')}>Сохранить в дневник</Button>
        <Button variant="secondary">Отправить родителю</Button>
      </div>
    </div>
  );
};
