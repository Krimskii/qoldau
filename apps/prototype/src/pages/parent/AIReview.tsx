import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Utensils, Droplet, Smile, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';
import { useEventStore } from '@/store/useEventStore';
import { ParsedEvent } from '@/lib/aiParser.mock';
import { EventType } from '@/types/qoldau';

const eventIcons: Record<string, React.ElementType> = {
  food: Utensils,
  toilet: Droplet,
  behavior: Smile,
  communication: Brain,
};

const eventColors: Record<string, 'food' | 'behavior' | 'toilet' | 'sensory'> = {
  food: 'food',
  behavior: 'behavior',
  toilet: 'toilet',
  communication: 'behavior',
};

const eventTypeMap: Record<string, EventType> = {
  food: 'food',
  toilet: 'toilet',
  behavior: 'behavior',
  communication: 'communication',
  water: 'water',
  sensory: 'sensory',
  state: 'state',
};

export const AIReview: React.FC = () => {
  const navigate = useNavigate();
  const { parsedObservation, isProcessing, processTranscript, reset } = useVoiceObservationStore();
  const { addEvents, clarifyingAnswers } = useEventStore();
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

  const handleSaveAll = () => {
    // Map parsed events to QoldauEvents
    const newEvents = events.map((event) => ({
      childId: 'child-1',
      type: eventTypeMap[event.type] || 'voice_observation',
      title: event.title,
      description: event.description,
      timestamp: new Date().toISOString(),
      sourceRole: 'parent' as const,
      status: 'ai_parsed' as const,
      confidence: event.confidence,
      rawText: clarifyingAnswers[event.title] || '',
      payload: { ...clarifyingAnswers },
    }));

    addEvents(newEvents);
    navigate('/parent/clarify');
  };

  const handleEdit = () => {
    navigate('/parent/voice');
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-20">
        <Sparkles className="w-8 h-8 text-teal animate-pulse" />
        <p className="text-muted">AI обрабатывает...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="AI-разбор наблюдения"
        subtitle="Проверьте, всё ли правильно"
        rightAction={<Sparkles className="w-5 h-5 text-teal" />}
      />

      {/* Parsed Events */}
      {events.map((event, i) => {
        const Icon = eventIcons[event.type] || Brain;
        return (
          <Card key={i} variant={eventColors[event.type] || 'default'}>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center text-teal-dark">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{event.title}</h4>
                <p className="text-xs text-ink-2 leading-relaxed">
                  {event.description}
                  <br />
                  <strong>{event.timestamp}</strong>
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {/* AI Note */}
      {parsedObservation && (
        <AIInsightCard text={parsedObservation.insight} variant="warning" />
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={handleSaveAll}>Сохранить всё</Button>
        <Button variant="secondary" onClick={handleEdit}>
          Исправить
        </Button>
        <Button variant="ghost" onClick={reset}>
          Не сохранять аудио
        </Button>
      </div>
    </div>
  );
};
