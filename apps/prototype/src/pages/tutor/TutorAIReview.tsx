import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { QoldauEvent } from '@/types/qoldau';

export const TutorAIReview: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent, addEvents } = useEventStore();
  const { parsedObservation, transcript, isProcessing, processTranscript, reset } =
    useVoiceObservationStore();
  const { showToast } = useToastStore();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!parsedObservation) {
      processTranscript().then((result) => setEvents(result.events));
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
      <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border-4 border-teal border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-muted">AI обрабатывает…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="AI-разбор" subtitle="Проверьте и сохраните" showBack />

      {transcript && (
        <Card variant="tinted-blue">
          <p className="text-xs font-black text-blue uppercase tracking-wide mb-2">Расшифровка</p>
          <p className="text-sm text-ink italic leading-relaxed">"{transcript}"</p>
        </Card>
      )}

      <Card variant="default">
        <h4 className="text-sm font-black text-ink mb-3">Что произошло</h4>
        {events.length === 0 ? (
          <p className="text-sm text-muted">AI не выделил событий. Можно сохранить общую заметку.</p>
        ) : (
          events.map((event, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 py-2.5 ${
                i < events.length - 1 ? 'border-b border-line-soft' : ''
              }`}
            >
              <span className="text-xs text-muted font-bold tabular-nums min-w-[40px]">
                {event.timestamp}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{event.title}</p>
                <p className="text-xs text-muted leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))
        )}
      </Card>

      <Card variant="tinted-green">
        <h4 className="text-sm font-black text-ink mb-2">Что помогло</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-green-soft text-green text-xs font-bold">Пауза</span>
          <span className="px-3 py-1 rounded-full bg-green-soft text-green text-xs font-bold">Тихое место</span>
          <span className="px-3 py-1 rounded-full bg-green-soft text-green text-xs font-bold">Визуальное расписание</span>
        </div>
      </Card>

      <Card variant="tinted-yellow">
        <h4 className="text-sm font-black text-ink mb-2">Что стоит подтвердить дома</h4>
        <ul className="space-y-1.5">
          <li className="text-sm text-ink-2 leading-relaxed">• Связь шума и закрывания ушей</li>
          <li className="text-sm text-ink-2 leading-relaxed">• Эффект визуального расписания</li>
        </ul>
      </Card>

      <AIInsightCard
        text="Похоже, сегодня ребёнок хорошо использовал визуальные подсказки и паузы. Это наблюдение, не диагноз. Можно обсудить со специалистом."
      />

      <div className="flex flex-col gap-2 mt-2">
        <Button block size="lg" onClick={handleSave} iconRight={<ArrowRight className="w-4 h-4" />}>
          Сохранить в Event Timeline
        </Button>
        <Button block size="lg" variant="outline" onClick={() => navigate('/tutor/report')}>
          К отчёту
        </Button>
        <Button block size="lg" variant="ghost" onClick={handleSkip}>
          Не сохранять
        </Button>
      </div>
    </div>
  );
};