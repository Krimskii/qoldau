import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Sparkles, ChevronRight, Check } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';

/**
 * FirstRunTutorial — мини-туториал после первой настройки семьи (v1.0rc).
 *
 * Показывается после успешного сохранения имени ребёнка в FamilySetupCard.
 * Содержит 2 экрана (pilot-friendly, не больше):
 * 1) «Как записать наблюдение» — нажать → говорить → стоп.
 * 2) «Что делает система» — структурирует в события, это наблюдение, не диагноз.
 *
 * Кнопка «Понятно» устанавливает флаг в localStorage, чтобы больше не показывать.
 *
 * Не модальный (overlay) — даём прокручиваемый body. Использует overlay поверх
 * приложения для фокуса внимания (как ConsentGate).
 */

const TUTORIAL_FLAG_KEY = 'qoldau-tutorial-seen-v1';

/** Записать факт прохождения туториала. */
export function markTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TUTORIAL_FLAG_KEY, '1');
  } catch {
    // localStorage недоступен — ничего страшного, туториал просто покажется снова.
  }
}

/** Нужно ли показывать туториал. */
export function shouldShowTutorial(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(TUTORIAL_FLAG_KEY) !== '1';
}

/** Выставить флаг «туториал пройден» — вызывается после «Понятно». */
export function completeTutorial(): void {
  markTutorialSeen();
}

interface FirstRunTutorialProps {
  /** Закрыть туториал без установки флага (например, по ×). */
  onSkip?: () => void;
}

export const FirstRunTutorial: React.FC<FirstRunTutorialProps> = ({ onSkip }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<0 | 1>(0);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      completeTutorial();
      if (onSkip) onSkip();
    }
  };

  const handleSkip = () => {
    // Пропуск тоже считается «увиденным» — не показываем снова.
    completeTutorial();
    if (onSkip) onSkip();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 py-6"
      style={{ background: 'rgba(23,48,57,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={handleSkip}
    >
      <div
        className="bg-white rounded-3xl shadow-card-hover w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                step === 0 ? 'bg-teal' : 'bg-line'
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                step === 1 ? 'bg-teal' : 'bg-line'
              }`}
            />
          </div>
          <button
            onClick={handleSkip}
            aria-label={t('common.cancel')}
            className="text-xs font-bold text-muted hover:text-ink transition-colors px-2 py-1"
          >
            {t('tutorial.skip')}
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-2">
          {step === 0 ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-teal-soft flex items-center justify-center mb-3">
                <AppIcon component={Mic} size={28} colorClass="text-teal-dark" />
              </div>
              <h2
                id="tutorial-title"
                className="text-lg font-black text-ink leading-tight mb-1.5"
              >
                {t('tutorial.step1Title')}
              </h2>
              <p className="text-sm text-ink-2 leading-relaxed">
                {t('tutorial.step1Body')}
              </p>

              {/* Визуальная подсказка — 3 шага записи */}
              <ol className="mt-4 space-y-2.5">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <p className="text-sm text-ink-2 leading-snug pt-0.5">
                    {t('tutorial.step1Item1')}
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <p className="text-sm text-ink-2 leading-snug pt-0.5">
                    {t('tutorial.step1Item2')}
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <p className="text-sm text-ink-2 leading-snug pt-0.5">
                    {t('tutorial.step1Item3')}
                  </p>
                </li>
              </ol>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-yellow-soft flex items-center justify-center mb-3">
                <AppIcon component={Sparkles} size={28} colorClass="text-yellow-dark" />
              </div>
              <h2
                id="tutorial-title"
                className="text-lg font-black text-ink leading-tight mb-1.5"
              >
                {t('tutorial.step2Title')}
              </h2>
              <p className="text-sm text-ink-2 leading-relaxed">
                {t('tutorial.step2Body')}
              </p>

              {/* Что происходит — 3 пункта с акцентом на «наблюдение, не диагноз» */}
              <ul className="mt-4 space-y-2.5">
                <li className="flex items-start gap-3">
                  <AppIcon
                    component={Check}
                    size={18}
                    colorClass="text-teal shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-ink-2 leading-snug">
                    {t('tutorial.step2Item1')}
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <AppIcon
                    component={Check}
                    size={18}
                    colorClass="text-teal shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-ink-2 leading-snug">
                    {t('tutorial.step2Item2')}
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <AppIcon
                    component={Check}
                    size={18}
                    colorClass="text-teal shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-ink-2 leading-snug">
                    <strong>{t('tutorial.step2Item3')}</strong>{' '}
                    {t('tutorial.step2Item3Hint')}
                  </p>
                </li>
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pt-4 pb-5 border-t border-line bg-bg/30 mt-4">
          <button
            onClick={handleNext}
            className="w-full min-h-12 px-5 rounded-2xl bg-teal text-white text-sm font-bold hover:bg-teal-dark active:scale-[0.99] transition-colors flex items-center justify-center gap-1.5"
          >
            {step === 0 ? (
              <>
                {t('tutorial.next')}
                <ChevronRight size={16} />
              </>
            ) : (
              <>{t('tutorial.gotIt')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};