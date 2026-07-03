import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';

/**
 * MiniPolicy — модалка с мини-политикой приватности (v1.0).
 *
 * Текст из `docs/PRIVACY_CONSENT_PILOT.md` §4. Pilot-уровень — не
 * юридическое заключение. Для production нужен обзор юриста РК.
 *
 * Используется:
 * - ссылка из ConsentGate (перед первой записью);
 * - пункт «Согласия и приватность» в ParentProfile.
 */
interface MiniPolicyProps {
  open: boolean;
  onClose: () => void;
}

export const MiniPolicy: React.FC<MiniPolicyProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mini-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(23,48,57,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-card-hover w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          <div className="w-10 h-10 rounded-2xl bg-teal-soft flex items-center justify-center text-teal shrink-0">
            <AppIcon component={ShieldCheck} size={20} colorClass="text-teal-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="mini-policy-title"
              className="text-base font-black text-ink leading-tight"
            >
              Приватность — пилот
            </h2>
            <p className="text-[11px] text-muted mt-0.5">
              Qoldau AI · v1.0
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted hover:bg-bg active:scale-95 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — текст политики (§4 спеки), простой язык */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-ink-2 leading-relaxed space-y-3">
          <p className="font-bold text-ink">
            Qoldau AI — инструмент для наблюдений за коммуникацией и состоянием ребёнка.
          </p>
          <p>
            Это <strong>не медицинское устройство</strong>: приложение не ставит диагнозов
            и не лечит.
          </p>

          <div>
            <p className="font-bold text-ink">Хранение.</p>
            <p>
              Все данные о ребёнке (имя, события, наблюдения) хранятся только{' '}
              <strong>на вашем устройстве</strong>. Мы не храним их на серверах и не
              передаём третьим лицам, кроме случая ниже.
            </p>
          </div>

          <div>
            <p className="font-bold text-ink">Распознавание речи.</p>
            <p>
              Когда вы записываете голосовое наблюдение, аудиозапись отправляется на наш
              сервер и далее в сервисы{' '}
              <strong>OpenAI (Whisper для речи, gpt-4o-mini для анализа)</strong>. Аудио и результат на наших серверах
              <strong> не сохраняются</strong>.
            </p>
          </div>

          <div>
            <p className="font-bold text-ink">Ваш контроль.</p>
            <p>
              Вы в любой момент можете удалить все данные в настройках приложения
              («Очистить данные»).
            </p>
          </div>

          <div>
            <p className="font-bold text-ink">Дети.</p>
            <p>
              Приложением управляет взрослый (родитель или законный представитель),
              который даёт согласие при первом запуске.
            </p>
          </div>

          <p className="text-xs text-muted pt-2 border-t border-line">
            Pilot-версия для внутреннего тестирования. Перед публичным запуском требуется
            юридический обзор.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line bg-bg/50">
          <button
            onClick={onClose}
            className="w-full min-h-12 px-5 rounded-2xl bg-teal text-white text-sm font-bold hover:bg-teal-dark active:scale-[0.99] transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};