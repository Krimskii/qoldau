/**
 * Vitest setup для frontend.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import i18n from '@/i18n/config';

// i18n — async init. Дожидаемся готовности до запуска тестов,
// чтобы `t('auth.loginEmailPlaceholder')` сразу возвращал текст, не ключ.
beforeAll(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => {
      i18n.on('initialized', () => resolve());
      // Safety timeout — fallback к работе с ключами.
      setTimeout(resolve, 200);
    });
  }
  await i18n.changeLanguage('ru');
});

// jsdom не имеет matchMedia (prefers-color-scheme)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// SpeechRecognition mock (jsdom не имеет) — auto-fires onstart/onend.
const mockSpeechRecognition = class {
  continuous = false;
  interimResults = false;
  lang = 'ru-RU';
  onresult: ((ev: unknown) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  onend: ((ev: unknown) => void) | null = null;
  onstart: ((ev: unknown) => void) | null = null;
  start() {
    setTimeout(() => {
      this.onstart?.(new Event('start'));
    }, 0);
  }
  stop() {
    setTimeout(() => {
      this.onend?.(new Event('end'));
    }, 0);
  }
  abort() {
    setTimeout(() => {
      this.onend?.(new Event('end'));
    }, 0);
  }
};
(globalThis as unknown as { SpeechRecognition: unknown }).SpeechRecognition = mockSpeechRecognition;
(globalThis as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition = mockSpeechRecognition;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom не имеет HTMLElement.prototype.scrollTo — мокаем.
// Используется в ParentAIChat и других страницах с auto-scroll на новые сообщения.
if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function () {
    /* noop в jsdom */
  };
}