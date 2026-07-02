/**
 * Vitest setup для frontend.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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