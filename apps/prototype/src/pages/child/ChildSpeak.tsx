import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { BackArrowIcon, Water2DIcon, Mom2DIcon, Toilet2DIcon, Home2DIcon, CHILD_FAMILY_STYLES, type ChildCardFamily } from '@/components/icons/child2d';
import { useRecordingsStore } from '@/store/useRecordingsStore';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { useSpeechRecognition } from '@/lib/stt/useSpeechRecognition';
import { speak } from '@/lib/tts/speak';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { audioBlobStore, generateAudioId } from '@/lib/audio/audioBlobStore';

const MAX_RECORDING_SEC = 30;

/**
 * Мок-лейблы для распознанной речи — выбираются при сохранении записи
 * (имитация STT-распознавания, без реального аудио).
 */
const DEMO_LABELS = [
  'Я хочу пить',
  'Мама, помоги',
  'Туалет',
  'Гулять',
  'Спать',
  'Дай',
  'Хочу есть',
  'Я молодец',
];

/**
 * Быстрые варианты для отложенного воспроизведения (минуты).
 * v1.6 E10.2.7: SCHEDULE_PRESETS удалены — ScheduleButton убран из child UI.
 * История записей и schedule — прерогатива parent/tutor.
 */

/**
 * Fallback-карточки для невокализующих детей (v1.5+ D §2).
 * Частотные FCT-потребности — ребёнок может выразить их без голоса.
 * Тап карточки = speak(label) + aac_card event, без навигации.
 * Скрыто при активной записи (isRecording), чтобы не отвлекать.
 */
interface SpeakFallbackCard {
  label: string;
  family: ChildCardFamily;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
}
const SPEAK_FALLBACK_CARDS: SpeakFallbackCard[] = [
  { label: 'Вода',   family: 'need', Icon: Water2DIcon },
  { label: 'Мама',   family: 'help', Icon: Mom2DIcon },
  { label: 'Туалет', family: 'feel', Icon: Toilet2DIcon },
  { label: 'Домой',  family: 'fav',  Icon: Home2DIcon },
];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/**
 * ChildSpeak (v0.3.23 + v1.6 E10.2.7) — большой микрофон + simple feedback.
 *
 * E10.2.7: убрано «взрослое» управление аудио (play/pause/delete/schedule).
 * Для ребёнка — это перегруз. Вместо списка записей с прогресс-баром и
 * кнопками теперь только статус «Фраза отправлена взрослому» после записи.
 * История записей остаётся в useRecordingsStore для parent/tutor UI.
 *
 * Структура:
 * - Header (back + title).
 * - **Большой микрофон 150×150** — tap to record (mock STT, max 30 сек, авто-стоп).
 * - Status text (timer во время записи + «Идёт запись…»).
 * - Fallback-карточки «или выбери карточку» (v1.5+ D §2) — скрыты во время записи.
 * - **Статус последней записи** — простой ✓ «Фраза отправлена взрослому» (вместо
 *   «Недавние записи»). Нет play/delete/schedule — это для parent/tutor.
 * - Empty → EmptyState с объяснением (тап на микрофон → запись).
 *
 * Создание записи порождает `voice_observation` event в Event Timeline (E10.2.12).
 */
export const ChildSpeak: React.FC = () => {
  const navigate = useNavigate();
  // E10.2.7: removeRecording и recording-manipulation handlers удалены
  // из child UI (история — прерогатива parent/tutor). Оставляем только
  // addRecording при stopRecording + recordings.length для счётчика.
  const { recordings, addRecording } = useRecordingsStore();
  const { addEvent } = useEventStore();

  // === Recording state ===
  // v1.6 F1.3: реальный MediaRecorder (через useAudioRecorder) — звук
  // сохраняется в IndexedDB (audioBlobStore) для parent/tutor playback.
  // Параллельно Web Speech API для in-browser interim transcript.
  const recorder = useAudioRecorder();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeRef = useRef(0);
  // Копим transcript, который накапливается через Web Speech interim-ы.
  const transcriptRef = useRef('');

  // === Web Speech API (v0.6.9) — реальное распознавание голоса ребёнка.
  const speech = useSpeechRecognition({
    lang: 'ru-RU',
    interimResults: true,
    continuous: false,
    mockTranscript: DEMO_LABELS[0],
  });

  // E10.2.7: playback state (playingId/playbackProgress) и schedule state
  // удалены — взрослое управление для parent/tutor.

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  // === Recording timer ===
  useEffect(() => {
    if (!isRecording) {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      return;
    }
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((t) => {
        if (t >= MAX_RECORDING_SEC - 1) {
          recordingTimeRef.current = MAX_RECORDING_SEC;
          setTimeout(() => stopRecording(), 0);
          return MAX_RECORDING_SEC;
        }
        recordingTimeRef.current = t + 1;
        return t + 1;
      });
    }, 1000);
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // === Handlers ===
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    transcriptRef.current = '';
    speech.start();
    // F1.3: запустить реальный MediaRecorder. Если нет микрофона/permission —
    // recorder.error заполнится, но UI не сломается (запись сохранится без blob).
    void recorder.startRecording();
  };

  const stopRecording = async () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    speech.stop();
    if (!isRecording) return;
    setIsRecording(false);

    const duration = Math.max(2, recordingTimeRef.current); // минимум 2 сек для осмысленной записи
    // Если Web Speech API распознал что-то — используем transcript.
    // Иначе fallback на случайный mock label.
    const recognized = speech.transcript.trim();
    const label = recognized || DEMO_LABELS[Math.floor(Math.random() * DEMO_LABELS.length)];
    // Озвучиваем что распознали — feedback для ребёнка.
    speak(label);

    // F1.3: остановить реальный MediaRecorder и сохранить blob в IndexedDB.
    // Ошибка квоты/permission → audioId=null, запись сохранится без звука
    // (parent увидит metadata+transcript, но без playback).
    let blob = recorder.audioBlob;
    try {
      blob = await recorder.stopRecording();
    } catch {
      // recorder.error уже выставлен; ничего не делаем — save пойдёт без blob.
    }
    let audioId: string | null = null;
    if (blob && blob.size > 0 && audioBlobStore.isAvailable()) {
      const id = generateAudioId();
      const result = await audioBlobStore.put(id, blob);
      if (result.ok) {
        audioId = id;
      }
    }

    // Сохранить в recordings store
    const newRec = addRecording({
      childId: DEMO_PRIMARY_CHILD.id,
      label,
      durationSec: duration,
      audioId,
      transcript: recognized || undefined,
      mimeType: blob?.type,
      sizeBytes: blob?.size,
    });

    // Создать event для parent timeline
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'voice_observation',
      title: 'Голосовая запись',
      description: `Ребёнок записал: «${label}» (${duration} сек). Это наблюдение, не диагноз.`,
      timestamp: newRec.timestamp,
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        recordingId: newRec.id,
        durationSec: duration,
        label,
        hasAudio: audioId !== null,
      },
    });

    setRecordingTime(0);
    recordingTimeRef.current = 0;
  };

  const toggleRecord = () => {
    if (isRecording) void stopRecording();
    else startRecording();
  };

    /**
   * Тап fallback-карточки — выражение потребности без голоса (v1.5+ D §2).
   * Без навигации — ребёнок остаётся на Speak, короткий ✓-feedback.
   */
  const handleFallbackCard = (card: SpeakFallbackCard) => {
    speak(card.label);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'aac_card',
      title: card.label,
      description: `Ребёнок выбрал карточку «${card.label}» без голоса (fallback).`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        source: 'speak_fallback',
        label: card.label,
      },
    });
    // Короткий ✓-feedback — переиспользуем SuccessSparkle через mini-toast.
    showFallbackFeedback(card.label);
  };

  // === Mini ✓-feedback для fallback-карточки (не блокирует запись/UI) ===
  const [fallbackFeedback, setFallbackFeedback] = useState<string | null>(null);
  const fallbackFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showFallbackFeedback = (label: string) => {
    setFallbackFeedback(label);
    if (fallbackFeedbackTimer.current) clearTimeout(fallbackFeedbackTimer.current);
    fallbackFeedbackTimer.current = setTimeout(() => setFallbackFeedback(null), 1200);
  };
  useEffect(() => {
    return () => {
      if (fallbackFeedbackTimer.current) clearTimeout(fallbackFeedbackTimer.current);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border border-line flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Сказать</div>
      </div>

      {/* Big mic */}
      <button
        onClick={toggleRecord}
        className={`mx-auto my-5 w-[150px] h-[150px] rounded-full flex items-center justify-center relative ${
          isRecording ? 'qoldau-icon-rec' : ''
        }`}
        style={{
          background: isRecording
            ? 'linear-gradient(135deg, #E56F5D 0%, #cc251d 100%)'
            : 'linear-gradient(135deg, #7fd1c9 0%, #1ba39a 100%)',
          boxShadow: isRecording
            ? '0 14px 34px rgba(229,111,93,0.34)'
            : '0 14px 34px rgba(27,163,154,0.34)',
        }}
        aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
      >
        {isRecording ? (
          <MicOff className="w-16 h-16 text-white" strokeWidth={2.5} />
        ) : (
          <Mic className="w-16 h-16 text-white" strokeWidth={2.5} />
        )}
      </button>

      {/* Status text — E10.2.7: убрана техническая формулировка «задать время
          воспроизведения» (это для родителя). Теперь по-детски. */}
      <div className="text-center px-5">
        {isRecording ? (
          <div className="flex flex-col items-center gap-2">
            <DemoBadge label="Распознавание — демо" />
            <div className="text-4xl font-black text-ink tabular-nums">
              {formatTime(recordingTime)}
            </div>
            {speech.supported && speech.transcript ? (
              <p className="text-sm text-ink-2 mt-2 italic leading-relaxed max-w-xs mx-auto">
                «{speech.transcript}»
              </p>
            ) : (
              <p className="text-sm text-ink-soft mt-1 font-bold">
                Нажми и говори
              </p>
            )}
            <p className="text-[11px] text-muted mt-0.5 italic">
              Максимум {MAX_RECORDING_SEC} сек
            </p>
          </div>
        ) : (
          // E10.2.8: helper-текст по-детски — «Нажми и говори» (без технических
          // формулировок «время воспроизведения», «задать время» и т.д.).
          <p className="text-base text-ink-soft font-bold">
            Нажми и говори
          </p>
        )}
      </div>

      {/* Fallback-карточки «или выбери карточку» (v1.5+ D §2) — скрыты во время записи */}
      {!isRecording && (
        <div className="mx-5 mt-6">
          <p className="text-sm text-muted text-center mb-3">
            или выбери карточку
          </p>
          <div className="grid grid-cols-4 gap-3">
            {SPEAK_FALLBACK_CARDS.map((card) => {
              const familyStyle = CHILD_FAMILY_STYLES[card.family];
              const Icon = card.Icon;
              return (
                <button
                  key={card.label}
                  onClick={() => handleFallbackCard(card)}
                  aria-label={card.label}
                  className={`bg-white rounded-[22px] shadow-card-soft aspect-square min-h-[88px] flex flex-col items-center justify-center gap-1.5 px-1 py-2 transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 qoldau-tap-ring`}
                >
                  <div className={`w-[56px] h-[56px] rounded-[16px] ${familyStyle.icoBg} flex items-center justify-center`}>
                    <Icon size={40} animated={false} />
                  </div>
                  <span className={`text-[12px] font-black ${familyStyle.lbl} leading-tight text-center`}>
                    {card.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* E10.2.7: вместо «Недавние записи» с play/delete/schedule —
          простой статус «Фраза отправлена взрослому» + DemoBadge для честности
          про мок-STT. История остаётся в useRecordingsStore для parent/tutor. */}
      <div className="mx-5 mt-6 mb-2">
        <div className="bg-white border border-line rounded-2xl p-5 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-soft flex items-center justify-center">
              <Volume2 className="w-7 h-7 text-teal-dark" aria-hidden="true" />
            </div>
          </div>
          {recordings.length === 0 ? (
            <>
              <p className="text-sm font-black text-ink mt-2">Нажми и говори</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Сообщение сразу уйдёт взрослому
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-black text-teal-dark">✓ Фраза отправлена взрослому</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Последнее сообщение · {recordings.length}{' '}
                {recordings.length === 1 ? 'запись' : 'записей'}
              </p>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* Mini ✓-feedback для fallback-карточки */}
      {fallbackFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm qoldau-success-pop pointer-events-none"
        >
          <div className="bg-teal-soft border-2 border-teal/30 rounded-3xl px-6 py-3 shadow-card text-center">
            <p className="text-base font-black text-teal-dark">✓ {fallbackFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};
