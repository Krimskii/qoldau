/**
 * ErrorState (v1.5+ E6) — дружелюбный экран ошибки загрузки данных.
 *
 * Используется когда API/стор упал, но рендер страницы не упал.
 * Отличается от ErrorBoundary тем, что ловит «ожидаемые» ошибки (fetch/parse),
 * а не падение рендера.
 *
 * Требования:
 * - i18n (через t('common.error.*')).
 * - role="alert" для a11y.
 * - Кнопка «Повторить» (onRetry).
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { QoldauCard } from './QoldauCard';
import { AppIcon } from './AppIcon';

type IconInput = typeof AlertTriangle | string;

interface ErrorStateProps {
  /** Текст ошибки — покажется под заголовком. Если не передан — дефолт. */
  message?: string;
  /** Кастомный title (опц.). */
  title?: string;
  /** Кастомный description (опц.). */
  description?: string;
  /** Иконка (Lucide component или emoji). */
  icon?: IconInput;
  /** Колбэк «Повторить» — если передан, рисуется кнопка. */
  onRetry?: () => void;
  /** Текст кнопки retry (опц.). */
  retryLabel?: string;
  /** Дополнительный контент под кнопкой (например, ссылка). */
  action?: React.ReactNode;
  /** Вариант карточки. */
  variant?: 'card' | 'plain';
}

function isEmoji(input: IconInput): input is string {
  return typeof input === 'string';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  title,
  description,
  icon,
  onRetry,
  retryLabel,
  action,
  variant = 'card',
}) => {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('common.error.title', { defaultValue: 'Не удалось загрузить' });
  const resolvedDescription =
    description ?? message ?? t('common.error.description', { defaultValue: 'Попробуйте ещё раз.' });
  const resolvedRetry = retryLabel ?? t('common.error.retry', { defaultValue: 'Повторить' });

  const Inner = (
    <div className="flex flex-col items-center text-center gap-3 py-4" role="alert">
      <div className="w-16 h-16 rounded-2xl bg-coral-soft flex items-center justify-center">
        {icon && !isEmoji(icon) ? (
          <AppIcon component={icon} size={32} colorClass="text-coral" />
        ) : (
          <AppIcon component={AlertTriangle} size={32} colorClass="text-coral" />
        )}
      </div>
      <h3 className="text-base font-black text-ink">{resolvedTitle}</h3>
      <p className="text-sm text-muted leading-relaxed max-w-xs">{resolvedDescription}</p>
      {message && !description && (
        <p className="text-xs text-muted-soft italic max-w-xs break-words font-mono">{message}</p>
      )}
      <div className="flex flex-col gap-2 w-full mt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-sm shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <AppIcon component={RotateCw} size={16} colorClass="text-white" />
            {resolvedRetry}
          </button>
        )}
        {action}
      </div>
    </div>
  );

  if (variant === 'plain') return Inner;

  return (
    <QoldauCard variant="tinted-warm" padding="lg">
      {Inner}
    </QoldauCard>
  );
};

export default ErrorState;