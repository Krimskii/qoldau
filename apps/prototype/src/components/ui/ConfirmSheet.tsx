import React, { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { speak } from '@/lib/tts/speak';
import { triggerHaptic } from '@/lib/feedback/haptics';

export interface ConfirmSheetProps {
  /** Открыт ли sheet. */
  open: boolean;
  /** Заголовок-вопрос (центр, 18px, font-black). */
  title: string;
  /** Подпись под заголовком (опц.). */
  subtitle?: string;
  /** Тон кнопки ✓: green (обычное подтверждение) или coral (опасное). */
  confirmTone?: 'green' | 'coral';
  /** Текст aria-label для ✓ (опц., default «Подтвердить»). */
  confirmLabel?: string;
  /** Текст aria-label для ✕ (опц., default «Отмена»). */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmSheet — единый bottom-sheet паттерн подтверждения (v1.5+ D).
 *
 * Везде, где нужно подтверждение действия — используем его.
 * Сейчас: «Срочно» в CallMom (coral tone). На будущее: удаление записи
 * в Speak, «Очистить фразу», и т.п.
 *
 * Поведение:
 * - Slide-up снизу (translate-y + fade, ≤240мс, gate prefers-reduced-motion).
 * - Полупрозрачный backdrop, тап по backdrop = onCancel.
 * - Две большие круглые кнопки: ✓ (green/coral) и ✕ (white outline).
 * - role="dialog", focus на ✓ при открытии.
 * - Haptic (tap) + speak(title) при открытии (читает заголовок вопроса).
 */
export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  open,
  title,
  subtitle,
  confirmTone = 'green',
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus на ✓ при открытии + speak заголовка (озвучка вопроса)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      confirmRef.current?.focus();
      speak(title);
    }, 80);
    return () => window.clearTimeout(t);
  }, [open, title]);

  // ESC отменяет
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const confirmBgClass = confirmTone === 'coral' ? 'bg-coral' : 'bg-green';

  const handleConfirm = () => {
    triggerHaptic('tap');
    onConfirm();
  };

  const handleCancel = () => {
    triggerHaptic('tap');
    onCancel();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCancel();
  };

  // v1.6 E10.1.1: safe-area-inset-bottom для кнопок ✓/✕ (не прижимаются
  // к жест-бару). Также учитываем bottomNav (z-40), т.к. sheet рендерится
  // ПОВЕРХ навбара (z-60) — кнопки не должны скрываться под ним.
  const safeAreaStyle: React.CSSProperties = {
    paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleBackdropClick}
      style={{ background: 'rgba(7, 27, 58, 0.28)' }}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-card p-6 mx-3 mb-3 qoldau-fade-in-up"
        style={safeAreaStyle}
      >
        <div className="text-center mb-5">
          <p className="text-[18px] font-black text-ink leading-snug">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted mt-2 leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          {/* Отмена ✕ */}
          <button
            type="button"
            onClick={handleCancel}
            className="w-16 h-16 rounded-full bg-white border-2 border-line text-muted flex items-center justify-center transition-transform duration-200 ease-out active:scale-[0.92] hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
            aria-label={cancelLabel}
          >
            <X className="w-7 h-7" strokeWidth={2.5} aria-hidden="true" />
          </button>

          {/* Подтвердить ✓ */}
          <button
            ref={confirmRef}
            type="button"
            onClick={handleConfirm}
            className={`w-16 h-16 rounded-full ${confirmBgClass} text-white flex items-center justify-center shadow-md transition-transform duration-200 ease-out active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40`}
            aria-label={confirmLabel}
          >
            <Check className="w-8 h-8" strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSheet;