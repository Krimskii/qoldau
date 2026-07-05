/**
 * Tap feedback — единый паттерн реакции на тап в child UI (v1.5+ D1).
 *
 * Используется в:
 * - QoldauActionCard / QoldauIconCard / NeedCard;
 * - ChildHome 6 actions, кнопка «Позвать маму», «Собрать фразу»;
 * - CalmMode 4 плитки, ✓/✕;
 * - ChildCards (Потребности + Категории).
 *
 * Контракт:
 * - active:scale-[0.96] + 200ms transition (визуальная «вдавленность»).
 * - ring-подсветка при наведении/фокусе (200ms).
 * - haptic feedback (navigator.vibrate(10)) по умолчанию.
 * - speak(label) — опционально, если передан onSpeak.
 *
 * Гаптик гейтится по sensoryMode (см. lib/feedback/haptics.ts):
 *   calm: нет гаптика;
 *   standard: tap (10ms);
 *   playful: cue ([10,30,10]).
 */

import type { MouseEvent } from 'react';

export interface TapFeedbackOptions {
  /** TTS-произнесение (label). Если undefined — только haptic. */
  speakLabel?: string;
  /** Импорт speak — ленивый, чтобы не тянуть lib/tts в unit-тесты. */
  speak?: (text: string) => void;
  /** Haptic-паттерн. По умолчанию 'tap'. */
  haptic?: 'tap' | 'cue' | 'success' | 'off';
  /** Callback после основной обработки (например onClick). */
  onAfter?: () => void;
}

/**
 * Вызывается из onClick обработчика.
 * Не делает preventDefault — это нарушит обычную обработку кнопок.
 */
export function handleTap(
  _event: MouseEvent<HTMLElement>,
  opts: TapFeedbackOptions = {},
): void {
  // 1. Haptic — гейтится по sensoryMode и paused внутри.
  if (opts.haptic && opts.haptic !== 'off') {
    // Динамический импорт чтобы не тянуть haptic в unit-тесты компонентов.
    void import('./haptics').then(({ triggerHaptic }) => {
      triggerHaptic(opts.haptic ?? 'tap');
    });
  }

  // 2. Speak — если есть label и функция.
  if (opts.speakLabel && opts.speak) {
    opts.speak(opts.speakLabel);
  }

  // 3. Дополнительный callback (например оригинальный onClick).
  opts.onAfter?.();
}