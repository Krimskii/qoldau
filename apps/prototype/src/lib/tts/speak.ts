/**
 * lib/tts/speak.ts — обёртка над Web Speech API (text-to-speech).
 *
 * Используется в «говорящих карточках» ребёнка (v1.0.x):
 * тап по AAC-карточке / слову в phrase builder / элементу расписания —
 * озвучивает короткую подпись, чтобы ребёнок слышал что нажал.
 *
 * Sensory-safe defaults:
 * - rate 0.95 (немного медленнее для ясности);
 * - перед новой фразой cancel() — не наслаивать озвучку;
 * - тихий no-op если API недоступно (SSR / Node / no support).
 */
export interface SpeakOptions {
  /** Язык BCP-47, по умолчанию 'ru-RU'. */
  lang?: string;
  /** Громкость 0..1, по умолчанию 1. */
  volume?: number;
  /** Скорость 0.1..10, по умолчанию 0.95 (мягче). */
  rate?: number;
  /** Pitch 0..2, по умолчанию 1. */
  pitch?: number;
}

const DEFAULTS: Required<SpeakOptions> = {
  lang: 'ru-RU',
  volume: 1,
  rate: 0.95,
  pitch: 1,
};

/** Глобальный singleton — чтобы cancel() находил текущий utterance. */
let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Возвращает true, если Web Speech API доступен в этом окружении.
 * Используется в компонентах, чтобы показывать/скрывать TTS-only UI.
 */
export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Озвучивает текст. Перед новой фразой останавливает текущую —
 * чтобы фразы не наслаивались. No-op если API нет или текст пустой.
 *
 * Возвращает true если речь была запущена, false — если no-op.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported()) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  const opts = { ...DEFAULTS, ...options };

  // Не наслаиваем фразы.
  try {
    window.speechSynthesis.cancel();
  } catch {
    // cancel() может бросить в редких случаях — продолжаем.
  }

  const utterance = new SpeechSynthesisUtterance(trimmed);
  // Явная установка text — некоторые реализации (jsdom, старые WebView)
  // не сохраняют text из конструктора. Реальные браузеры это поддерживают.
  utterance.text = trimmed;
  utterance.lang = opts.lang;
  utterance.volume = opts.volume;
  utterance.rate = opts.rate;
  utterance.pitch = opts.pitch;

  // Очищаем ссылку когда речь закончилась — чтобы cancel() не
  // задевал уже отыгранную фразу и не блокировал следующую.
  utterance.onend = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
  };
  utterance.onerror = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Останавливает текущую озвучку (используется при размонтировании / паузе).
 */
export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
  activeUtterance = null;
}