import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { formatDuration } from '@/utils/formatDuration';

export const TutorVoice: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startRecording, stopRecording } = useVoiceObservationStore();
  const timer = useElapsedTimer();

  const startRec = useCallback(() => {
    startRecording();
    timer.start();
  }, [startRecording, timer]);

  const stopRec = useCallback(() => {
    timer.stop();
    stopRecording();
    navigate('/tutor/ai-review');
  }, [navigate, stopRecording, timer]);

  const handleRecord = () => (timer.isActive ? stopRec() : startRec());

  // Локализованные примеры наблюдений
  const examples = t('tutor.voice.examples', { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col gap-6 min-h-[70vh]">
      <PageHeader
        title={t('tutor.voice.title')}
        subtitle={t('tutor.voice.subtitle')}
        showBack
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        <button
          onClick={handleRecord}
          aria-label={timer.isActive ? t('tutor.voice.stopAria') : t('tutor.voice.startAria')}
          className={`w-48 h-48 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            timer.isActive
              ? 'bg-gradient-to-br from-coral to-coral-dark'
              : 'bg-gradient-to-br from-teal to-teal-dark'
          }`}
          style={{
            boxShadow: timer.isActive
              ? '0 0 0 20px rgba(229,111,93,0.10), 0 0 0 40px rgba(229,111,93,0.05), 0 24px 40px rgba(229,111,93,0.30)'
              : '0 0 0 20px rgba(0,150,136,0.08), 0 0 0 40px rgba(0,150,136,0.045), 0 24px 40px rgba(0,150,136,0.25)',
          }}
        >
          {timer.isActive ? (
            <MicOff className="w-24 h-24 text-white" strokeWidth={2.5} />
          ) : (
            <Mic className="w-24 h-24 text-white" strokeWidth={2.5} />
          )}
        </button>

        {timer.isActive && (
          <>
            <div className="w-full max-w-xs">
              <VoiceWave />
            </div>
            <div className="text-3xl font-black text-ink tabular-nums">
              {formatDuration(timer.seconds)}
            </div>
          </>
        )}

        {!timer.isActive && (
          <p className="text-sm text-muted text-center max-w-xs">
            {t('tutor.voice.hint')}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-muted mb-2 px-1">
          {t('tutor.voice.examplesTitle')}
        </p>
        <div className="flex flex-col gap-2">
          {examples.map((ex, i) => (
            <div
              key={i}
              className="text-sm border border-line-soft bg-white rounded-2xl px-4 py-2.5 text-ink-2"
            >
              {ex}
            </div>
          ))}
        </div>
      </div>

      {timer.isActive && (
        <button
          onClick={handleRecord}
          className="w-full h-13 rounded-2xl bg-coral text-white font-bold text-base shadow-card active:scale-[0.98] transition-all"
        >
          {t('tutor.voice.stopAria')}
        </button>
      )}
    </div>
  );
};