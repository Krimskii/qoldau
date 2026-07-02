/**
 * VerifyPage (v0.6.0) — magic-link verify screen.
 * Route: /auth/verify?token=...
 */
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { PrimaryAction } from '@/components/ui/Primitives';
import { useAuthStore } from '@/store/useAuthStore';

export const VerifyPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const verify = useAuthStore((s) => s.verifyAndLogin);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = params.get('token') ?? '';

  const run = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Токен не передан');
      return;
    }
    try {
      await verify(token);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'verify failed');
    }
  }, [token, verify]);

  useEffect(() => { void run(); }, [run]);

  return (
    <div className="flex flex-col gap-4 min-h-[70vh]">
      <PageHeader title="Подтверждение" subtitle="Завершаем вход" showBack />

      <QoldauCard variant="elevated" padding="lg" className="w-full">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 size={42} className="text-teal animate-spin" />
            <p className="text-sm text-ink-2">Проверяем токен…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white">
              <AppIcon component={CheckCircle2} size={36} colorClass="text-white" />
            </div>
            <p className="text-base font-black text-ink">Готово!</p>
            <p className="text-sm text-ink-2 text-center">Вы вошли в Qoldau.</p>
            <PrimaryAction
              onClick={() => navigate('/overview')}
              label="Перейти к приложению"
            />
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-coral/15 flex items-center justify-center">
              <AppIcon component={XCircle} size={36} colorClass="text-coral" />
            </div>
            <p className="text-base font-black text-ink">Не удалось войти</p>
            <p className="text-sm text-ink-2 text-center">{errorMsg ?? 'Токен невалиден или истёк'}.</p>
            <PrimaryAction
              onClick={() => navigate('/auth/login')}
              label="Попробовать снова"
            />
          </div>
        )}
      </QoldauCard>
    </div>
  );
};