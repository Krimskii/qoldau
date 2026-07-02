import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Play, Pause, Trash2, Clock, Volume2 } from 'lucide-react';
import { BackArrowIcon, Music2DIcon } from '@/components/icons/child2d';
import { useRecordingsStore, type Recording } from '@/store/useRecordingsStore';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { formatTime as formatClock } from '@/utils/dateFormat';

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
 * Каждый вариант → таймер на N минут, по истечении запись автоматически
 * переходит в режим playback.
 */
const SCHEDULE_PRESETS = [
  { label: '5 мин',   minutes: 5 },
  { label: '15 мин',  minutes: 15 },
  { label: '30 мин',  minutes: 30 },
  { label: '1 час',   minutes: 60 },
] as const;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const formatRelative = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч назад`;
  return `${Math.floor(hr / 24)} д назад`;
};

/**
 * ChildSpeak (v0.3.23) — большой микрофон + список недавних записей.
 *
 * Структура:
 * - Header (back + title).
 * - **Большой микрофон 150×150** — tap to record (mock STT, max 30 сек, авто-стоп).
 * - Status text (timer во время записи).
 * - **«Недавние записи»** — список карточек с:
 *   - иконкой `Music2DIcon` (40×40, teal-soft фон)
 *   - лейблом + тайм-кодом (progress / total)
 *   - кнопкой play/pause
 *   - **«Поставить»** (clock icon) — быстрые варианты 5/15/30/60 мин
 *     → запись автоматически запустится через N минут (визуально).
 *   - кнопкой удаления.
 *
 * Создание записи также порождает `voice_observation` event в Event Timeline.
 */
export const ChildSpeak: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, addRecording, removeRecording } = useRecordingsStore();
  const { addEvent } = useEventStore();

  // === Recording state ===
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // === Playback state ===
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // === Schedule state ===
  // recordingId → setTimeout id (для остановки таймера при удалении / отмене)
  const scheduleTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // recordingId → ISO-время, когда запись должна прозвучать
  const [scheduledAt, setScheduledAt] = useState<Record<string, string>>({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      Object.values(scheduleTimeoutsRef.current).forEach(clearTimeout);
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
          // Авто-стоп через 30 сек
          setTimeout(() => stopRecording(), 0);
          return MAX_RECORDING_SEC;
        }
        return t + 1;
      });
    }, 1000);
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // === Playback timer ===
  useEffect(() => {
    if (!playingId) {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      return;
    }
    const rec = recordings.find((r) => r.id === playingId);
    if (!rec) {
      setPlayingId(null);
      return;
    }
    playbackIntervalRef.current = setInterval(() => {
      setPlaybackProgress((prev) => {
        const cur = prev[playingId] ?? 0;
        if (cur >= rec.durationSec) {
          setPlayingId(null);
          return prev;
        }
        return { ...prev, [playingId]: cur + 1 };
      });
    }, 1000);
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [playingId, recordings]);

  // === Handlers ===
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (!isRecording) return;
    setIsRecording(false);

    const duration = Math.max(2, recordingTime); // минимум 2 сек для осмысленной записи
    const label = DEMO_LABELS[Math.floor(Math.random() * DEMO_LABELS.length)];

    // Сохранить в recordings store
    const newRec = addRecording({
      childId: DEMO_PRIMARY_CHILD.id,
      label,
      durationSec: duration,
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
      payload: { recordingId: newRec.id, durationSec: duration, label },
    });

    setRecordingTime(0);
  };

  const toggleRecord = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const togglePlay = (rec: Recording) => {
    if (playingId === rec.id) {
      setPlayingId(null);
    } else {
      setPlayingId(rec.id);
      if (playbackProgress[rec.id] === undefined) {
        setPlaybackProgress((p) => ({ ...p, [rec.id]: 0 }));
      }
    }
  };

  const handleRemove = (id: string) => {
    if (playingId === id) setPlayingId(null);
    cancelSchedule(id);
    removeRecording(id);
  };

  // === Schedule handlers ===
  const scheduleRecording = (rec: Recording, minutes: number) => {
    // Отменить предыдущий таймер для этой записи
    if (scheduleTimeoutsRef.current[rec.id]) {
      clearTimeout(scheduleTimeoutsRef.current[rec.id]);
    }

    const fireAt = Date.now() + minutes * 60_000;
    const timeoutId = setTimeout(() => {
      // Запустить playback этой записи
      setPlayingId(rec.id);
      setPlaybackProgress((p) => ({ ...p, [rec.id]: 0 }));
      // Убрать из scheduled
      setScheduledAt((prev) => {
        const next = { ...prev };
        delete next[rec.id];
        return next;
      });
      delete scheduleTimeoutsRef.current[rec.id];
    }, minutes * 60_000);

    scheduleTimeoutsRef.current[rec.id] = timeoutId;
    setScheduledAt((prev) => ({ ...prev, [rec.id]: new Date(fireAt).toISOString() }));
  };

  const cancelSchedule = (recId: string) => {
    if (scheduleTimeoutsRef.current[recId]) {
      clearTimeout(scheduleTimeoutsRef.current[recId]);
      delete scheduleTimeoutsRef.current[recId];
    }
    setScheduledAt((prev) => {
      const next = { ...prev };
      delete next[recId];
      return next;
    });
  };

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

      {/* Status text */}
      <div className="text-center px-5">
        {isRecording ? (
          <div>
            <div className="text-4xl font-black text-ink tabular-nums">
              {formatTime(recordingTime)}
            </div>
            <p className="text-sm text-muted mt-1">
              Идёт запись… нажми ещё раз, чтобы остановить
            </p>
            <p className="text-[11px] text-muted mt-0.5 italic">
              Максимум {MAX_RECORDING_SEC} сек
            </p>
          </div>
        ) : (
          <p className="text-base text-ink-soft font-bold">
            Нажми и говори. Можно задать время воспроизведения ↓
          </p>
        )}
      </div>

      {/* Recent recordings */}
      <div className="mx-5 mt-6 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-ink">Недавние записи</h3>
          {recordings.length > 0 && (
            <span className="text-xs text-muted font-bold tabular-nums">
              {recordings.length}
            </span>
          )}
        </div>

        {recordings.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-soft flex items-center justify-center mb-2">
              <Volume2 className="w-7 h-7 text-teal-dark" />
            </div>
            <p className="text-sm font-bold text-ink mt-2">Пока нет записей</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Нажми на микрофон выше, чтобы записать первое сообщение
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recordings.slice(0, 10).map((rec) => {
              const isPlaying = playingId === rec.id;
              const progress = playbackProgress[rec.id] ?? 0;
              const progressPct = Math.min(100, (progress / rec.durationSec) * 100);
              const scheduled = scheduledAt[rec.id];
              return (
                <div
                  key={rec.id}
                  className="bg-white border border-line rounded-2xl p-3 flex items-center gap-2.5"
                >
                  <button
                    onClick={() => togglePlay(rec)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isPlaying ? 'bg-coral text-white' : 'bg-teal-soft text-teal-dark'
                    }`}
                    aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-teal-soft flex items-center justify-center flex-shrink-0">
                    <Music2DIcon size={24} animated={false} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-ink truncate flex-1 min-w-0">
                        {rec.label}
                      </p>
                      <span className="text-[11px] text-muted tabular-nums flex-shrink-0">
                        {formatTime(progress)} / {formatTime(rec.durationSec)}
                      </span>
                    </div>
                    {isPlaying ? (
                      <div className="h-1 bg-bg rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-teal transition-all duration-1000 ease-linear"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    ) : scheduled ? (
                      <p className="text-[11px] text-coral mt-0.5 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Запланировано на {formatClock(scheduled)}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted mt-0.5">
                        {formatRelative(rec.timestamp)}
                      </p>
                    )}
                  </div>

                  {/* Schedule button — открывает quick-picker */}
                  {!isPlaying && (
                    <ScheduleButton
                      isScheduled={!!scheduled}
                      onSchedule={(minutes) => scheduleRecording(rec, minutes)}
                      onCancel={() => cancelSchedule(rec.id)}
                    />
                  )}

                  <button
                    onClick={() => handleRemove(rec.id)}
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-muted hover:bg-coral-soft hover:text-coral transition-colors flex-shrink-0"
                    aria-label="Удалить запись"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: 12 }} />
    </div>
  );
};

/**
 * ScheduleButton — иконка часов с popover-выпадашкой быстрых вариантов
 * (5 / 15 / 30 / 60 мин). Если запись уже запланирована — кнопка красная и
 * при клике отменяет schedule.
 */
const ScheduleButton: React.FC<{
  isScheduled: boolean;
  onSchedule: (minutes: number) => void;
  onCancel: () => void;
}> = ({ isScheduled, onSchedule, onCancel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (isScheduled) {
    return (
      <button
        onClick={onCancel}
        className="w-11 h-11 rounded-lg flex items-center justify-center text-coral bg-coral-soft transition-colors flex-shrink-0"
        aria-label="Отменить воспроизведение"
        title="Отменить"
      >
        <Clock className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 rounded-lg flex items-center justify-center text-ink-soft hover:bg-teal-soft hover:text-teal-dark transition-colors flex-shrink-0"
        aria-label="Поставить на воспроизведение"
        title="Поставить на воспроизведение"
      >
        <Clock className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-30 bg-white border border-line rounded-2xl shadow-card-hover p-1.5 flex flex-col gap-0.5 min-w-[120px]"
        >
          <p className="text-[10px] font-black text-muted uppercase tracking-wide px-2 py-1">
            Через
          </p>
          {SCHEDULE_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              onClick={() => {
                onSchedule(preset.minutes);
                setOpen(false);
              }}
              className="text-sm font-bold text-ink-2 hover:bg-teal-soft hover:text-teal-dark rounded-xl px-3 py-2 text-left transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
