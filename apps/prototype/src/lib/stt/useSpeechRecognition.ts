/**
 * useSpeechRecognition (v0.6.0) — обёртка над Web Speech API.
 *
 * Использует browser-native SpeechRecognition (Chrome/Edge/Safari).
 * Если браузер не поддерживает — fallback на mock (сразу возвращает
 * предзаписанный текст для демо).
 *
 * Использование:
 *   const { transcript, isListening, start, stop, supported } = useSpeechRecognition({ lang: 'ru-RU' });
 *   <button onClick={isListening ? stop : start}>mic</button>
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

declare const window: Window & SpeechRecognitionWindow;

export interface UseSpeechRecognitionOptions {
  /** Язык распознавания. Default: 'ru-RU' */
  lang?: string;
  /** Промежуточные результаты в реальном времени. Default: true */
  interimResults?: boolean;
  /** Непрерывное распознавание. Default: false */
  continuous?: boolean;
  /** Mock-транскрипт для fallback (если Web Speech не поддерживается). */
  mockTranscript?: string;
  /** Авто-стоп после тишины N мс. Default: 0 (отключен) */
  silenceTimeoutMs?: number;
}

export interface UseSpeechRecognitionResult {
  /** Текущий распознанный текст (накопительный) */
  transcript: string;
  /** Слушает ли прямо сейчас */
  isListening: boolean;
  /** Ошибка (если была) */
  error: string | null;
  /** Поддерживается ли Web Speech API в этом браузере */
  supported: boolean;
  /** Режим (real или mock) */
  mode: 'real' | 'mock';
  /** Старт записи */
  start: () => void;
  /** Стоп записи */
  stop: () => void;
  /** Сброс транскрипта */
  reset: () => void;
}

const DEFAULT_MOCK_TRANSCRIPT =
  'Алихан поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.';

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const {
    lang = 'ru-RU',
    interimResults = true,
    continuous = false,
    mockTranscript = DEFAULT_MOCK_TRANSCRIPT,
    silenceTimeoutMs = 0,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef('');

  // Определяем поддержку Web Speech API (один раз)
  const [supported, setSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (mockTimeoutRef.current) {
      clearTimeout(mockTimeoutRef.current);
      mockTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    finalTranscriptRef.current = '';
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore — может уже остановлен
      }
    }
    setIsListening(false);
  }, [clearTimers]);

  const startMock = useCallback(() => {
    setError(null);
    setIsListening(true);
    setTranscript('');

    // Имитация: текст появляется побуквенно
    let i = 0;
    const tick = () => {
      if (i < mockTranscript.length) {
        const chunk = mockTranscript.slice(0, i + 3);
        setTranscript(chunk);
        i += 3;
        mockTimeoutRef.current = setTimeout(tick, 30);
      } else {
        setTranscript(mockTranscript);
        setIsListening(false);
      }
    };
    mockTimeoutRef.current = setTimeout(tick, 100);
  }, [mockTranscript]);

  const start = useCallback(() => {
    if (!supported) {
      // Fallback на mock
      startMock();
      return;
    }

    reset();

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setError('Web Speech API не поддерживается');
      startMock();
      return;
    }

    try {
      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.interimResults = interimResults;
      recognition.continuous = continuous;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        // Silence timeout
        if (silenceTimeoutMs > 0) {
          silenceTimeoutRef.current = setTimeout(() => {
            recognition.stop();
          }, silenceTimeoutMs);
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Reset silence timeout при каждом новом результате
        if (silenceTimeoutMs > 0) {
          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(() => {
            recognition.stop();
          }, silenceTimeoutMs);
        }

        let interim = '';
        let finalText = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }

        finalTranscriptRef.current = finalText;
        setTranscript((finalText + interim).trim());
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`STT error: ${event.error}`);
        setIsListening(false);
        clearTimers();
      };

      recognition.onend = () => {
        setIsListening(false);
        clearTimers();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      startMock();
    }
  }, [supported, lang, interimResults, continuous, silenceTimeoutMs, startMock, reset, clearTimers]);

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [clearTimers]);

  return {
    transcript,
    isListening,
    error,
    supported,
    mode: supported ? 'real' : 'mock',
    start,
    stop,
    reset,
  };
}