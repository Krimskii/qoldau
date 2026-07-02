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
import type { UserRole } from '@/types/qoldau';

interface RoleDef {
  role: UserRole;
  label: string;
  description: string;
  emoji: string;
  bg: string;
  homePath: string;
}

const ROLES: RoleDef[] = [
  {
    role: 'parent',
    label: 'Родитель',
    description: 'Голосовые наблюдения, подтверждение событий',
    emoji: '👩',
    bg: 'bg-teal-soft',
    homePath: '/parent/home',
  },
  {
    role: 'child',
    label: 'Ребёнок',
    description: 'AAC карточки, голосовой ввод, любимые',
    emoji: '👦',
    bg: 'bg-coral-soft',
    homePath: '/child/home',
  },
  {
    role: 'tutor',
    label: 'Тьютор',
    description: 'Наблюдения, отчёты родителям',
    emoji: '👨‍🏫',
    bg: 'bg-purple-soft',
    homePath: '/tutor/home',
  },
];

const FLOW_STEPS = [
  { emoji: '👋', label: 'Ребёнок даёт сигнал' },
  { emoji: '💬', label: 'Взрослый говорит' },
  { emoji: '🤖', label: 'AI структурирует' },
  { emoji: '✓', label: 'Взрослый подтверждает' },
  { emoji: '📋', label: 'Event Timeline' },
];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
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

  // safe-area top padding (status bar)
  const safeTopStyle: React.CSSProperties = {
    paddingTop: 'max(env(safe-area-inset-top), 0px)',
  };

  return (
    <div className="min-h-screen bg-bg" style={safeTopStyle}>
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-line-soft sticky top-0 z-30">
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
              <h1 className="text-base font-black text-ink leading-none">Qoldau AI</h1>
              <p className="text-xs text-muted leading-none mt-0.5">Voice-first сопровождение</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {authStatus === 'authenticated' && user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-full bg-coral/8 border border-coral/20 text-xs font-bold text-coral hover:bg-coral/15 transition-all"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-3 py-1.5 rounded-full bg-teal-soft border border-teal/20 text-xs font-bold text-teal-dark hover:bg-teal/15 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-soft text-teal-dark text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Demo MVP · v0.6.2
          </span>
          <h1 className="mt-5 text-5xl md:text-6xl font-black text-ink leading-[1.05] tracking-tight">
            Ребёнок дал сигнал —<br />
            <span className="text-teal">система услышала</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Voice-first платформа сопровождения детей с РАС. Ребёнок даёт сигнал →
            взрослый говорит → AI структурирует → система помогает видеть повторяющиеся ситуации и реакции.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleStartDemo}
            className="px-8 py-4 bg-gradient-to-r from-teal to-teal-dark text-white rounded-2xl font-bold text-lg shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Запустить демо
          </button>
          <p className="text-xs text-muted">
            Пошаговый гид по 18 экранам
          </p>
        </div>
      </section>

      {/* Main flow */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="bg-white border border-line rounded-3xl shadow-card p-8 md:p-10">
          <h2 className="text-2xl font-black text-ink text-center mb-8">
            Главная цепочка
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-3">{step.emoji}</div>
                <p className="text-sm font-bold text-ink leading-tight">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <h2 className="text-3xl font-black text-ink text-center mb-3">
          Три роли, один ребёнок
        </h2>
        <p className="text-sm text-muted text-center mb-8">
          Выберите, кто сейчас с системой
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[820px] mx-auto">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRole(r)}
              className={`${r.bg} border border-line rounded-3xl p-6 text-left hover:shadow-card-soft transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-5xl mb-3 block">{r.emoji}</span>
              <h3 className="text-lg font-black text-ink mb-1">{r.label}</h3>
              <p className="text-sm text-muted leading-relaxed">{r.description}</p>
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
            <h3 className="text-base font-black text-ink mb-2">Voice-first</h3>
            <p className="text-sm text-muted leading-relaxed">
              Голосовые наблюдения за 30 секунд — без клавиатуры
            </p>
          </div>
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-blue-soft flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-blue" />
            </div>
            <h3 className="text-base font-black text-ink mb-2">Event Timeline</h3>
            <p className="text-sm text-muted leading-relaxed">
              Единая лента событий от ребёнка, тьютора и специалиста
            </p>
          </div>
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-purple-soft flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple" />
            </div>
            <h3 className="text-base font-black text-ink mb-2">AI-наблюдения</h3>
            <p className="text-sm text-muted leading-relaxed">
              Гипотезы и паттерны. Не диагноз — только подсказки
            </p>
          </div>
        </div>
      </section>

      {/* MVP scope */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-line rounded-3xl p-6 shadow-card-soft">
            <h3 className="font-black text-ink mb-3">Что входит в MVP</h3>
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
            <h3 className="font-black text-ink mb-3">Phase 2</h3>
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
          <strong className="text-ink">Важно.</strong> Qoldau AI не является медицинским устройством, не диагностирует, не лечит и не заменяет специалиста. Все AI-выводы формулируются как гипотезы: «Похоже…», «Возможно…», «Нужно подтвердить.» Можно обсудить со специалистом.
        </div>
      </section>
    </div>
  );
};