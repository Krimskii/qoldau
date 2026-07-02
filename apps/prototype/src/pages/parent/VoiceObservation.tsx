import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Edit3, Sparkles, Keyboard, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { VoiceWaveIcon } from '@/components/icons';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { PrimaryAction } from '@/components/ui/Primitives';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { useSpeechRecognition } from '@/lib/stt/useSpeechRecognition';

const DEMO_TRANSCRIPT =
  'Алихан поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.';

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/**
 * Parent VoiceObservation — state machine UI.
 *
 * States (через useVoiceObservationStore):
 * - idle: показываем кнопку микрофона + опции demo/вручную
 * - recording: микрофон активен, таймер, волна
 * - stopped: после записи → транскрипт появляется
 * - transcript_ready: текст готов, можно редактировать или продолжить
 * - editing_transcript: редактирование transcript
 * - processing_ai: AI парсит
 * - ready_for_review: → /parent/ai-review
 */
export const VoiceObservation: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    recordingState,
    originalTranscript,
    currentTranscript,
    sttSource,
    isProcessing,
    startRecording,
    stopRecording,
    transcribeMock,
    transcribeManual,
    enterEditingTranscript,
    editTranscript,
    revertTranscript,
    processWithAI,
    reset,
  } = useVoiceObservationStore();

  // Web Speech API (browser-native) с mock fallback
  const speech = useSpeechRecognition({
    lang: 'ru-RU',
    interimResults: true,
    continuous: false,
    mockTranscript: DEMO_TRANSCRIPT,
  });

  // Локальное состояние UI для таймера записи
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const handleStart = useCallback(() => {
    startRecording({ speakerRole: 'parent', childId: DEMO_PRIMARY_CHILD.id });
    setIsRecording(true);
    setDuration(0);
    speech.start();
  }, [startRecording, speech]);

  const handleStop = useCallback(async () => {
    setIsRecording(false);
    stopRecording();
    speech.stop();
    // Web Speech API даёт реальный транскрипт; fallback на mock если пусто
    const text = (speech.transcript || '').trim();
    if (text) {
      await transcribeManual(text);
    } else {
      await transcribeMock();
    }
  }, [speech, stopRecording, transcribeManual, transcribeMock]);

  const handleUseDemo = useCallback(async () => {
    await transcribeManual(DEMO_TRANSCRIPT);
  }, [transcribeManual]);

  // «Ввести вручную» — сразу показываем пустой inline-редактор без demo-текста.
  // Раньше вёл на /parent/voice/manual (route не существует → * → /overview).
  const handleEnterManual = useCallback(() => {
    // Берём текущий транскрипт (если был) или пустую строку,
    // переключаем store в режим редактирования, чтобы UI сразу показал textarea.
    if (currentTranscript) {
      enterEditingTranscript();
    } else {
      transcribeManual('').then(() => enterEditingTranscript());
    }
  }, [currentTranscript, enterEditingTranscript, transcribeManual]);

  const handleEdit = useCallback(() => {
    enterEditingTranscript();
  }, [enterEditingTranscript]);

  const handleRevert = useCallback(() => {
    revertTranscript();
  }, [revertTranscript]);

  const handleContinue = useCallback(async () => {
    await processWithAI();
    navigate('/parent/ai-review');
  }, [processWithAI, navigate]);

  const handleNew = useCallback(() => {
    reset();
    setDuration(0);
  }, [reset]);

  const hasTranscript = recordingState === 'transcript_ready'
    || recordingState === 'editing_transcript'
    || recordingState === 'processing_ai';

  return (
    <div className="flex flex-col gap-4 min-h-[70vh]">
      <PageHeader
        title="Голосовое наблюдение"
        subtitle="Запишите, что произошло — AI структурирует"
        showBack
      />

      {/* Disclaimer — STT mode */}
      <QoldauCard variant="tinted-warm" padding="sm">
        <p className="text-xs text-ink-2 leading-relaxed">
          <span className="font-bold">
            {speech.supported ? '🎙️ Распознавание речи' : 'Demo-режим'}
            {speech.mode === 'mock' && ' · mock fallback'}
          </span>
          {speech.supported
            ? ' Браузер распознаёт речь напрямую. Вы можете отредактировать текст перед сохранением.'
            : ' Имитация записи (браузер не поддерживает Web Speech API).'}
          {' '}Это наблюдение, не диагноз.
        </p>
      </QoldauCard>

      {/* Hero — recording zone */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        {/* Большая кнопка-микрофон */}
        {!hasTranscript && (
          <button
            onClick={isRecording ? handleStop : handleStart}
            aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
            className={`w-48 h-48 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isRecording
                ? 'bg-gradient-to-br from-coral to-[#cc251d] qoldau-rec-pulse'
                : 'bg-gradient-to-br from-teal to-teal-dark'
            }`}
            style={{
              boxShadow: isRecording
                ? '0 0 0 20px rgba(229,111,93,0.10), 0 0 0 40px rgba(229,111,93,0.05), 0 24px 40px rgba(229,111,93,0.30)'
                : '0 0 0 20px rgba(0,150,136,0.08), 0 0 0 40px rgba(0,150,136,0.045), 0 24px 40px rgba(0,150,136,0.25)',
            }}
          >
            <AppIcon
              component={isRecording ? MicOff : Mic}
              size={84}
              strokeWidth={2.5}
              colorClass="text-white"
            />
          </button>
        )}

        {/* Волна + таймер */}
        {isRecording && (
          <div className="flex flex-col items-center gap-3 w-full">
            <VoiceWave />
            <div className="text-4xl font-black text-ink tabular-nums">
              {formatDuration(duration)}
            </div>
            <p className="text-sm text-muted">
              Идёт запись… нажмите кнопку ещё раз, чтобы остановить
            </p>
          </div>
        )}

        {/* Idle — что будет записано */}
        {!isRecording && !hasTranscript && (
          <div className="text-center">
            <p className="text-sm text-ink-2 leading-relaxed max-w-xs">
              Нажмите на кнопку и расскажите, что произошло.
              AI предложит структуру наблюдения.
            </p>
          </div>
        )}

        {/* Live transcript preview (пока запись идёт) */}
        {isRecording && speech.transcript && (
          <QoldauCard variant="tinted-teal" padding="md" className="w-full">
            <div className="flex items-start gap-2">
              <AppIcon component={Mic} size={18} colorClass="text-teal shrink-0 mt-0.5" />
              <p className="text-sm text-ink-2 italic leading-relaxed">
                «{speech.transcript}»
              </p>
            </div>
          </QoldauCard>
        )}

        {/* STT error */}
        {speech.error && !isRecording && (
          <QoldauCard variant="tinted-warm" padding="sm" className="w-full">
            <div className="flex items-center gap-2">
              <AppIcon component={AlertCircle} size={16} colorClass="text-coral" />
              <p className="text-xs text-ink-2">
                Не удалось распознать речь: {speech.error}. Можно ввести текст вручную.
              </p>
            </div>
          </QoldauCard>
        )}

        {/* Transcript card — после транскрипта */}
        {hasTranscript && (
          <QoldauCard variant="elevated" padding="lg" className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <AppIcon component={VoiceWaveIcon} size={20} colorClass="text-teal" />
              <p className="text-xs font-black text-teal uppercase tracking-wide">
                Транскрипт
              </p>
              <span className="ml-auto text-[10px] text-muted italic">
                {sttSource === 'mock' ? 'mock STT' : sttSource === 'manual' ? 'вручную' : 'real STT'}
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

        {/* Processing AI */}
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
      {!isRecording && !hasTranscript && (
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

      {/* Transcript actions */}
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
      {!isRecording && !hasTranscript && (
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
    </div>
  );
};