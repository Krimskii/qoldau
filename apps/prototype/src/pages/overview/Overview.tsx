/**
 * Overview (v0.6.2) — landing/entry page.
 *
 * Это стартовая страница приложения (`/` → `/overview`).
 *
 * Содержит:
 * - Hero с CTA «Запустить демо» (guided tour через useDemoStore).
 * - 3 role cards: Родитель, Ребёнок, Тьютор (специалист-маршрут остаётся
 *   в коде для deep-link, но в landing не показывается).
 * - «Главная цепочка» — 5 шагов flow (Ребёнок → Взрослый → AI → Подтверждение → Timeline).
 * - «Что входит в MVP» + Phase 2.
 * - Disclaimer «Это наблюдение, не диагноз».
 * - Safe-area-inset-top padding (status bar на смартфонах).
 * - Кнопки Войти/Выйти (auth, v0.6.0).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Brain,
  MessageSquare,
  FileText,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useRoleStore } from '@/store/useRoleStore';
import { useDemoStore } from '@/store/useDemoStore';
import { useAuthStore } from '@/store/useAuthStore';
import { HealthCheckBanner } from '@/components/ui/HealthCheckBanner';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { DemoControlsCard } from '@/components/ui/DemoControlsCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { UserRole } from '@/types/qoldau';

interface RoleDef {
  role: UserRole;
  emoji: string;
  bg: string;
  homePath: string;
}

const ROLES: RoleDef[] = [
  { role: 'parent', emoji: '👩', bg: 'bg-teal-soft', homePath: '/parent/home' },
  { role: 'child', emoji: '👦', bg: 'bg-coral-soft', homePath: '/child/home' },
  { role: 'tutor', emoji: '👨‍🏫', bg: 'bg-purple-soft', homePath: '/tutor/home' },
];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setRole = useRoleStore((s) => s.setRole);
  const startDemo = useDemoStore((s) => s.startDemo);
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleStartDemo = () => {
    setRole('parent');
    startDemo();
    navigate('/parent/home');
  };

  const handleRole = (def: RoleDef) => {
    setRole(def.role);
    navigate(def.homePath);
  };

  const handleLogin = () => navigate('/auth/login');

  const safeTopStyle: React.CSSProperties = {
    paddingTop: 'max(env(safe-area-inset-top), 12px)',
  };

  const FLOW_STEPS = [
    { emoji: '👋', key: 'flowStep1' },
    { emoji: '💬', key: 'flowStep2' },
    { emoji: '🤖', key: 'flowStep3' },
    { emoji: '✓', key: 'flowStep4' },
    { emoji: '📋', key: 'flowStep5' },
  ] as const;

  return (
    <div className="min-h-screen bg-bg" style={safeTopStyle}>
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-line-soft">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-card">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path
                  d="M12 21s-7-4.5-9-9c-1.5-3.4 0.8-7.4 4.4-7.4 1.9 0 3.6 1.1 4.6 2.7 1-1.6 2.7-2.7 4.6-2.7 3.6 0 5.9 4 4.4 7.4-2 4.5-9 9-9 9Z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-black text-ink leading-none">{t('app.name')}</h1>
              <p className="text-xs text-muted leading-none mt-0.5">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {authStatus === 'authenticated' && user ? (
              <>
                <span className="text-xs text-muted hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-full bg-coral/8 border border-coral/20 text-xs font-bold text-coral hover:bg-coral/15 transition-all"
                >
                  {t('auth.logout')}
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-3 py-1.5 rounded-full bg-teal-soft border border-teal/20 text-xs font-bold text-teal-dark hover:bg-teal/15 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('auth.login')}
              </button>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-soft text-teal-dark text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Demo MVP · v0.6.6
          </span>
          <h1 className="mt-5 text-5xl md:text-6xl font-black text-ink leading-[1.05] tracking-tight">
            {t('landing.heroTitle1')}<br />
            <span className="text-teal">{t('landing.heroTitle2')}</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleStartDemo}
            className="px-8 py-4 bg-gradient-to-r from-teal to-teal-dark text-white rounded-2xl font-bold text-lg shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            {t('landing.startDemo')}
          </button>
          <p className="text-xs text-muted">{t('landing.demoHint')}</p>
        </div>
      </section>

      {/* System health + demo controls */}
      <section className="max-w-[1100px] mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HealthCheckBanner />
          <DemoControlsCard />
        </div>
      </section>

      {/* Main flow */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="bg-white border border-line rounded-3xl shadow-card p-8 md:p-10">
          <h2 className="text-2xl font-black text-ink text-center mb-8">
            {t('landing.flowTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-3">{step.emoji}</div>
                <p className="text-sm font-bold text-ink leading-tight">
                  {t(`landing.${step.key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <h2 className="text-3xl font-black text-ink text-center mb-3">
          {t('landing.rolesTitle')}
        </h2>
        <p className="text-sm text-muted text-center mb-8">
          {t('landing.rolesSubtitle')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[820px] mx-auto">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRole(r)}
              className={`${r.bg} border border-line rounded-3xl p-6 text-left hover:shadow-card-soft transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-5xl mb-3 block">{r.emoji}</span>
              <h3 className="text-lg font-black text-ink mb-1">
                {t(`landing.role${r.role.charAt(0).toUpperCase() + r.role.slice(1)}`)}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t(`landing.role${r.role.charAt(0).toUpperCase() + r.role.slice(1)}Desc`)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-teal-soft flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-teal" />
            </div>
            <h3 className="text-base font-black text-ink mb-2">{t('landing.featureVoice')}</h3>
            <p className="text-sm text-muted leading-relaxed">{t('landing.featureVoiceDesc')}</p>
          </div>
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-blue-soft flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-blue" />
            </div>
            <h3 className="text-base font-black text-ink mb-2">{t('landing.featureTimeline')}</h3>
            <p className="text-sm text-muted leading-relaxed">{t('landing.featureTimelineDesc')}</p>
          </div>
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-purple-soft flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple" />
            </div>
            <h3 className="text-base font-black text-ink mb-2">{t('landing.featureAi')}</h3>
            <p className="text-sm text-muted leading-relaxed">{t('landing.featureAiDesc')}</p>
          </div>
        </div>
      </section>

      {/* MVP scope */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <h3 className="font-black text-ink mb-3">{t('landing.mvpTitle')}</h3>
            <ul className="text-sm text-ink-2 space-y-2">
              <li>✓ Voice-first ввод</li>
              <li>✓ Event Timeline</li>
              <li>✓ AAC карточки</li>
              <li>✓ Питание / вода / туалет / сон</li>
              <li>✓ AI-наблюдения (Claude / mock)</li>
              <li>✓ Подтверждение человеком</li>
            </ul>
          </div>
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <h3 className="font-black text-ink mb-3">{t('landing.phase2Title')}</h3>
            <ul className="text-sm text-muted space-y-2">
              <li>○ Распознавание звуков ребёнка</li>
              <li>○ Wearable</li>
              <li>○ Геозоны</li>
              <li>○ Домашний хаб</li>
              <li>○ Персональные AI-модели</li>
              <li>○ Email-уведомления (magic-link)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="bg-yellow-soft border border-yellow/30 rounded-3xl p-5 text-sm text-ink-2 leading-relaxed">
          <strong className="text-ink">Важно.</strong> {t('landing.disclaimer')}
        </div>
      </section>
    </div>
  );
};