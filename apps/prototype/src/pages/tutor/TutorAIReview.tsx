import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Button } from '@/components/ui/Button';
import { useEventStore } from '@/store/useEventStore';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { QoldauEvent } from '@/types/qoldau';

interface ParsedEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  confidence: number;
}

export const TutorAIReview: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent, addEvents } = useEventStore();
  const { parsedObservation, transcript, isProcessing, processTranscript, reset } = useVoiceObservationStore();
  const { showToast } = useToastStore();
  const [events, setEvents] = useState<ParsedEvent[]>([]);

  useEffect(() => {
    if (!parsedObservation) {
      processTranscript().then((result) => {
        setEvents(result.events);
      });
    } else {
      setEvents(parsedObservation.events);
    }
  }, [parsedObservation, processTranscript]);

  const handleSave = () => {
    const baseTime = new Date().toISOString();
    const newEvents: Omit<QoldauEvent, 'id'>[] = events.map((event) => ({
      childId: DEMO_PRIMARY_CHILD.id,
      type: (event.type as QoldauEvent['type']) || 'tutor_note',
      title: event.title,
      description: event.description,
      timestamp: baseTime,
      sourceRole: 'tutor',
      status: 'confirmed',
      confidence: event.confidence,
      rawText: transcript,
      payload: {
        source: 'tutor_voice_observation',
        aiInsight: parsedObservation?.insight ?? '',
      },
    }));

    if (newEvents.length === 0) {
      // Fallback: at least create a tutor_note so the report has data
      addEvent({
        childId: DEMO_PRIMARY_CHILD.id,
        type: 'tutor_note',
        title: 'Наблюдение тьютора',
        description: transcript || 'Без расшифровки',
        timestamp: baseTime,
        sourceRole: 'tutor',
        status: 'confirmed',
        rawText: transcript,
        payload: { source: 'tutor_voice_observation' },
      });
    } else {
      addEvents(newEvents);
    }

    showToast('Сохранено в Event Timeline', 'success');
    reset();
    navigate('/tutor/report');
  };

  const handleSkip = () => {
    showToast('Без сохранения', 'info');
    reset();
    navigate('/tutor/home');
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-teal border-t-transparent animate-spin" />
        <p className="text-muted">AI обрабатывает…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="AI-разбор"
        subtitle="Проверьте и сохраните"
        showBack
      />

      {/* Transcript */}
      {transcript && (
        <Card variant="default">
          <p className="text-xs font-bold text-muted mb-2">Расшифровка</p>
          <p className="text-sm text-ink-2 italic">"{transcript}"</p>
        </Card>
      )}

      {/* Activity */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Что произошло</h4>
        {events.length === 0 ? (
          <p className="text-sm text-muted">AI не выделил событий. Можно сохранить общую заметку.</p>
        ) : (
          events.map((event, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-2 border-b border-line last:border-0"
            >
              <span className="text-xs text-muted font-bold min-w-[40px]">
                {event.timestamp}
              </span>
              <div>
                <div className="text-sm font-bold">{event.title}</div>
                <div className="text-xs text-muted">{event.description}</div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* What helped */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-2">Что помогло</h4>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-green-soft text-green px-3 py-1 rounded-full font-bold">Пауза</span>
          <span className="text-xs bg-green-soft text-green px-3 py-1 rounded-full font-bold">Тихое место</span>
          <span className="text-xs bg-green-soft text-green px-3 py-1 rounded-full font-bold">Визуальное расписание</span>
        </div>
      </Card>

      <AIInsightCard
        text="Похоже, сегодня ребёнок хорошо использовал визуальные подсказки и паузы. Это наблюдение, не диагноз. Можно обсудить со специалистом."
        variant="warning"
      />

      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={handleSave}>Сохранить в Event Timeline</Button>
        <Button variant="secondary" onClick={() => navigate('/tutor/report')}>
          К отчёту
        </Button>
        <Button variant="ghost" onClick={handleSkip}>
          Не сохранять
        </Button>
      </div>
    </div>
  );
};