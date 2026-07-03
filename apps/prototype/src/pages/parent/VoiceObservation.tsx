import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Edit3,
  Sparkles,
  Keyboard,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { useEventStore } from '@/store/useEventStore';
import { useAuthStore } from '@/store/useAuthStore';
import { VoiceWaveIcon } from '@/components/icons';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { PrimaryAction } from '@/components/ui/Primitives';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { useSpeechRecognition } from '@/lib/stt/useSpeechRecognition';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { uploadAudioObservation, type AudioPipelineResponse } from '@/api/audio';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { formatDuration } from '@/utils/formatDuration';
import type { QoldauEvent } from '@/types/qoldau';

const DEMO_TRANSCRIPT =
  'Ребёнок поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.';

/** Что сейчас делает UI относительно audio pipeline. */
type AudioPipelinePhase =
  | 'idle'
  | 'recording'
  | 'stopping'
  | 'uploading'
  | 'success'
  | 'fallback'
  | 'error';

/** Что доступно в браузере для записи аудио. */
function detectMediaRecorderSupport(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof MediaRecorder === 'undefined') return false;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  return true;
}

/**
 * Parent VoiceObservation — UI для голосового наблюдения (v0.7.6).
 *
 * Primary path: MediaRecorder → POST /api/audio/ingest → backend создаёт
 * Event[s] + broadcasts через socket → навигация в /parent/timeline.
 *
 * Fallback path: Web Speech API (если MediaRecorder недоступен ИЛИ backend
 * упал). Старый flow с transcribeManual / processWithAI сохраняется для demo
 * и ручного ввода — demo не ломается.
 *
 * Wording: AI-выводы формулируются как наблюдения, не диагноз.
 * Запрещены medical claims (см. docs/SAFETY_WORDING.md).
 */
export const VoiceObservation: React.FC = () => {
  const navigate = useNavigate();
  const timer = useElapsedTimer();

  // Capability detection (один раз при mount).
  const mediaRecorderSupported = useRef(detectMediaRecorderSupport()).current;

  const {
    recordingState,
    originalTranscript,
    currentTranscript,
    sttSource,
    isProcessing,
    startRecording: startStoreRecording,
    stopRecording: stopStoreRecording,
    transcribeMock,
    transcribeManual,
    enterEditingTranscript,
    editTranscript,
    revertTranscript,
    processWithAI,
    reset: resetStore,
  } = useVoiceObservationStore();

  // Web Speech (fallback path)
  const speech = useSpeechRecognition({
    lang: 'ru-RU',
    interimResults: true,
    continuous: false,
    mockTranscript: DEMO_TRANSCRIPT,
  });

  // MediaRecorder hook (primary path)
  const recorder = useAudioRecorder();

  const [phase, setPhase] = useState<AudioPipelinePhase>('idle');
  const [pipelineResult, setPipelineResult] = useState<AudioPipelineResponse | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const apiMode = useEventStore((s) => s.apiMode);
  const addEventsLocally = useEventStore((s) => s.addEvents);
  const authUser = useAuthStore((s) => s.user);
  const userRole: 'parent' | 'tutor' | 'specialist' =
    (authUser?.role as 'parent' | 'tutor' | 'specialist' | undefined) ?? 'parent';
  // apiMode is informational for future WebSocket diagnostics; not blocking here.
  void apiMode;

  // Если MediaRecorder стал доступен / исчез — перерендеримся.
  useEffect(() => {
    /* no-op, рефлект через ref */
  }, [mediaRecorderSupported]);

  // Сбрасываем pipeline state при unmount.
  useEffect(() => {
    return () => {
      recorder.resetRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Primary path: MediaRecorder + audio pipeline =====

  const uploadBlob = useCallback(
    async (blob: Blob, durationSec: number) => {
      setPhase('uploading');
      setPipelineError(null);
      try {
        const result = await uploadAudioObservation({
          blob,
          childId: DEMO_PRIMARY_CHILD.id,
          sourceRole: (userRole ?? 'parent') as 'parent' | 'tutor' | 'specialist',
          durationSec,
          language: 'ru',
          mode: 'observation',
        });
        setPipelineResult(result);

        // Backend создал events. Два пути обновления UI:
        // 1) Optimistic local insert — мгновенный feedback
        // 2) WebSocket broadcast подтянет через useRealtimeEvents (canonical source)
        // Делаем оба, дедуп по id.
        if (Array.isArray(result.events) && result.events.length > 0) {
          const local = result.events.map((e) => ({
            id: (e as { id?: string }).id ?? `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            childId: (e as { childId?: string }).childId ?? DEMO_PRIMARY_CHILD.id,
            type: ((e as { type?: string }).type ?? 'voice_observation') as QoldauEvent['type'],
            title: (e as { title?: string }).title ?? 'Голосовое наблюдение',
            description: (e as { description?: string }).description ?? result.ai?.insight ?? '',
            timestamp: (e as { timestamp?: string }).timestamp ?? new Date().toISOString(),
            sourceRole: ((e as { sourceRole?: QoldauEvent['sourceRole'] }).sourceRole ?? 'parent'),
            status: ((e as { status?: QoldauEvent['status'] }).status ?? 'ai_parsed'),
            rawText: result.recording.transcript,
          }));
          try {
            addEventsLocally(local as Omit<QoldauEvent, 'id'>[]);
          } catch {
            /* ignore: store может упасть на дубликатах, OK */
          }
        }

        setPhase('success');
        // Через 1.2s уходим в timeline, чтобы пользователь увидел "Наблюдение распознано".
        window.setTimeout(() => {
          navigate('/parent/timeline');
        }, 1200);
      } catch (err) {
        // Backend недоступен / ошибка сети / mock не сконфигурирован.
        // Fallback на Web Speech flow.
        const msg = err instanceof Error ? err.message : 'Не удалось отправить аудио';
        setPipelineError(msg);
        setPhase('fallback');
        // Стартуем Web Speech как fallback.
        speech.start();
      }
    },
    [addEventsLocally, navigate, speech, userRole],
  );

  const handleAudioStart = useCallback(async () => {
    setPipelineError(null);
    setPipelineResult(null);
    setPhase('recording');
    timer.start();
    startStoreRecording({ speakerRole: 'parent', childId: DEMO_PRIMARY_CHILD.id });
    await recorder.startRecording();
  }, [recorder, startStoreRecording, timer]);

  const handleAudioStop = useCallback(async () => {
    setPhase('stopping');
    timer.stop();
    stopStoreRecording();
    const blob = await recorder.stopRecording();
    if (blob) {
      await uploadBlob(blob, recorder.duration);
    } else {
      // Нет blob (микрофон не разрешён, ошибка записи). Fallback на Web Speech.
      setPhase('fallback');
      speech.start();
    }
  }, [recorder, stopStoreRecording, timer, speech, uploadBlob]);

  // ===== Fallback path: Web Speech / Manual / Demo =====

  const handleFallbackStart = useCallback(() => {
    startStoreRecording({ speakerRole: 'parent', childId: DEMO_PRIMARY_CHILD.id });
    timer.start();
    speech.start();
  }, [speech, startStoreRecording, timer]);

  const handleFallbackStop = useCallback(async () => {
    timer.stop();
    stopStoreRecording();
    speech.stop();
    const text = (speech.transcript || '').trim();
    if (text) {
      await transcribeManual(text);
    } else {
      await transcribeMock();
    }
  }, [speech, stopStoreRecording, timer, transcribeManual, transcribeMock]);

  const handleUseDemo = useCallback(async () => {
    await transcribeManual(DEMO_TRANSCRIPT);
  }, [transcribeManual]);

  const handleEnterManual = useCallback(() => {
    if (currentTranscript) {
      enterEditingTranscript();
    } else {
      transcribeManual('').then(() => enterEditingTranscript());
    }
  }, [currentTranscript, enterEditingTranscript, transcribeManual]);

  const handleEdit = useCallback(() => enterEditingTranscript(), [enterEditingTranscript]);
  const handleRevert = useCallback(() => revertTranscript(), [revertTranscript]);

  const handleContinue = useCallback(async () => {
    await processWithAI();
    navigate('/parent/ai-review');
  }, [processWithAI, navigate]);

  const handleNew = useCallback(() => {
    resetStore();
    recorder.resetRecording();
    timer.reset();
    setPhase('idle');
    setPipelineResult(null);
    setPipelineError(null);
  }, [recorder, resetStore, timer]);

  // ===== UI flags =====

  const isAudioPhase =
    phase === 'recording' ||
    phase === 'stopping' ||
    phase === 'uploading' ||
    phase === 'success';

  const hasTranscript =
    recordingState === 'transcript_ready' ||
    recordingState === 'editing_transcript' ||
    recordingState === 'processing_ai';

  // Если нет MediaRecorder И нет Web Speech support — показываем только demo/manual.
  const canUseVoice = mediaRecorderSupported || speech.supported;

  return (
    <div className="flex flex-col gap-4 min-h-[70vh]">
      <PageHeader
        title="Голосовое наблюдение"
        subtitle="Запишите, что произошло — AI структурирует"
        showBack
      />

      {/* Disclaimer + режим */}
      <QoldauCard variant="tinted-warm" padding="sm">
        <p className="text-xs text-ink-2 leading-relaxed">
          <span className="font-bold">
            {phase === 'recording'
              ? '🎙️ Идёт запись…'
              : phase === 'uploading'
                ? '⏳ Распознаём и структурируем наблюдение…'
                : phase === 'success'
                  ? '✓ Наблюдение распознано'
                  : phase === 'fallback'
                    ? '⚠️ Демо-режим'
                    : mediaRecorderSupported
                      ? '🎙️ Готово к записи'
                      : speech.supported
                        ? '🎙️ Распознавание речи'
                        : 'Demo-режим'}
          </span>
          {' '}
          {phase === 'uploading' || phase === 'success' || phase === 'recording' || phase === 'stopping'
            ? 'Это наблюдение, не диагноз.'
            : mediaRecorderSupported
              ? 'Аудио отправится на сервер и превратится в событие в Timeline.'
              : speech.supported
                ? 'Браузер распознаёт речь напрямую. Можно отредактировать текст перед сохранением.'
                : 'Имитация записи (нет ни MediaRecorder, ни Web Speech).'}
        </p>
      </QoldauCard>

      {/* Hero — recording zone */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        {/* Большая кнопка-микрофон (idle/recording) */}
        {!hasTranscript && phase !== 'success' && (
          <button
            onClick={() => {
              if (mediaRecorderSupported) {
                if (phase === 'recording') {
                  void handleAudioStop();
                } else if (phase === 'idle' || phase === 'fallback') {
                  void handleAudioStart();
                }
              } else if (timer.isActive) {
                void handleFallbackStop();
              } else {
                handleFallbackStart();
              }
            }}
            disabled={phase === 'uploading' || phase === 'stopping'}
            aria-label={
              phase === 'recording'
                ? 'Остановить запись'
                : phase === 'uploading' || phase === 'stopping'
                  ? 'Обрабатываем…'
                  : 'Начать запись'
            }
            className={`w-48 h-48 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-60 ${
              phase === 'recording' || timer.isActive
                ? 'bg-gradient-to-br from-coral to-[#cc251d] qoldau-rec-pulse'
                : 'bg-gradient-to-br from-teal to-teal-dark'
            }`}
            style={{
              boxShadow:
                phase === 'recording' || timer.isActive
                  ? '0 0 0 20px rgba(229,111,93,0.10), 0 0 0 40px rgba(229,111,93,0.05), 0 24px 40px rgba(229,111,93,0.30)'
                  : '0 0 0 20px rgba(0,150,136,0.08), 0 0 0 40px rgba(0,150,136,0.045), 0 24px 40px rgba(0,150,136,0.25)',
            }}
          >
            {phase === 'uploading' || phase === 'stopping' ? (
              <Loader2 size={84} className="text-white animate-spin" />
            ) : (
              <AppIcon
                component={phase === 'recording' || timer.isActive ? MicOff : Mic}
                size={84}
                strokeWidth={2.5}
                colorClass="text-white"
              />
            )}
          </button>
        )}

        {/* Success card — после успешной загрузки */}
        {phase === 'success' && pipelineResult && (
          <QoldauCard variant="tinted-teal" padding="lg" className="w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center text-white">
                <CheckCircle2 size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-ink">Наблюдение распознано</p>
                <p className="text-xs text-ink-2 mt-0.5">
                  {pipelineResult.events.length > 0
                    ? `Создано событий: ${pipelineResult.events.length}. `
                    : 'Событие создано. '}
                  Открываем Timeline…
                </p>
                {pipelineResult.ai?.insight && (
                  <p className="text-xs text-muted mt-2 italic line-clamp-2">
                    «{pipelineResult.ai.insight}»
                  </p>
                )}
              </div>
            </div>
          </QoldauCard>
        )}

        {/* Fallback card — backend упал, переходим на Web Speech */}
        {phase === 'fallback' && (
          <QoldauCard variant="tinted-warm" padding="md" className="w-full">
            <div className="flex items-start gap-3">
              <AppIcon component={WifiOff} size={20} colorClass="text-coral shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink">
                  Не удалось подключиться к распознаванию.
                </p>
                <p className="text-xs text-ink-2 mt-1">
                  {pipelineError
                    ? `Причина: ${pipelineError}. `
                    : ''}
                  Можно продолжить в демо-режиме или ввести текст вручную.
                </p>
              </div>
            </div>
          </QoldauCard>
        )}

        {/* Error card — реальная ошибка (без fallback) */}
        {phase === 'error' && pipelineError && (
          <QoldauCard variant="tinted-warm" padding="md" className="w-full">
            <div className="flex items-center gap-2">
              <AppIcon component={AlertCircle} size={18} colorClass="text-coral shrink-0" />
              <p className="text-xs text-ink-2">{pipelineError}</p>
            </div>
          </QoldauCard>
        )}

        {/* Волна + таймер (recording) */}
        {(phase === 'recording' || (timer.isActive && phase !== 'success')) && (
          <div className="flex flex-col items-center gap-3 w-full">
            <VoiceWave />
            <div className="text-4xl font-black text-ink tabular-nums">
              {formatDuration(
                phase === 'recording' ? recorder.duration : timer.seconds,
              )}
            </div>
            <p className="text-sm text-muted">
              {mediaRecorderSupported
                ? 'Идёт запись… нажмите кнопку ещё раз, чтобы остановить и отправить'
                : 'Идёт запись… нажмите кнопку ещё раз, чтобы остановить'}
            </p>
          </div>
        )}

        {/* Live transcript preview (Web Speech fallback only) */}
        {!mediaRecorderSupported && timer.isActive && speech.transcript && (
          <QoldauCard variant="tinted-teal" padding="md" className="w-full">
            <div className="flex items-start gap-2">
              <AppIcon component={Mic} size={18} colorClass="text-teal shrink-0 mt-0.5" />
              <p className="text-sm text-ink-2 italic leading-relaxed">
                «{speech.transcript}»
              </p>
            </div>
          </QoldauCard>
        )}

        {/* Idle — что будет записано */}
        {phase === 'idle' && !timer.isActive && !hasTranscript && (
          <div className="text-center">
            <p className="text-sm text-ink-2 leading-relaxed max-w-xs">
              {canUseVoice
                ? 'Нажмите на кнопку и расскажите, что произошло.'
                : 'Голосовая запись недоступна в этом браузере. Используйте demo-текст или ручной ввод.'}
              {' '}AI предложит структуру наблюдения.
            </p>
          </div>
        )}

        {/* Transcript card — после Web Speech / mock / manual */}
        {hasTranscript && (
          <QoldauCard variant="elevated" padding="lg" className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <AppIcon component={VoiceWaveIcon} size={20} colorClass="text-teal" />
              <p className="text-xs font-black text-teal uppercase tracking-wide">
                Транскрипт
              </p>
              <span className="ml-auto text-[10px] text-muted italic">
                {sttSource === 'mock'
                  ? 'mock STT'
                  : sttSource === 'manual'
                    ? 'вручную'
                    : 'real STT'}
              </span>
            </div>

            {recordingState === 'editing_transcript' ? (
              <textarea
                value={currentTranscript}
                onChange={(e) => editTranscript(e.target.value)}
                className="w-full min-h-[120px] p-3 rounded-2xl border-2 border-line focus:border-teal/60 focus:outline-none text-sm text-ink leading-relaxed resize-none"
                aria-label="Редактировать транскрипт"
              />
            ) : (
              <p className="text-base text-ink leading-relaxed italic">
                «{currentTranscript || originalTranscript}»
              </p>
            )}
          </QoldauCard>
        )}

        {/* Processing AI (старый flow) */}
        {isProcessing && (
          <QoldauCard variant="tinted-teal" padding="md" className="w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-ink">AI обрабатывает…</p>
                <p className="text-xs text-ink-2 mt-0.5">
                  Структурируем наблюдение. Это может занять секунду.
                </p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-teal border-t-transparent animate-spin" />
            </div>
          </QoldauCard>
        )}
      </div>

      {/* Idle actions — выбор режима */}
      {phase === 'idle' && !timer.isActive && !hasTranscript && !isAudioPhase && (
        <div className="flex flex-col gap-2">
          <PrimaryAction
            label="Использовать demo-текст"
            onClick={handleUseDemo}
            variant="soft"
            icon={<Sparkles size={18} />}
          />
          <button
            onClick={handleEnterManual}
            className="min-h-12 px-5 rounded-2xl border border-line text-ink-2 hover:bg-bg transition-colors text-sm font-bold flex items-center justify-center gap-2"
          >
            <Keyboard size={16} />
            Ввести вручную
          </button>
        </div>
      )}

      {/* Transcript actions (старый flow) */}
      {hasTranscript && !isProcessing && (
        <div className="flex flex-col gap-2">
          {recordingState === 'editing_transcript' ? (
            <>
              <PrimaryAction
                label="Готово"
                onClick={() => editTranscript(currentTranscript)}
                variant="primary"
                size="lg"
                icon={<Sparkles size={18} />}
              />
              <button
                onClick={handleRevert}
                className="min-h-12 px-5 rounded-2xl border border-line text-muted hover:bg-bg transition-colors text-sm font-bold"
              >
                Отменить правки
              </button>
            </>
          ) : (
            <>
              <PrimaryAction
                label="Продолжить к AI-разбору"
                onClick={handleContinue}
                variant="primary"
                size="lg"
                icon={<Sparkles size={18} />}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEdit}
                  className="min-h-12 px-4 rounded-2xl bg-white border border-line text-ink hover:bg-bg transition-colors text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={16} />
                  Изменить текст
                </button>
                <button
                  onClick={handleNew}
                  className="min-h-12 px-4 rounded-2xl bg-white border border-line text-muted hover:bg-bg transition-colors text-sm font-bold"
                >
                  Записать заново
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Примеры */}
      {phase === 'idle' && !timer.isActive && !hasTranscript && !isAudioPhase && (
        <QoldauCard variant="tinted-warm" padding="md">
          <p className="text-xs font-bold text-muted mb-2">Примеры наблюдений</p>
          <div className="flex flex-col gap-1.5">
            {[
              'Он поел кашу с сыром',
              'Сходили в туалет, стул нормальный',
              'Начал нервничать, закрывал уши',
              'Сказал «ва» и потянулся к воде',
            ].map((ex, i) => (
              <p key={i} className="text-sm text-ink-2 leading-relaxed">
                · {ex}
              </p>
            ))}
          </div>
        </QoldauCard>
      )}

      {/* Кнопка "Записать заново" после успеха */}
      {phase === 'success' && (
        <button
          onClick={handleNew}
          className="min-h-12 px-4 rounded-2xl bg-white border border-line text-muted hover:bg-bg transition-colors text-sm font-bold"
        >
          Записать ещё одно
        </button>
      )}
    </div>
  );
};