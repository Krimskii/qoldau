import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { PrimaryAction, EventTypeBadge } from '@/components/ui/Primitives';
import { AppIcon } from '@/components/ui/AppIcon';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { ParsedEvent } from '@/lib/ai/aiParser.types';
import { VoiceWaveIcon } from '@/components/icons';
import { eventTypeColors, toneToColor, type EventTone } from '@/styles/tokens';

/**
 * Parent AIReview — структурированная проверка наблюдения.
 *
 * Layout:
 * 1. Transcript наверху (откуда AI извлёк события)
 * 2. Parsed events с EventTypeBadge
 * 3. AI disclaimer + insight
 * 4. Primary action: "Продолжить" / "Не сохранять"
 */
export const AIReview: React.FC = () => {
  const navigate = useNavigate();
  const {
    parsedObservation,
    currentTranscript,
    editedTranscript,
    originalTranscript,
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

  const effectiveTranscript = editedTranscript || currentTranscript || originalTranscript;

  const handleContinue = () => navigate('/parent/clarify');
  const handleSkip = () => {
    reset();
    navigate('/parent/home');
  };
  const handleEditTranscript = () => navigate('/parent/voice');

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center qoldau-soft-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-sm font-bold text-ink">AI обрабатывает…</p>
        <p className="text-xs text-muted">Структурируем наблюдение.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="AI-разбор"
        subtitle="Проверьте, всё ли правильно"
        showBack
        fallbackPath="/parent/voice"
      />

      {/* 1. Transcript — откуда AI извлёк события */}
      {effectiveTranscript && (
        <QoldauCard variant="tinted-blue" padding="md">
          <div className="flex items-center gap-2 mb-2">
            <AppIcon component={VoiceWaveIcon} size={16} colorClass="text-blue" />
            <p className="text-xs font-black text-blue uppercase tracking-wide">
              Исходная фраза
            </p>
            <button
              onClick={handleEditTranscript}
              className="ml-auto text-xs text-blue underline hover:text-blue-dark"
            >
              Изменить
            </button>
          </div>
          <p className="text-sm text-ink italic leading-relaxed">
            «{effectiveTranscript}»
          </p>
        </QoldauCard>
      )}

      {/* 2. Parsed Events — AI-гипотезы */}
      <section>
        <header className="flex items-center gap-2 mb-2 px-1">
          <Sparkles size={14} className="text-teal" />
          <h3 className="text-sm font-black text-ink">
            AI предложил {events.length} {events.length === 1 ? 'событие' : events.length < 5 ? 'события' : 'событий'}
          </h3>
          <span className="text-[10px] text-muted italic ml-auto">
            нужно подтвердить
          </span>
        </header>

        {events.length === 0 ? (
          <QoldauCard variant="default" padding="md">
            <p className="text-sm text-muted text-center py-2">
              AI не смог выделить событий. Возможно, описание слишком короткое.
            </p>
          </QoldauCard>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event, i) => {
              const cfg = (eventTypeColors as Record<string, { tone: EventTone; emoji: string }>)[
                event.type
              ];
              const tone: EventTone = cfg?.tone ?? 'blue';
              const toneColor = toneToColor(tone);
              const emoji = cfg?.emoji ?? '📋';
              return (
                <QoldauCard
                  key={i}
                  variant="default"
                  padding="md"
                  hoverable
                  ariaLabel={`Событие: ${event.title}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                      style={{
                        backgroundColor: `${toneColor}15`,
                        borderColor: `${toneColor}30`,
                      }}
                    >
                      <span className="text-2xl leading-none" aria-hidden="true">
                        {emoji}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <EventTypeBadge eventType={event.type} size="sm" />
                        {event.confidence && (
                          <span className="text-[11px] font-bold text-muted">
                            уверенность {Math.round(event.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-ink leading-tight">
                        {event.title}
                      </p>
                      <p className="text-xs text-ink-2 leading-relaxed mt-1">
                        {event.description}
                      </p>
                      {event.timestamp && (
                        <p className="text-xs text-muted mt-1.5 font-bold">
                          {event.timestamp}
                        </p>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-line flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-muted opacity-50" />
                    </div>
                  </div>
                </QoldauCard>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. AI Insight — осторожная формулировка */}
      {parsedObservation?.insight && (
        <QoldauCard variant="tinted-yellow" padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-yellow" />
            <p className="text-xs font-black text-yellow uppercase tracking-wide">
              AI-наблюдение
            </p>
            <span className="text-[10px] text-muted italic ml-auto">
              не диагноз
            </span>
          </div>
          <p className="text-sm text-ink-2 leading-relaxed">
            {parsedObservation.insight}
          </p>
        </QoldauCard>
      )}

      {/* 4. Disclaimer */}
      <p className="text-xs text-muted text-center italic px-4 leading-relaxed">
        События сохранятся в Event Timeline после вашего подтверждения на следующем шаге.
        Это наблюдение, не диагноз. Можно отредактировать или отклонить.
      </p>

      {/* 5. Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <PrimaryAction
          label="Подтвердить и продолжить"
          onClick={handleContinue}
          variant="primary"
          size="lg"
          iconRight={<ArrowRight size={18} />}
        />
        <PrimaryAction
          label="Не сохранять"
          onClick={handleSkip}
          variant="ghost"
          size="md"
        />
      </div>
    </div>
  );
};