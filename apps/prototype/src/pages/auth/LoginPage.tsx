/**
 * LoginPage (v0.6.0 → v1.5+ E1) — magic-link request screen.
 *
 * v1.5+ E1 honest state:
 * - devMagicUrl показывается ТОЛЬКО в DEV-режиме (`import.meta.env.DEV`).
 *   В production — пользователь видит нейтральное «Magic-link отправлен на {email}».
 * - Hardcoded `http://localhost:4000` НЕ показывается в user-facing ошибке.
 * - Dev-info banner про backend — только в DEV-режиме.
 * - Все user-facing строки локализованы в `auth.*` (ru/kk/en).
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, CheckCircle2, LogIn } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { PrimaryAction } from '@/components/ui/Primitives';
import { useAuthStore } from '@/store/useAuthStore';
import { BASE_URL } from '@/api/client';

const IS_DEV = import.meta.env.DEV;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [devMagicUrl, setDevMagicUrl] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const requestMagicLink = useAuthStore((s) => s.requestMagicLink);
  const storeError = useAuthStore((s) => s.error);

  const submitMagicLink = useCallback(async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { devMagicUrl: url } = await requestMagicLink(email.trim());
      // Dev-only: показываем токен в DEV-режиме для удобства разработки.
      // В production — НЕ показываем токен, только "отправлено".
      if (IS_DEV && url) {
        setDevMagicUrl(url);
      }
      setSentEmail(email.trim());
    } catch (err) {
      // Ошибка уже в сторе (storeError). Dev-only подробности в console.
      if (IS_DEV) {
        // eslint-disable-next-line no-console
        console.error('[LoginPage] submitMagicLink failed:', err);
      }
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
    const token = new URL(devMagicUrl).searchParams.get('token');
    if (token) navigate(`/auth/verify?token=${token}`);
  }, [devMagicUrl, navigate]);

  const handleReset = useCallback(() => {
    setDevMagicUrl(null);
    setSentEmail(null);
    setEmail('');
  }, []);

  // Показывать блок «magic-link отправлен» если:
  // - dev-режим + devMagicUrl есть (показываем токен), или
  // - sentEmail есть (production-safe сообщение)
  const showSentBlock = sentEmail !== null;

  return (
    <div className="flex flex-col gap-4 min-h-[70vh]">
      <PageHeader title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')} showBack />

      <QoldauCard variant="elevated" padding="lg" className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white">
            <AppIcon component={LogIn} size={24} strokeWidth={2.5} colorClass="text-white" />
          </div>
          <div>
            <p className="text-base font-black text-ink">{t('auth.loginByEmail')}</p>
            <p className="text-xs text-muted">{t('auth.loginMagicHint')}</p>
          </div>
        </div>

        {!showSentBlock ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 border-line focus-within:border-teal/60 bg-white">
              <AppIcon component={Mail} size={18} colorClass="text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.loginEmailPlaceholder')}
                required
                disabled={submitting}
                className="flex-1 bg-transparent text-sm text-ink focus:outline-none"
                aria-label={t('auth.loginEmail')}
              />
            </label>

            {storeError && (
              <p className="text-xs text-coral leading-relaxed" role="alert">
                {t('auth.loginErrorGeneric')}
                {IS_DEV && (
                  <span className="block text-muted italic mt-0.5">
                    {t('auth.devErrorHint')}
                  </span>
                )}
              </p>
            )}

            <PrimaryAction
              onClick={submitMagicLink}
              disabled={submitting || !email.trim()}
              icon={<AppIcon component={ArrowRight} size={18} colorClass="text-white" />}
              label={submitting ? t('auth.loginSubmitting') : t('auth.loginSubmit')}
            />

            {IS_DEV && (
              <p className="text-[10px] text-muted text-center leading-relaxed pt-2">
                {t('auth.magicLinkHintSentDev')}
              </p>
            )}
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-teal-soft border border-teal/20">
              <AppIcon component={CheckCircle2} size={20} colorClass="text-teal shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">{t('auth.magicLinkCreated')}</p>
                <p className="text-xs text-ink-2 leading-relaxed mt-1">
                  {t('auth.magicLinkHintSent', { email: sentEmail })}
                </p>
              </div>
            </div>

            {IS_DEV && devMagicUrl && (
              <button
                onClick={handleOpenDevLink}
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white text-sm font-bold active:scale-95 transition-all"
              >
                {t('auth.openDevMagicLink')}
              </button>
            )}

            <button
              onClick={handleReset}
              className="text-xs text-muted hover:text-ink-2 text-center py-2"
            >
              {t('auth.tryAnotherEmail')}
            </button>
          </div>
        )}
      </QoldauCard>

      {/* Dev-info banner — ТОЛЬКО в DEV. */}
      {IS_DEV && (
        <QoldauCard variant="tinted-warm" padding="sm">
          <p className="text-xs text-ink-2 leading-relaxed">
            <span className="font-bold">{t('auth.devBannerLabel')}</span> backend на{' '}
            <code className="px-1 bg-warm-2 rounded">{BASE_URL || 'http://localhost:4000'}</code>.
            {t('auth.devBannerHint')}
          </p>
        </QoldauCard>
      )}
    </div>
  );
};