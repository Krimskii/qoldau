import React, { useState } from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useConsentStore } from '@/store/useConsentStore';
import { MiniPolicy } from '@/components/privacy/MiniPolicy';

/**
 * ConsentGate — одноразовый экран согласия родителя (v1.0).
 *
 * Показывается ДО первой записи голоса. Содержит:
 * - краткое объяснение «что мы делаем и чего НЕ делаем» (RU, простой язык);
 * - чекбокс «Я родитель / законный представитель и даю согласие»;
 * - кнопку «Продолжить» (disabled пока чекбокс не отмечен);
 * - ссылку на полную мини-политику (`MiniPolicy`).
 *
 * Согласие сохраняется локально в `useConsentStore` (localStorage
 * `qoldau-consent-v1`), экран больше не показывается.
 *
 * Текст и правила — `docs/PRIVACY_CONSENT_PILOT.md` §2.
 */
interface ConsentGateProps {
  /** Что делать после принятия согласия — например, начать запись. */
  onAccept: () => void;
  /** Если пользователь закрывает без согласия (например, нажал «назад»). */
  onDismiss?: () => void;
}

export const ConsentGate: React.FC<ConsentGateProps> = ({ onAccept, onDismiss }) => {
  const accept = useConsentStore((s) => s.accept);
  const [checked, setChecked] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const handleContinue = () => {
    if (!checked) return;
    accept();
    onAccept();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-gate-title"
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        style={{ background: 'rgba(23,48,57,0.55)', backdropFilter: 'blur(6px)' }}
      >
        <div className="bg-white rounded-3xl shadow-card-hover w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
            <div className="w-10 h-10 rounded-2xl bg-teal-soft flex items-center justify-center shrink-0">
              <AppIcon component={ShieldCheck} size={20} colorClass="text-teal-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="consent-gate-title"
                className="text-base font-black text-ink leading-tight"
              >
                Прежде чем записывать
              </h2>
              <p className="text-[11px] text-muted mt-0.5">
                Согласие родителя / представителя
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                aria-label="Закрыть"
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted hover:bg-bg active:scale-95 transition-colors shrink-0"
              >
                ×
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-ink-2 leading-relaxed space-y-3">
            <p className="text-ink">
              Запись голоса — это обработка детских данных. Пожалуйста, прочитайте
              коротко,{' '}
              <strong>что мы делаем и чего не делаем</strong>.
            </p>

            <ul className="space-y-2.5">
              <li className="flex gap-2.5">
                <span aria-hidden className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                  1
                </span>
                <p>
                  Qoldau AI — <strong>инструмент наблюдений</strong>, не медицинское
                  устройство. Не диагностирует и не лечит.
                </p>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                  2
                </span>
                <p>
                  Данные о ребёнке хранятся <strong>на этом устройстве</strong>. Мы не
                  собираем их в облако.
                </p>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                  3
                </span>
                <p>
                  Когда вы записываете голос, аудио отправляется на наш сервер только для
                  распознавания речи и структурирования — и{' '}
                  <strong>не сохраняется</strong> там.
                </p>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-teal-soft text-teal-dark font-black text-xs flex items-center justify-center">
                  4
                </span>
                <p>
                  Распознавание использует сервисы <strong>OpenAI (Whisper для речи, gpt-4o-mini для анализа)</strong>.
                </p>
              </li>
            </ul>

            {/* Ссылка на мини-политику */}
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-dark hover:text-teal transition-colors py-1"
            >
              <AppIcon component={FileText} size={14} colorClass="text-teal-dark" />
              Полная политика (откроется здесь)
            </button>
          </div>

          {/* Footer — чекбокс + кнопка */}
          <div className="px-5 py-4 border-t border-line bg-bg/30 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-2 border-line text-teal-dark focus:ring-teal/40 focus:ring-2 accent-teal-dark shrink-0"
                aria-describedby="consent-gate-checkbox-desc"
              />
              <span
                id="consent-gate-checkbox-desc"
                className="text-sm text-ink-2 leading-snug"
              >
                Я родитель или законный представитель и{' '}
                <strong>даю согласие</strong> на обработку данных, описанную выше.
              </span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!checked}
              className="w-full min-h-12 px-5 rounded-2xl bg-teal text-white text-sm font-bold hover:bg-teal-dark active:scale-[0.99] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Продолжить
            </button>

            <p className="text-[11px] text-muted text-center">
              Согласие сохраняется на этом устройстве. Можно изменить в «Настройки →
              Согласия и приватность».
            </p>
          </div>
        </div>
      </div>

      <MiniPolicy open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </>
  );
};