/**
 * LoginPage (v0.6.0) — magic-link request screen.
 *
 * Без SMTP — после ввода email показывается `devMagicUrl` (dev-режим).
 * В production нужно подключить email-провайдер и скрыть токен.
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, LogIn } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { PrimaryAction } from '@/components/ui/Primitives';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [devMagicUrl, setDevMagicUrl] = useState<string | null>(null);

  const requestMagicLink = useAuthStore((s) => s.requestMagicLink);

  const submitMagicLink = useCallback(async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { devMagicUrl: url } = await requestMagicLink(email.trim());
      setDevMagicUrl(url);
    } catch {
      // error already in store
    } finally {
      setSubmitting(false);
    }
  }, [email, submitting, requestMagicLink]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    void submitMagicLink();
  }, [submitMagicLink]);

  const handleOpenDevLink = useCallback(() => {
    if (!devMagicUrl) return;
    // Extract token и перейти на /auth/verify
    const token = new URL(devMagicUrl).searchParams.get('token');
    if (token) navigate(`/auth/verify?token=${token}`);
  }, [devMagicUrl, navigate]);

  const error = useAuthStore((s) => s.error);

  return (
    <div className="flex flex-col gap-4 min-h-[70vh]">
      <PageHeader title="Вход" subtitle="Войти в Qoldau" showBack />

      <QoldauCard variant="elevated" padding="lg" className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white">
            <AppIcon component={LogIn} size={24} strokeWidth={2.5} colorClass="text-white" />
          </div>
          <div>
            <p className="text-base font-black text-ink">Войти по email</p>
            <p className="text-xs text-muted">Пришлём magic-link для входа</p>
          </div>
        </div>

        {!devMagicUrl ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-line focus-within:border-teal/60 bg-white">
              <AppIcon component={Mail} size={18} colorClass="text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                required
                disabled={submitting}
                className="flex-1 bg-transparent text-sm text-ink focus:outline-none"
                aria-label="Email"
              />
            </label>

            {error && (
              <p className="text-xs text-coral leading-relaxed">
                {error}. Убедись, что backend запущен (VITE_API_BASE_URL=http://localhost:4000).
              </p>
            )}

            <PrimaryAction
              onClick={submitMagicLink}
              disabled={submitting || !email.trim()}
              icon={<AppIcon component={ArrowRight} size={18} colorClass="text-white" />}
              label={submitting ? 'Отправляем…' : 'Получить magic-link'}
            />

            <p className="text-[10px] text-muted text-center leading-relaxed pt-2">
              В demo-режиме magic-link не отправляется на почту. После нажатия кнопки
              ниже появится ссылка для перехода.
            </p>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-teal/8 border border-teal/20">
              <AppIcon component={CheckCircle2} size={20} colorClass="text-teal shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">Magic-link создан</p>
                <p className="text-xs text-ink-2 leading-relaxed mt-1">
                  В demo-режиме ссылка показана ниже. В production она придёт на {email}.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenDevLink}
              className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white text-sm font-bold active:scale-95 transition-all"
            >
              Открыть magic-link →
            </button>

            <button
              onClick={() => { setDevMagicUrl(null); setEmail(''); }}
              className="text-xs text-muted hover:text-ink-2 text-center py-2"
            >
              Ввести другой email
            </button>
          </div>
        )}
      </QoldauCard>

      <QoldauCard variant="tinted-warm" padding="sm">
        <p className="text-xs text-ink-2 leading-relaxed">
          <span className="font-bold">Demo:</span> backend на <code className="px-1 bg-warm-2 rounded">http://localhost:4000</code>.
          Без него auth работать не будет. Для production подключи SMTP/Resend.
        </p>
      </QoldauCard>
    </div>
  );
};