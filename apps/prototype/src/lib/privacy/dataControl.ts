import { useEventStore } from '@/store/useEventStore';
import { useConsentStore } from '@/store/useConsentStore';
import {
  clearFamilyChildName,
} from '@/data/demoDataset';

/**
 * privacy/dataControl — утилиты управления локальными данными ребёнка (v1.0).
 *
 * Per `docs/PRIVACY_CONSENT_PILOT.md` §3, §5:
 * "Очистить данные" в настройках стирает ВСЕ локальные данные ребёнка:
 * - события (qoldau-events-v1);
 * - имя ребёнка (qoldau-family-child-name-v1);
 * - согласие (qoldau-consent-v1) — для re-consent при следующем запуске.
 *
 * НЕ трогаем: настройки ребёнка (qoldau-child-settings-v1), theme, auth,
 * child-onboarding flag — это не «данные ребёнка», а настройки приложения.
 */

export const CHILD_DATA_KEYS = [
  'qoldau-events-v1',
  'qoldau-family-child-name-v1',
  'qoldau-consent-v1',
] as const;

/**
 * Стирает ВСЕ локальные данные ребёнка. После вызова:
 * - события пустые;
 * - имя ребёнка сброшено → вернётся «Демо-профиль 1» (синтетика);
 * - согласие сброшено → ConsentGate покажется снова при следующей записи.
 *
 * Также чистит in-memory Zustand store через `useEventStore.setState(...)`
 * чтобы UI сразу отражал «чистое» состояние без перезагрузки.
 *
 * Возвращает список ключей, которые были стёрты (для UI feedback).
 */
export function clearAllChildData(): readonly string[] {
  if (typeof window !== 'undefined') {
    for (const key of CHILD_DATA_KEYS) {
      window.localStorage.removeItem(key);
    }
  }

  // Сбрасываем in-memory store events.
  useEventStore.setState({ events: [] });

  // Сбрасываем имя (дополнительно — функция уже стирает ключ, но для
  // консистентности и на случай если данные были установлены иначе).
  clearFamilyChildName();

  // Сбрасываем consent в Zustand (persist почистится через setItem).
  useConsentStore.getState().clear();

  return CHILD_DATA_KEYS;
}

/**
 * Проверяет, есть ли на устройстве хоть какие-то данные ребёнка.
 * Используется для условного отображения кнопки «Очистить данные»
 * и для подтверждения (если нечего чистить — UI явно говорит).
 */
export function hasChildData(): boolean {
  if (typeof window === 'undefined') return false;
  return CHILD_DATA_KEYS.some((k) => window.localStorage.getItem(k) !== null);
}