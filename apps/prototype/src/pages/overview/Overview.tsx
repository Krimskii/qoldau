import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Users, Brain, MessageSquare, FileText, Calendar } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { DemoIndicator } from '@/components/layout/DemoIndicator';
import { useRoleStore } from '@/store/useRoleStore';
import { useDemoStore } from '@/store/useDemoStore';
import { UserRole } from '@/types/qoldau';

const flowSteps = [
  { label: 'Ребёнок даёт сигнал', icon: '👋' },
  { label: 'Взрослый говорит', icon: '💬' },
  { label: 'AI структурирует', icon: '🤖' },
  { label: 'Взрослый подтверждает', icon: '✓' },
  { label: 'Event Timeline', icon: '📋' },
];

const roles = [
  { 
    role: 'Родитель' as UserRole, 
    icon: '👩', 
    desc: 'Голосовые наблюдения, подтверждение событий',
    path: '/parent/home',
    color: 'from-teal to-teal-dark',
  },
  { 
    role: 'Ребёнок' as UserRole, 
    icon: '👦', 
    desc: 'AAC карточки, голосовой ввод',
    path: '/child/home',
    color: 'from-coral to-orange',
  },
  { 
    role: 'Тьютор' as UserRole, 
    icon: '👨‍🏫', 
    desc: 'Наблюдения, отчёты родителям',
    path: '/tutor/home',
    color: 'from-purple to-violet',
  },
  { 
    role: 'Специалист' as UserRole, 
    icon: '🧑‍⚕️', 
    desc: 'ABC-анализ, паттерны, отчёты',
    path: '/specialist/dashboard',
    color: 'from-blue to-cyan',
  },
];

const whoSeesWhat = [
  { role: 'Родитель', icon: '👩', items: ['Быстрый голосовой ввод', 'Event Timeline ребёнка', 'Уведомления от тьютора', 'Профиль коммуникации'] },
  { role: 'Ребёнок', icon: '👦', items: ['Крупные AAC карточки', 'Голосовой ввод', 'Любимые мультики/еда', 'Сборщик фраз'] },
  { role: 'Тьютор', icon: '👨‍🏫', items: ['Подсказки по ребёнку', 'Голосовые наблюдения', 'Отчёты родителям', 'Паттерны поведения'] },
  { role: 'Специалист', icon: '🧑‍⚕️', items: ['ABC-анализ', 'Коммуникационный профиль', 'KPI и паттерны', 'Связь событий'] },
];

const mvpFeatures = [
  { icon: <MessageSquare className="w-5 h-5" />, text: 'Voice-first ввод наблюдений' },
  { icon: <Calendar className="w-5 h-5" />, text: 'Event Timeline — единая лента событий' },
  { icon: <Brain className="w-5 h-5" />, text: 'AI-структурирование (mock)' },
  { icon: <Users className="w-5 h-5" />, text: 'AAC карточки для ребёнка' },
  { icon: <FileText className="w-5 h-5" />, text: 'Отчёты для родителей и тьюторов' },
];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useRoleStore();
  const { startDemo } = useDemoStore();

  const handleRoleClick = (role: UserRole, path: string) => {
    setRole(role);
    navigate(path);
  };

  const handleStartDemo = () => {
    startDemo();
    navigate('/parent/home');
  };

  return (
    <div className="min-h-screen bg-bg pb-32">
      <DemoIndicator />
      
      {/* Header */}
      <header className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#E9FBF7] to-white border-2 border-mint shadow-card-soft flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                <path d="M24 39s-14-8.2-18-18.2C2.6 12.4 11.8 6.2 18.5 12.6L24 18l5.5-5.4c6.7-6.4 15.9-.2 12.5 8.2C38 30.8 24 39 24 39Z" stroke="#075E59" strokeWidth="3" strokeLinejoin="round" />
                <path d="M24 18v18" stroke="#075E59" strokeWidth="3" opacity="0.65" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-[#0D1B3E]">Qoldau AI</h1>
              <p className="text-lg text-muted mt-1">Voice-first платформа сопровождения</p>
            </div>
          </div>
          <RoleSwitcher />
        </div>

        <p className="text-xl text-ink-2 max-w-3xl leading-relaxed">
          AI-платформа для сопровождения детей с РАС. Ребёнок даёт сигнал → взрослый говорит → AI структурирует → система помогает видеть закономерности.
        </p>

        {/* Demo Button */}
        <button
          onClick={handleStartDemo}
          className="mt-8 flex items-center gap-3 bg-gradient-to-r from-teal to-teal-dark text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-6 h-6" />
          Запустить демо (10 мин)
        </button>
      </header>

      {/* Main Flow */}
      <section className="max-w-6xl mx-auto px-8 mb-12">
        <div className="bg-white border-2 border-line rounded-3xl p-10 shadow-card">
          <h2 className="text-2xl font-bold text-teal-dark mb-8 text-center">Главная цепочка продукта</h2>
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-4">
            {flowSteps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center min-w-[120px]">
                  <span className="text-5xl mb-3">{step.icon}</span>
                  <span className="text-sm font-bold text-ink">{step.label}</span>
                </div>
                {i < flowSteps.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-muted flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="max-w-6xl mx-auto px-8 mb-12">
        <h2 className="text-2xl font-bold text-teal-dark mb-6">Для кого продукт</h2>
        <div className="grid grid-cols-4 gap-5">
          {whoSeesWhat.map((r) => (
            <div key={r.role} className="bg-white border-2 border-line rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{r.icon}</span>
                <span className="font-bold text-lg">{r.role}</span>
              </div>
              <ul className="space-y-2">
                {r.items.map((item, i) => (
                  <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
                    <span className="text-teal mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Selection */}
      <section className="max-w-6xl mx-auto px-8 mb-12">
        <h2 className="text-2xl font-bold text-teal-dark mb-6">Выберите роль</h2>
        <div className="grid grid-cols-4 gap-5">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRoleClick(r.role, r.path)}
              className={`bg-gradient-to-br ${r.color} text-white rounded-2xl p-6 text-left hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-4xl mb-3 block">{r.icon}</span>
              <h3 className="font-bold text-lg mb-1">{r.role}</h3>
              <p className="text-sm opacity-90">{r.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Why Event Timeline */}
      <section className="max-w-6xl mx-auto px-8 mb-12">
        <div className="bg-gradient-to-r from-[#EAF9F6] to-[#F0FBF9] border-2 border-mint rounded-3xl p-10">
          <h2 className="text-2xl font-bold text-teal-dark mb-4">Почему Event Timeline — ядро продукта</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-ink-2 leading-relaxed mb-4">
                Все события — голосовые наблюдения, AAC карточки, действия тьютора — собираются в единую ленту. Это позволяет:
              </p>
              <ul className="space-y-2 text-ink-2">
                <li>• Видеть паттерны поведения</li>
                <li>• Связывать сигналы ребёнка с ситуациями</li>
                <li>• Строить коммуникационный профиль</li>
                <li>• Формировать отчёты для специалистов</li>
              </ul>
            </div>
            <div>
              <p className="text-ink-2 leading-relaxed mb-4">
                Event Timeline не заменяет дневники — он объединяет все источники данных в одно целое.
              </p>
              <p className="text-sm text-muted italic">
                «Похоже, сегодня несколько событий связаны с шумом. Это наблюдение, не диагноз.»
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MVP Features */}
      <section className="max-w-6xl mx-auto px-8 mb-12">
        <h2 className="text-2xl font-bold text-teal-dark mb-6">Что в MVP</h2>
        <div className="grid grid-cols-2 gap-4">
          {mvpFeatures.map((f, i) => (
            <div key={i} className="bg-white border-2 border-line rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal">
                {f.icon}
              </div>
              <span className="font-medium text-ink">{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Phase 2 */}
      <section className="max-w-6xl mx-auto px-8 mb-12">
        <div className="bg-gradient-to-br from-[#F5F0FF] to-[#F8F5FF] border-2 border-purple/20 rounded-3xl p-10">
          <h2 className="text-2xl font-bold text-purple mb-4">Что будет в Phase 2</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Распознавание звуков ребёнка',
              'Wearable устройство',
              'Геозоны и напоминания',
              'Персональные AI-модели',
              'Интеграция с календарём',
              'Push-уведомления',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-purple" />
                <span className="text-ink-2">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-8">
        <div className="bg-yellow-soft border-2 border-yellow/30 rounded-2xl p-6">
          <h3 className="font-bold text-ink mb-2">Важно</h3>
          <p className="text-sm text-ink-2">
            Qoldau AI не является медицинским устройством, не диагностирует, не лечит и не заменяет специалиста.
            Все AI-выводы формулируются осторожно: «Похоже…», «Возможно…», «Нужно подтвердить наблюдениями.»
          </p>
        </div>
      </section>
    </div>
  );
};
