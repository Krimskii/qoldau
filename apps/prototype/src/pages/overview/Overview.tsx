import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { useRoleStore } from '@/store/useRoleStore';
import { UserRole } from '@/types/qoldau';

const methods = [
  'AAC',
  'Visual Supports',
  'FCT',
  'ABC',
  'Prompting',
  'Task Analysis',
  'Self-management',
  'Sensory Support',
  'Social Stories',
  'Reinforcement',
];

const flowSteps = [
  { label: 'Ребёнок даёт сигнал', icon: '👋' },
  { label: 'Сопровождающий говорит', icon: '💬' },
  { label: 'STT → текст', icon: '🎤' },
  { label: 'AI → структура', icon: '🤖' },
  { label: 'Взрослый подтверждает', icon: '✓' },
  { label: 'Единая лента событий', icon: '📋' },
];

const roles = [
  { role: 'Родитель' as UserRole, icon: '👩', desc: 'Голосовые наблюдения, подтверждение событий', path: '/parent/home' },
  { role: 'Ребёнок' as UserRole, icon: '👦', desc: 'AAC карточки, голосовой ввод, любимые', path: '/child/home' },
  { role: 'Тьютор' as UserRole, icon: '👨‍🏫', desc: 'Наблюдения, отчёты родителям', path: '/tutor/home' },
  { role: 'Специалист' as UserRole, icon: '🧑‍⚕️', desc: 'ABC-анализ, паттерны, отчёты', path: '/specialist/dashboard' },
];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useRoleStore();

  const handleRoleClick = (role: UserRole, path: string) => {
    setRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-bg pb-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E9FBF7] to-white border border-mint shadow-card-soft flex items-center justify-center">
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <path d="M24 39s-14-8.2-18-18.2C2.6 12.4 11.8 6.2 18.5 12.6L24 18l5.5-5.4c6.7-6.4 15.9-.2 12.5 8.2C38 30.8 24 39 24 39Z" stroke="#075E59" strokeWidth="3" strokeLinejoin="round" />
                <path d="M24 18v18" stroke="#075E59" strokeWidth="3" opacity="0.65" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#0D1B3E]">Qoldau AI</h1>
              <p className="text-muted">Voice-first платформа сопровождения</p>
            </div>
          </div>
          <RoleSwitcher />
        </div>

        <p className="text-lg text-ink-2 max-w-3xl">
          Voice-first AI-платформа сопровождения детей с РАС, родителей, тьюторов и специалистов.
          Ребёнок даёт сигнал → сопровождающий говорит → AI структурирует → система помогает видеть закономерности.
        </p>
      </header>

      {/* Main Flow */}
      <section className="max-w-6xl mx-auto px-8 mb-10">
        <div className="bg-white/80 backdrop-blur border border-line rounded-3xl p-8 shadow-card">
          <h2 className="text-xl font-bold text-teal-dark mb-6">Главная цепочка</h2>
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            {flowSteps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center min-w-[100px]">
                  <span className="text-4xl mb-2">{step.icon}</span>
                  <span className="text-xs font-bold text-ink">{step.label}</span>
                </div>
                {i < flowSteps.length - 1 && (
                  <span className="text-2xl text-muted flex-shrink-0">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-8 mb-10">
        <h2 className="text-xl font-bold text-teal-dark mb-4">Роли</h2>
        <div className="grid grid-cols-4 gap-4">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRoleClick(r.role, r.path)}
              className="bg-white border border-line rounded-2xl p-5 text-left hover:shadow-card-soft transition-all hover:border-teal"
            >
              <span className="text-3xl mb-2 block">{r.icon}</span>
              <h3 className="font-bold text-ink mb-1">{r.role}</h3>
              <p className="text-xs text-muted">{r.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Methods */}
      <section className="max-w-6xl mx-auto px-8 mb-10">
        <div className="bg-white/80 backdrop-blur border border-line rounded-3xl p-8 shadow-card-soft">
          <h2 className="text-xl font-bold text-teal-dark mb-4">Заложенные методики</h2>
          <div className="flex flex-wrap gap-2">
            {methods.map((m) => (
              <span key={m} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-line rounded-xl text-sm font-bold text-ink-2">
                <span className="w-2 h-2 rounded-full bg-teal" />
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* MVP / Future */}
      <section className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#EAF9F6] to-[#F6FFFC] border border-[#C7ECE5] rounded-3xl p-6">
            <h3 className="font-bold text-teal-dark mb-3">MVP (Prototype)</h3>
            <ul className="text-sm text-ink-2 space-y-1.5">
              <li>✓ Voice-first ввод взрослого</li>
              <li>✓ STT API (mock)</li>
              <li>✓ Event Timeline</li>
              <li>✓ AAC карточки</li>
              <li>✓ Питание / туалет / сон</li>
              <li>✓ AI-summary (mock)</li>
              <li>✓ Human confirmation</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#F5F0FF] to-[#F0EBFF] border border-[#DDD1FF] rounded-3xl p-6">
            <h3 className="font-bold text-purple mb-3">Фаза 2</h3>
            <ul className="text-sm text-ink-2 space-y-1.5">
              <li>○ Распознавание звуков ребёнка</li>
              <li>○ Wearable устройство</li>
              <li>○ Геозоны</li>
              <li>○ Домашний хаб</li>
              <li>○ Персональные AI-модели</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-8 mt-10">
        <div className="bg-yellow-soft border border-yellow rounded-2xl p-4 text-sm text-ink-2">
          <strong>Важно:</strong> Qoldau AI не является медицинским устройством, не диагностирует, 
          не лечит и не заменяет специалиста. Все AI-выводы формулируются как гипотезы: 
          «Похоже…», «Возможно…», «Нужно подтвердить.»
        </div>
      </section>
    </div>
  );
};
