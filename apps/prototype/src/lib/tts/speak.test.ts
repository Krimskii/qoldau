/**
 * Тесты для lib/tts/speak.ts — Web Speech API (synthesis) обёртка.
 *
 * jsdom не имеет speechSynthesis, поэтому в beforeEach подменяем
 * window.speechSynthesis + SpeechSynthesisUtterance на spy-mocks.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { speak, stopSpeaking, isSpeechSupported } from '@/lib/tts/speak';

/** Локальный тип нашего мок-класса — не путаем с глобальным SpeechSynthesisUtterance. */
interface FakeUtterance {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
}

interface SpeechMock {
  speakCalls: FakeUtterance[];
  cancelCalls: number[];
  synth: { speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> };
}

function installSpeechMock(): SpeechMock {
  const speakCalls: FakeUtterance[] = [];
  const cancelCalls: number[] = [];

  class FakeUtteranceImpl implements FakeUtterance {
    text = '';
    lang = '';
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: ((ev: Event) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
  }

  const synth = {
    speak: vi.fn((u: FakeUtterance) => {
      speakCalls.push(u);
    }),
    cancel: vi.fn(() => {
      cancelCalls.push(Date.now());
    }),
    getVoices: vi.fn(() => []),
  };

  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    configurable: true,
    value: synth,
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    configurable: true,
    value: FakeUtteranceImpl,
  });

  return { speakCalls, cancelCalls, synth };
}

describe('lib/tts/speak', () => {
  let mock: SpeechMock;

  beforeEach(() => {
    mock = installSpeechMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isSpeechSupported() возвращает true когда API доступен', () => {
    expect(isSpeechSupported()).toBe(true);
  });

  it('speak("привет") создаёт utterance с дефолтами ru-RU / rate 0.95', () => {
    const ok = speak('привет');
    expect(ok).toBe(true);
    expect(mock.speakCalls).toHaveLength(1);
    const u = mock.speakCalls[0];
    expect(u.text).toBe('привет');
    expect(u.lang).toBe('ru-RU');
    expect(u.rate).toBe(0.95);
    expect(u.pitch).toBe(1);
    expect(u.volume).toBe(1);
  });

  it('speak() поддерживает overrides (lang, rate, pitch)', () => {
    speak('hello', { lang: 'en-US', rate: 1.2, pitch: 0.8 });
    expect(mock.speakCalls).toHaveLength(1);
    const u = mock.speakCalls[0];
    expect(u.lang).toBe('en-US');
    expect(u.rate).toBe(1.2);
    expect(u.pitch).toBe(0.8);
  });

  it('перед новой фразой вызывается cancel() — фразы не наслаиваются', () => {
    speak('первая');
    expect(mock.cancelCalls).toHaveLength(1);
    expect(mock.speakCalls).toHaveLength(1);
    speak('вторая');
    // Должен быть cancel() для второй фразы
    expect(mock.cancelCalls).toHaveLength(2);
    expect(mock.speakCalls).toHaveLength(2);
  });

  it('пустая строка — no-op (cancel не вызывается, speak не вызывается)', () => {
    speak('');
    expect(mock.speakCalls).toHaveLength(0);
    expect(mock.cancelCalls).toHaveLength(0);
  });

  it('whitespace-only строка — no-op', () => {
    speak('   ');
    expect(mock.speakCalls).toHaveLength(0);
  });

  it('stopSpeaking() вызывает cancel() и не запускает новую речь', () => {
    speak('что-то');
    stopSpeaking();
    expect(mock.cancelCalls.length).toBeGreaterThanOrEqual(2); // initial + stop
    expect(mock.synth.cancel).toHaveBeenCalled();
  });

  it('isSpeechSupported() возвращает false если API нет', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    expect(isSpeechSupported()).toBe(false);
    // speak без API — no-op, не бросает
    expect(() => speak('тест')).not.toThrow();
  });

  it('speak() без API возвращает false (no-op)', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    expect(speak('тест')).toBe(false);
  });
});