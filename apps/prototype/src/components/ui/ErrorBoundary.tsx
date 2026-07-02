/**
 * ErrorBoundary (v0.6.3) — top-level React error boundary.
 *
 * Ловит ошибки рендера ниже по дереву, показывает дружелюбный экран
 * с reset-кнопкой (reload / reset stores).
 */
import React from 'react';
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

  private handleHome = () => {
    window.location.href = '/#/overview';
  };

  private handleReload = () => {
    window.location.reload();
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
          <div className="w-full max-w-[420px]">
            <QoldauCard variant="elevated" padding="lg">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-coral/15 flex items-center justify-center">
                  <AppIcon component={AlertTriangle} size={32} colorClass="text-coral" />
                </div>
                <h1 className="text-xl font-black text-ink">Что-то сломалось</h1>
                <p className="text-sm text-muted leading-relaxed">
                  Произошла ошибка в приложении. Попробуйте обновить страницу или вернуться на главную.
                </p>

                {this.state.error && (
                  <details className="w-full text-left mt-2">
                    <summary className="text-xs text-muted cursor-pointer hover:text-ink-2">
                      Технические детали
                    </summary>
                    <pre className="mt-2 p-3 rounded-2xl bg-bg text-[10px] text-ink-2 overflow-auto max-h-32 font-mono">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}

                <div className="flex flex-col gap-2 w-full mt-3">
                  <button
                    onClick={this.handleReload}
                    className="w-full px-5 py-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-sm shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <AppIcon component={RotateCw} size={16} colorClass="text-white" />
                    Обновить страницу
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={this.handleReset}
                      className="flex-1 px-4 py-3 rounded-2xl border-2 border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
                    >
                      Сброс
                    </button>
                    <button
                      onClick={this.handleHome}
                      className="flex-1 px-4 py-3 rounded-2xl border-2 border-teal/30 text-teal-dark font-bold text-sm hover:bg-teal-soft transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AppIcon component={Home} size={14} colorClass="text-teal-dark" />
                      На главную
                    </button>
                  </div>
                </div>
              </div>
            </QoldauCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}