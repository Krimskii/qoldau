import React from 'react';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { useToastStore } from '@/store/useToastStore';
import { useDemoStore } from '@/store/useDemoStore';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

/**
 * DemoControls — панель управления демо-данными.
 *
 * В Overview: показывается рядом с «Запустить демо» — кнопка «Сбросить».
 * Подтверждение через confirm dialog (не alert) — спокойно и ясно.
 */
export const DemoControls: React.FC<{ variant?: 'button' | 'card' }> = ({ variant = 'button' }) => {
  const { resetEvents } = useDemoControlsStore();
  const { showToast } = useToastStore();
  const { endDemo, isDemoMode } = useDemoStore();
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    const count = resetEvents();
    endDemo();
    showToast(`Демо-данные сброшены: ${count} событий`, 'success');
    setConfirming(false);
  };

  if (variant === 'card') {
    return (
      <div className="bg-white border border-line rounded-2xl p-5 shadow-card-soft">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-soft flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-yellow" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-ink mb-1">Сброс демо-данных</h3>
            <p className="text-sm text-muted leading-snug mb-3">
              Вернёт события, события ребёнка и карточки к исходному состоянию.
              Это полезно, если хотите повторить демо с чистого листа.
            </p>
            {confirming ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-coral text-white font-black text-sm hover:opacity-90 transition-opacity"
                >
                  Да, сбросить
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-soft text-ink font-black text-sm hover:bg-yellow-soft/70 active:scale-[0.98] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Сбросить демо
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={isDemoMode ? () => endDemo() : () => setConfirming(true)}
        className="flex items-center gap-2 text-sm font-bold text-muted hover:text-teal-dark transition-colors px-3 py-2 rounded-xl hover:bg-teal-soft"
        title={isDemoMode ? 'Завершить демо' : 'Сбросить демо-данные'}
      >
        <RefreshCw className="w-4 h-4" />
        {isDemoMode ? 'Завершить демо' : 'Сброс демо'}
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(7,27,58,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirming(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Подтверждение сброса"
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-card-hover p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-soft flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow" />
              </div>
              <div>
                <h3 className="text-base font-black text-ink">Сбросить демо?</h3>
                <p className="text-sm text-ink-2 leading-snug mt-1">
                  Вернёт все события к исходному состоянию. Это полезно, если хотите
                  показать демо с чистого листа.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-coral text-white font-black text-sm hover:opacity-90 transition-opacity"
              >
                Да, сбросить
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-3 rounded-xl bg-white border border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};