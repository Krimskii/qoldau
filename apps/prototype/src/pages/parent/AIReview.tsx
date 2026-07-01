import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { ParsedEvent } from '@/lib/ai/aiParser.types';

interface ParsedDisplay {
  type: string;
  title: string;
  description: string;
  color: 'teal' | 'blue' | 'purple' | 'yellow' | 'green';
  emoji: string;
}

const COLOR_MAP: Record<string, ParsedDisplay['color']> = {
  food: 'green',
  toilet: 'blue',
  behavior: 'yellow',
  communication: 'purple',
  sensory: 'yellow',
  water: 'blue',
  state: 'teal',
};

const EMOJI_MAP: Record<string, string> = {
  food: '🍎',
  toilet: '🚽',
  behavior: '⚡',
  communication: '💬',
  sensory: '👂',
  water: '💧',
  state: '😐',
};

export const AIReview: React.FC = () => {
  const navigate = useNavigate();
  const {
    parsedObservation,
    transcript,
    isProcessing,
    processTranscript,
    reset,
  } = useVoiceObservationStore();
  const [events, setEvents] = useState<ParsedEvent[]>([]);

  useEffect(() => {
    if (!parsedObservation) {
      processTranscript().then((result) => setEvents(result.events));
    } else {
      setEvents(parsedObservation.events);
    }
  }, [parsedObservation, processTranscript]);

  const handleContinue = () => {
    // Не создаём события — ClarifyingQuestions сделает это после подтверждения
    navigate('/parent/clarify');
  };

  const handleSkip = () => {
    reset();
    navigate('/parent/home');
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
        <p className="text-sm font-bold text-muted">AI обрабатывает...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="AI-разбор" subtitle="Проверьте, всё ли правильно" showBack />

      {/* Transcript */}
      {transcript && (
        <Card variant="tinted-blue">
          <p className="text-xs font-bold text-blue uppercase tracking-wide mb-2">
            Расшифровка
          </p>
          <p className="text-sm text-ink italic leading-relaxed">"{transcript}"</p>
        </Card>
      )}

      {/* Parsed Events — цветные карточки */}
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2 px-1">
          AI предложил {events.length} событий
        </p>
        <div className="flex flex-col gap-3">
          {events.map((event, i) => {
            const color = COLOR_MAP[event.type] ?? 'teal';
            const emoji = EMOJI_MAP[event.type] ?? '📋';
            const variantMap: Record<typeof color, any> = {
              teal: 'tinted-teal',
              blue: 'tinted-blue',
              purple: 'tinted-purple',
              yellow: 'tinted-yellow',
              green: 'tinted-green',
            };
            return (
              <Card key={i} variant={variantMap[color]} className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-card-soft">
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-ink">{event.title}</p>
                  <p className="text-xs text-muted leading-relaxed mt-0.5">
                    {event.description}
                  </p>
                  <p className="text-xs text-muted mt-1 font-bold">{event.timestamp}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI note */}
      {parsedObservation && (
        <AIInsightCard
          text={parsedObservation.insight}
          variant="warning"
          title="AI-заметка"
        />
      )}

      <p className="text-xs text-muted text-center italic px-4">
        События сохранятся после вашего подтверждения на следующем шаге.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <Button
          block
          size="lg"
          onClick={handleContinue}
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          Подтвердить и продолжить
        </Button>
        <Button block size="lg" variant="outline" onClick={handleSkip}>
          Не сохранять
        </Button>
      </div>
    </div>
  );
};