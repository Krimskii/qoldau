import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { useToastStore } from '@/store/useToastStore';
import { createEventsFromAIReview } from '@/lib/events/eventFactory';
import { DEMO_PRIMARY_CHILD_ID } from '@/data/demoDataset';

export const TutorAIReview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addEvents } = useEventStore();
  const {
    parsedObservation,
    currentTranscript,
    originalTranscript,
    editedTranscript,
    isProcessing,
    processTranscript,
    reset,
    sttSource,
    childId,
  } = useVoiceObservationStore();
  const { showToast } = useToastStore();
  const [hasRun, setHasRun] = React.useState(false);

  // Запускаем полный flow (mock STT + AI) только один раз, если ещё не запускали.
  React.useEffect(() => {
    if (!parsedObservation && !hasRun && !isProcessing) {
      setHasRun(true);
      processTranscript();
    }
  }, [parsedObservation, hasRun, isProcessing, processTranscript]);

  const effectiveTranscript =
    editedTranscript || originalTranscript || currentTranscript;

  const handleSave = () => {
    if (!parsedObservation) {
      showToast(t('tutor.aiReview.noDataToast'), 'error');
      navigate('/tutor/home');
      return;
    }

    const batch = createEventsFromAIReview({
      parsed: parsedObservation,
      transcript: originalTranscript || currentTranscript,
      editedTranscript:
        editedTranscript && editedTranscript !== originalTranscript
          ? editedTranscript
          : undefined,
      originalTranscript,
      sttSource,
      sourceRole: 'tutor',
      childId: childId || DEMO_PRIMARY_CHILD_ID,
      status: 'confirmed',
    });

    addEvents([...batch.extracted, batch.observation]);

    showToast(t('tutor.aiReview.savedToast'), 'success');
    reset();
    navigate('/tutor/report');
  };

  const handleSkip = () => {
    showToast(t('tutor.aiReview.skippedToast'), 'info');
    reset();
    navigate('/tutor/home');
  };

  if (isProcessing || !parsedObservation) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border-4 border-teal border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-muted">{t('tutor.aiReview.processing')}</p>
      </div>
    );
  }

  const events = parsedObservation.events;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t('tutor.nav.aiReview')} subtitle={t('tutor.aiReview.transcript')} showBack />

      {effectiveTranscript && (
        <QoldauCard variant="tinted-blue">
          <p className="text-xs font-black text-blue uppercase tracking-wide mb-2">
            {t('tutor.aiReview.transcript')}
          </p>
          <p className="text-sm text-ink italic leading-relaxed">
            "{effectiveTranscript}"
          </p>
        </QoldauCard>
      )}

      <QoldauCard variant="default">
        <h4 className="text-sm font-black text-ink mb-3">{t('tutor.aiReview.whatHappened')}</h4>
        {events.length === 0 ? (
          <p className="text-sm text-muted">{t('tutor.aiReview.noEvents')}</p>
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
                <p className="text-xs text-muted leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))
        )}
      </QoldauCard>

      <AIInsightCard
        text={parsedObservation.insight || t('tutor.aiReview.defaultInsight')}
        variant="default"
      />

      <div className="flex flex-col gap-2 mt-2">
        <Button block size="lg" onClick={handleSave} iconRight={<ArrowRight className="w-4 h-4" />}>
          {t('tutor.aiReview.save')}
        </Button>
        <Button block size="lg" variant="outline" onClick={() => navigate('/tutor/report')}>
          {t('tutor.aiReview.toReport')}
        </Button>
        <Button block size="lg" variant="ghost" onClick={handleSkip}>
          {t('tutor.aiReview.skip')}
        </Button>
      </div>
    </div>
  );
};