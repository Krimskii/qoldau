import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Utensils, Droplet, Smile, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/lib/useVoiceObservationStore';
import { ParsedEvent } from '@/lib/aiParser.mock';

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

/**
 * AIReview no longer creates events directly.
 * It only stores the AI-parsed observation in useVoiceObservationStore,
 * and lets the user proceed to ClarifyingQuestions, which is the single
 * place that creates confirmed QoldauEvents from voice observations.
 *
 * This prevents the previous bug where events were created twice (here
 * and again in ClarifyingQuestions) with status: ai_parsed instead of confirmed.
 */
export const AIReview: React.FC = () => {
  const navigate = useNavigate();
  const { parsedObservation, isProcessing, processTranscript, transcript, reset } = useVoiceObservationStore();
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

  const handleContinue = () => {
    // Do NOT create events here. The user must answer clarifying questions
    // and confirm. ClarifyingQuestions will read transcript, parsedObservation
    // and answers from stores, then create the confirmed events.
    navigate('/parent/clarify');
  };

  const handleEdit = () => {
    navigate('/parent/voice');
  };

  const handleDiscard = () => {
    reset();
    navigate('/parent/home');
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

      {/* Transcript */}
      {transcript && (
        <div className="bg-white border border-line rounded-2xl p-4">
          <p className="text-xs font-bold text-muted mb-2">Расшифровка</p>
          <p className="text-sm text-ink-2 italic">"{transcript}"</p>
        </div>
      )}

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

      <p className="text-xs text-muted text-center">
        События будут созданы после вашего подтверждения на следующем шаге.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={handleContinue}>Подтвердить и продолжить</Button>
        <Button variant="secondary" onClick={handleEdit}>
          Исправить запись
        </Button>
        <Button variant="ghost" onClick={handleDiscard}>
          Не сохранять
        </Button>
      </div>
    </div>
  );
};