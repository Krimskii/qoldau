import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioRecorderOptions {
  audio?: MediaTrackConstraints | boolean;
  mimeTypes?: string[];
  timeSliceMs?: number;
}

export interface UseAudioRecorderResult {
  isRecording: boolean;
  isProcessing: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
}

const DEFAULT_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

export function chooseSupportedAudioMimeType(mimeTypes = DEFAULT_MIME_TYPES): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderResult {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    clearTimer();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    stopStream(streamRef.current);
    recorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    setIsRecording(false);
    setIsProcessing(false);
    setDuration(0);
    setAudioBlob(null);
    setError(null);
  }, [clearTimer]);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('MediaRecorder is not available in this browser');
      return;
    }

    setError(null);
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio ?? true,
      });
      const mimeType = chooseSupportedAudioMimeType(options.mimeTypes);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setError('Audio recording failed');
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }
      }, 250);

      recorder.start(options.timeSliceMs ?? 1000);
    } catch (err) {
      stopStream(streamRef.current);
      recorderRef.current = null;
      streamRef.current = null;
      setIsRecording(false);
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : 'Microphone permission was denied');
    }
  }, [isRecording, options.audio, options.mimeTypes, options.timeSliceMs]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    const stream = streamRef.current;
    if (!recorder) return audioBlob;

    setIsProcessing(true);
    clearTimer();
    setIsRecording(false);
    if (startedAtRef.current) {
      setDuration(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
    }

    return new Promise((resolve) => {
      const finish = () => {
        stopStream(stream);
        const blob = chunksRef.current.length > 0
          ? new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          : null;
        recorderRef.current = null;
        streamRef.current = null;
        startedAtRef.current = null;
        setAudioBlob(blob);
        setIsProcessing(false);
        resolve(blob);
      };

      if (recorder.state === 'inactive') {
        finish();
        return;
      }

      recorder.onstop = finish;
      recorder.stop();
    });
  }, [audioBlob, clearTimer]);

  useEffect(() => () => {
    clearTimer();
    stopStream(streamRef.current);
  }, [clearTimer]);

  return {
    isRecording,
    isProcessing,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
