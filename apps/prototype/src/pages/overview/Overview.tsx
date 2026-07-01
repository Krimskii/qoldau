import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Brain,
  MessageSquare,
  FileText,
  Sparkles,
} from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { DemoControls } from '@/components/layout/DemoControls';
import { useRoleStore } from '@/store/useRoleStore';
import { useDemoStore } from '@/store/useDemoStore';
import { UserRole } from '@/types/qoldau';

const ROLES: Array<{
  role: UserRole;
  label: string;
  description: string;
  emoji: string;
  bg: string;
}> = [
  { role: 'parent', label: 'Родитель', description: 'Голосовые наблюдения, подтверждение событий', emoji: '👩', bg: 'bg-teal-soft' },
  { role: 'child', label: 'Ребёнок', description: 'AAC карточки, голосовой ввод, любимые', emoji: '👦', bg: 'bg-coral-soft' },
  { role: 'tutor', label: 'Тьютор', description: 'Наблюдения, отчёты родителям', emoji: '👨‍🏫', bg: 'bg-purple-soft' },
  { role: 'specialist', label: 'Специалист', description: 'ABC-анализ, паттерны, отчёты', emoji: '🧑‍⚕️', bg: 'bg-blue-soft' },
];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useRoleStore();
  const { startDemo } = useDemoStore();

  const handleStartDemo = () => {
    startDemo();
    navigate('/parent/home');
  };

  const handleRole = (role: UserRole, path: string) => {
    setRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-bg">
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
          <RoleSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-soft text-teal-dark text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Demo MVP · v0.3.4
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
        </div>
      </section>

      {/* Main flow */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="bg-white border border-line rounded-3xl shadow-card p-8 md:p-10">
          <h2 className="text-2xl font-black text-ink text-center mb-8">
            Главная цепочка
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { emoji: '👋', label: 'Ребёнок даёт сигнал' },
              { emoji: '💬', label: 'Взрослый говорит' },
              { emoji: '🤖', label: 'AI структурирует' },
              { emoji: '✓', label: 'Взрослый подтверждает' },
              { emoji: '📋', label: 'Event Timeline' },
            ].map((step, i) => (
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
        <h2 className="text-3xl font-black text-ink text-center mb-8">
          Четыре роли, один ребёнок
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() =>
                handleRole(
                  r.role,
                  r.role === 'parent'
                    ? '/parent/home'
                    : r.role === 'child'
                      ? '/child/home'
                      : r.role === 'tutor'
                        ? '/tutor/home'
                        : '/specialist/dashboard'
                )
              }
              className={`${r.bg} border border-line rounded-3xl p-5 text-left hover:shadow-card-soft transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-4xl mb-3 block">{r.emoji}</span>
              <h3 className="text-base font-black text-ink mb-1">{r.label}</h3>
              <p className="text-xs text-muted leading-relaxed">{r.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <MessageSquare className="w-5 h-5 text-teal" />,
              title: 'Voice-first',
              text: 'Голосовые наблюдения за 30 секунд — без клавиатуры',
              bg: 'bg-teal-soft',
            },
            {
              icon: <FileText className="w-5 h-5 text-blue" />,
              title: 'Event Timeline',
              text: 'Единая лента событий от ребёнка, тьютора и специалиста',
              bg: 'bg-blue-soft',
            },
            {
              icon: <Brain className="w-5 h-5 text-purple" />,
              title: 'AI-наблюдения',
              text: 'Гипотезы и паттерны. Не диагноз — только подсказки',
              bg: 'bg-purple-soft',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white border border-line rounded-3xl p-6 shadow-card-soft"
            >
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-3`}>
                {f.icon}
              </div>
              <h3 className="text-base font-black text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo controls — сброс */}
      <section className="max-w-[1100px] mx-auto px-6 pb-8">
        <DemoControls variant="card" />
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
              <li>✓ AI-наблюдения (mock)</li>
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
              <li>○ Real STT / LLM</li>
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