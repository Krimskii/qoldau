import i18n from '@/i18n/config';

/**
 * Single source of truth for date/time formatting across the app.
 * Locale follows the active i18n language instead of a hardcoded 'ru-RU',
 * so formatting stays correct once the UI is fully localized.
 */

const INTL_LOCALE: Record<string, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
};

function currentLocale(): string {
  return INTL_LOCALE[i18n.language] ?? 'ru-RU';
}

/** "14:05" */
export function formatTime(value: string | number | Date): string {
  return new Date(value).toLocaleTimeString(currentLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "12 июля" by default; pass options to override (e.g. add year, use short month). */
export function formatDate(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' },
): string {
  return new Date(value).toLocaleDateString(currentLocale(), options);
}
