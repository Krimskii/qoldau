import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { audioBlobStore } from '@/lib/audio/audioBlobStore';
import { useRecordingsStore, type Recording } from '@/store/useRecordingsStore';
import { useEventStore } from '@/store/useEventStore';
import { formatDuration } from '@/utils/formatDuration';

/**
 * RecordingsList (v1.6 F1.7) — список записей с playback через IndexedDB.
 *
 * Каждая запись имеет `audioId` (ключ в audioBlobStore). При playback:
 * 1. Загружаем Blob из IndexedDB → создаём objectURL.
 * 2. Проигрываем через `<audio>` (управление через ref).
 * 3. На размонтировании / при unmount компонента → revoke objectURL.
 *
 * Delete:
 * - Удаляет blob из IndexedDB (если есть).
 * - Удаляет metadata из useRecordingsStore.
 * - Удаляет связанное voice_observation event из useEventStore (если есть).
 *
 * Используется на parent/tutor страницах (RecordingsPage, EventTimeline filter).
 */
interface RecordingsListProps {
  /** Фильтр по childId (опционально). */
  childId?: string;
  /** Лимит отображения (по умолчанию все). */
  limit?: number;
}

export const RecordingsList: React.FC<RecordingsListProps> = ({ childId, limit }) => {
  const { t } = useTranslation();
  const recordings = useRecordingsStore((s) => s.recordings);
  const removeRecording = useRecordingsStore((s) => s.removeRecording);
  const events = useEventStore((s) => s.events);
  const removeEvent = useEventStore((s) => s.deleteEvent);

  const filtered = (childId ? recordings.filter((r) => r.childId === childId) : recordings)
    .slice(0, limit);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-line p-5 text-center bg-white">
        <p className="text-sm text-ink-soft font-bold">
          {t('recordings.empty', 'Пока нет записей')}
        </p>
        <p className="text-xs text-muted mt-1">
          {t(
            'recordings.emptyHint',
            'Ребёнок ещё не нажимал «Сказать». Записи появятся здесь автоматически.',
          )}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-label={t('recordings.listAria', 'Список записей')}>
      {filtered.map((rec) => (
        <RecordingItem
          key={rec.id}
          recording={rec}
          relatedEventId={events.find(
            (e) =>
              e.type === 'voice_observation' &&
              (e.payload as { recordingId?: string } | undefined)?.recordingId === rec.id,
          )?.id}
          onDelete={(relatedEventId) => {
            if (relatedEventId) removeEvent(relatedEventId);
            removeRecording(rec.id);
            if (rec.audioId) void audioBlobStore.del(rec.audioId);
          }}
        />
      ))}
    </ul>
  );
};

interface RecordingItemProps {
  recording: Recording;
  relatedEventId?: string;
  onDelete: (relatedEventId?: string) => void;
}

const RecordingItem: React.FC<RecordingItemProps> = ({ recording, relatedEventId, onDelete }) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.durationSec);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const hasAudio = Boolean(recording.audioId) && audioBlobStore.isAvailable();

  // Загрузить blob → objectURL при монтировании.
  useEffect(() => {
    if (!hasAudio || !recording.audioId) return;
    let cancelled = false;
    void audioBlobStore.get(recording.audioId).then((blob) => {
      if (cancelled || !blob) {
        setLoadError('audio_unavailable');
        return;
      }
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      if (audioRef.current) {
        audioRef.current.src = url;
      }
    });
    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [hasAudio, recording.audioId]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      void el.play();
    }
  }, [isPlaying]);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      // auto-revert через 3 сек.
      window.setTimeout(() => setConfirming(false), 3000);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onDelete(relatedEventId);
  };

  return (
    <li className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-line">
      {/* Play/Pause */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!hasAudio || Boolean(loadError)}
        aria-label={
          isPlaying
            ? t('recordings.pause', 'Пауза')
            : t('recordings.play', 'Воспроизвести')
        }
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 disabled:opacity-40 ${
          isPlaying
            ? 'bg-gradient-to-br from-coral to-coral-dark text-white'
            : 'bg-gradient-to-br from-teal to-teal-dark text-white'
        }`}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-[1px]" />}
      </button>

      {/* Label + progress */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-ink truncate" title={recording.label}>
          {recording.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted tabular-nums">
            {formatDuration(Math.floor(currentTime))} / {formatDuration(duration)}
          </span>
          {recording.transcript && (
            <span
              className="text-[11px] text-ink-soft truncate italic"
              title={recording.transcript}
            >
              · «{recording.transcript}»
            </span>
          )}
          {!hasAudio && (
            <span className="text-[10px] text-muted italic">
              {t('recordings.noAudio', 'без звука')}
            </span>
          )}
        </div>
        {/* Scrubber */}
        {hasAudio && duration > 0 && (
          <div className="mt-1.5 h-1 bg-line-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-100"
              style={{
                width: `${Math.min(100, (currentTime / Math.max(1, duration)) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Audio element (hidden) */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(Math.floor(e.currentTarget.duration || recording.durationSec))}
        onError={() => setLoadError('playback_failed')}
        preload="metadata"
        aria-hidden="true"
      />

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        aria-label={
          confirming
            ? t('recordings.confirmDelete', 'Подтвердить удаление')
            : t('recordings.delete', 'Удалить')
        }
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 ${
          confirming
            ? 'bg-coral text-white animate-pulse'
            : 'text-muted hover:bg-coral-soft hover:text-coral'
        }`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
};