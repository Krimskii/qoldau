import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Principle {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

const PRINCIPLES: Principle[] = [
  { id: 'tap', title: 'Крупные кнопки', description: 'Легко нажимать даже при трудностях моторики', emoji: '👆', color: 'bg-[#FFE7BE]' },
  { id: 'text', title: 'Минимум текста', description: 'Понятные карточки и символы', emoji: '🔤', color: 'bg-[#E5E2FF]' },
  { id: 'visual', title: 'Визуальные подсказки', description: 'Поддерживают понимание и снижают тревогу', emoji: '👁', color: 'bg-[#E5F4FF]' },
  { id: 'voice', title: 'Голосовой ввод', description: 'Ребёнок может сказать, если сложно нажать', emoji: '🎙', color: 'bg-[#E9F8F0]' },
  { id: 'choice', title: 'Выбор по оболочкам', description: 'Любимые мультики и видео — через карточки', emoji: '⭐', color: 'bg-[#FFF3CE]' },
  { id: 'phrase', title: 'Сборка фраз', description: 'Простые слова помогают выразить себя', emoji: '🗣', color: 'bg-[#FFEDEA]' },
  { id: 'calm', title: 'Спокойный режим', description: 'Помогает восстановить состояние и фокус', emoji: '☁️', color: 'bg-[#E9F8F0]' },
  { id: 'sos', title: 'Безопасный вызов', description: 'Всегда можно позвать маму', emoji: '🆘', color: 'bg-[#FFECEC]' },
];

const METHODS = ['AAC', 'Visual Supports', 'FCT', 'Prompting', 'Task Analysis', 'Social Stories', 'Self-management', 'Sensory Support'];

export const ChildInterfaceGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <h2 className="text-lg font-black text-[#143259]">О приложении</h2>
        <div className="w-10" />
      </div>

      {/* Принципы */}
      <div className="bg-white border-2 border-line rounded-3xl p-5">
        <h3 className="text-base font-black text-ink mb-4 flex items-center gap-2">
          <span aria-hidden="true">✨</span>
          Что важно в интерфейсе
        </h3>
        <div className="space-y-2.5">
          {PRINCIPLES.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-3 p-2 rounded-xl hover:bg-bg transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center text-2xl flex-shrink-0`}
                aria-hidden="true"
              >
                {p.emoji}
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">{p.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Методики */}
      <div className="bg-gradient-to-br from-[#E5F4FF] to-[#F0EBFF] border-2 border-blue/20 rounded-3xl p-5">
        <h3 className="text-base font-black text-ink mb-3 flex items-center gap-2">
          <span aria-hidden="true">🧠</span>
          Заложенные методики
        </h3>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <span
              key={m}
              className="px-3 py-2 bg-white border border-blue/20 rounded-full text-xs font-bold text-ink"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Маскот */}
      <div className="bg-white border-2 border-line rounded-3xl p-6 text-center">
        <div className="text-7xl mb-2" aria-hidden="true">🦖</div>
        <p className="text-sm text-ink-2 leading-relaxed max-w-sm mx-auto">
          Интерфейс создан так, чтобы ребёнок чувствовал себя уверенно и спокойно,
          мог обратиться за помощью и получать поддержку в нужный момент.
        </p>
      </div>

      <p className="text-xs text-muted text-center italic">
        Приложение не является медицинским устройством. Это профиль достижений.
      </p>
    </div>
  );
};