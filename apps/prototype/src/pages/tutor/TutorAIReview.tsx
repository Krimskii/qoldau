import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Button } from '@/components/ui/Button';
import { useEventStore } from '@/store/useEventStore';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';

export const TutorAIReview: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { parsedObservation, isProcessing, processTranscript } = useVoiceObservationStore();
  const [events, setEvents] = useState<Array<{ type: string; title: string; description: string }>>([]);

  useEffect(() => {
    if (!parsedObservation) {
      processTranscript().then((result) => {
        setEvents(result.events.map((e) => ({
          type: e.type,
          title: e.title,
          description: e.description,
        })));
      });
    } else {
      setEvents(parsedObservation.events.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.description,
      })));
    }
  }, [parsedObservation, processTranscript]);

  const handleSave = () => {
    // Create events from AI review
    const newEvents = events.map((event) => ({
      childId: 'child-1',
      type: event.type as 'behavior' | 'communication' | 'toilet' | 'food' | 'state',
      title: event.title,
      description: event.description,
      timestamp: new Date().toISOString(),
      sourceRole: 'tutor' as const,
      status: 'ai_parsed' as const,
    }));

    addEvent(newEvents[0]); // Add first event
    navigate('/tutor/report');
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-20">
        <p className="text-muted">AI обрабатывает...</p>
      </div>
    );
  }

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
        <p className="text-xs text-ink-2">
          {events.length > 0 ? events[0].description : 'Отказ от задания, пауза 10 минут, еда'}
        </p>
      </Card>

      {/* Behavior */}
      {events.find((e) => e.type === 'behavior') && (
        <Card variant="behavior">
          <h4 className="text-sm font-bold mb-2">Поведение</h4>
          <p className="text-xs text-ink-2">
            {events.find((e) => e.type === 'behavior')?.description}
          </p>
        </Card>
      )}

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
        <Button onClick={handleSave}>Сохранить в дневник</Button>
        <Button variant="secondary" onClick={() => navigate('/tutor/report')}>
          Отправить родителю
        </Button>
      </div>
    </div>
  );
};
