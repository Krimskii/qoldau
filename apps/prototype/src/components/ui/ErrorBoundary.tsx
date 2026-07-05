/**
 * ErrorBoundary (v0.6.3 → v1.5+ E6) — top-level React error boundary.
 *
 * Ловит ошибки рендера ниже по дереву, показывает дружелюбный экран
 * с reset-кнопкой (reload / reset stores). v1.5+ E6:
 * - i18n через t('common.errorBoundary.*').
 * - safe-area-aware padding (iOS notch / Android status bar).
 * - Кнопка «На главную» адаптируется по роли (parent/child → /overview, иначе тоже /overview).
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import { QoldauCard } from './QoldauCard';
import { AppIcon } from './AppIcon';
import { sentry } from '@/utils/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
    sentry.captureException(error, { componentStack: info.componentStack });
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} onReset={this.handleReset} onReload={this.handleReload} />;
    }
    return this.props.children;
  }
}

/**
 * ErrorScreen — функциональный компонент (внутри ErrorBoundary нельзя использовать хуки,
 * потому что boundary — class). Получает t/navigate через props от родителя.
 */
const ErrorScreen: React.FC<{
  error: Error | null;
  onReset: () => void;
  onReload: () => void;
}> = ({ error, onReset, onReload }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/overview');
  };

  return (
    <div
      className="min-h-screen bg-bg flex items-center justify-center px-5"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="w-full max-w-[420px]">
        <QoldauCard variant="elevated" padding="lg">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-coral-soft flex items-center justify-center">
              <AppIcon component={AlertTriangle} size={32} colorClass="text-coral" />
            </div>
            <h1 className="text-xl font-black text-ink">
              {t('common.errorBoundary.title', { defaultValue: 'Что-то сломалось' })}
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              {t('common.errorBoundary.description', {
                defaultValue:
                  'Произошла ошибка в приложении. Попробуйте обновить страницу или вернуться на главную.',
              })}
            </p>

            {error && (
              <details className="w-full text-left mt-2">
                <summary className="text-xs text-muted cursor-pointer hover:text-ink-2">
                  {t('common.errorBoundary.details', { defaultValue: 'Технические детали' })}
                </summary>
                <pre className="mt-2 p-3 rounded-2xl bg-bg text-[10px] text-ink-2 overflow-auto max-h-32 font-mono">
                  {error.message}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-2 w-full mt-3">
              <button
                onClick={onReload}
                className="w-full px-5 py-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-sm shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <AppIcon component={RotateCw} size={16} colorClass="text-white" />
                {t('common.errorBoundary.reload', { defaultValue: 'Обновить страницу' })}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onReset}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
                >
                  {t('common.errorBoundary.reset', { defaultValue: 'Сброс' })}
                </button>
                <button
                  onClick={handleHome}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-teal/30 text-teal-dark font-bold text-sm hover:bg-teal-soft transition-colors flex items-center justify-center gap-1.5"
                >
                  <AppIcon component={Home} size={14} colorClass="text-teal-dark" />
                  {t('common.errorBoundary.home', { defaultValue: 'На главную' })}
                </button>
              </div>
            </div>
          </div>
        </QoldauCard>
      </div>
    </div>
  );
};

export default ErrorBoundary;