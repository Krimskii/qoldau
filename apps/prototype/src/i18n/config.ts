/**
 * i18n setup (v0.6.6) — react-i18next + browser language detector.
 *
 * Языки: ru (default), kk (казахский), en.
 * Persistence: localStorage `qoldau-lang-v1`.
 *
 * Использование:
 *   const { t } = useTranslation();
 *   <h1>{t('landing.heroTitle1')}</h1>
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import kk from './locales/kk.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['ru', 'kk', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ru: 'Русский',
  kk: 'Қазақша',
  en: 'English',
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      kk: { translation: kk },
      en: { translation: en },
    },
    fallbackLng: 'ru',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'qoldau-lang-v1',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React уже экранирует
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;