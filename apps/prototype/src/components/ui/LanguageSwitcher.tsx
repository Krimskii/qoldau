/**
 * LanguageSwitcher (v0.6.6) — переключатель языка.
 *
 * Компактный dropdown с флагами/названиями. Меняет i18next language,
 * persistence в localStorage `qoldau-lang-v1`.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, type SupportedLanguage } from '@/i18n/config';
import { AppIcon } from './AppIcon';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = (i18n.language?.split('-')[0] ?? 'ru') as SupportedLanguage;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  return (
    <div className={`relative ${className ?? ''}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft"
        aria-label="Язык"
        aria-expanded={open}
      >
        <AppIcon component={Globe} size={16} colorClass="text-ink-2" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-line rounded-2xl shadow-card-hover py-1 z-50 animate-fade-in">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                void i18n.changeLanguage(lang);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-bold text-ink hover:bg-teal-soft transition-colors flex items-center gap-2"
            >
              <span className="flex-1">{LANGUAGE_LABELS[lang]}</span>
              {current === lang && <AppIcon component={Check} size={14} colorClass="text-teal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};