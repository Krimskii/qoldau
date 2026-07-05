/**
 * Haptics wrapper (v1.5+ D1).
 *
 * Единая обёртка над navigator.vibrate с учётом:
 * - наличия API (только touch-устройства);
 * - sensoryMode ('calm' / 'standard' / 'playful');
 * - пользовательской настройки «Тишина»;
 * - prefers-reduced-motion.
 *
 * Используется в QoldauActionCard, QoldauIconCard, NeedCard, CalmMode,
 * ChildHome и других тапаемых элементах child UI.
 *
 * Согласно спеке:
 * - calm: гаптик ВЫКЛ.
 * - standard: лёгкий tap (10ms) — по умолчанию.
 * - playful: короткий двойной pattern ([10, 30, 10]) — cue + tap.
 */
import { useChildSettingsStore } from '@/store/useChildSettingsStore';

export type HapticPattern = 'off' | 'tap' | 'cue' | 'success';

const VIBRATION_PATTERNS: Record<HapticPattern, number | number[]> = {
  off: 0,
  tap: 10,
  cue: [10, 30, 10],
  success: [20, 40, 20],
};

/**
 * Проверить, доступен ли navigator.vibrate на этом устройстве.
 */
export function canVibrate(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

/**
 * Безопасно вызвать navigator.vibrate. Возвращает true если гаптик сработал.
 *
 * Учитывает:
 * - sensor режим (calm = off);
 * - paused (глобальная «Тишина»);
 * - reduced-motion (отключает гаптик, оставляет только визуальный feedback).
 */
export function triggerHaptic(
  pattern: HapticPattern,
  options?: {
    /** Прямой override sensoryMode (для компонентов вне child UI). */
    sensoryMode?: 'calm' | 'standard' | 'playful';
    /** Прямой override paused. */
    paused?: boolean;
  },
): boolean {
  if (!canVibrate()) return false;
  // Гаптик отключён если выключен режим explicit off.
  if (pattern === 'off') return false;

  // Берём настройки из стора (если не override).
  const store =
    typeof window !== 'undefined' ? useChildSettingsStore.getState() : null;
  // v1.5+ D2: sensoryMode появится в D2; пока fallback на 'standard'.
  const sensoryMode =
    options?.sensoryMode ??
    ((store as { sensoryMode?: 'calm' | 'standard' | 'playful' } | null)
      ?.sensoryMode ??
      'standard');
  const paused = options?.paused ?? (store?.paused ?? false);

  // В «Тишина» гаптик ВЫКЛ (ребёнок хочет тишину — никакой вибрации тоже).
  if (paused) return false;

  // В calm — гаптик выключен (см. спек).
  if (sensoryMode === 'calm' && pattern !== 'success') return false;

  // prefers-reduced-motion → пользователь ОС-просит не вибрировать.
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return false;
  }

  const v = VIBRATION_PATTERNS[pattern];
  if (v === 0) return false;
  try {
    return navigator.vibrate(v);
  } catch {
    return false;
  }
}

/**
 * Хук-обёртка над triggerHaptic с подпиской на стор.
 * Используется в React-компонентах где нужна динамическая проверка настроек.
 */
export function useHapticFeedback() {
  return {
    trigger: (
      pattern: HapticPattern = 'tap',
    ) => triggerHaptic(pattern),
    canVibrate,
  };
}