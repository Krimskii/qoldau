import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChildTopBar } from '@/components/layout/ChildTopBar';
import { BackArrowIcon, DinoMascot2D } from '@/components/icons/child2d';
import { QoldauCard } from '@/components/ui/QoldauCard';

interface Principle {
  id: string;
  title: string;
  description: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  bg: string;
  text: string;
}

// Маппинг импортируется лениво для tree-shaking.
import {
  Tap2DIcon,
  Text2DIcon,
  Eye2DIcon,
  Mic2DIcon,
  Fav2DIcon,
  Phrase2DIcon,
  Calm2DIcon,
  SOS2DIcon,
} from '@/components/icons/child2d';

const PRINCIPLES: Principle[] = [
  { id: 'tap',    title: 'Крупные кнопки',     description: 'Легко нажимать даже при трудностях моторики',  Icon: Tap2DIcon,    bg: 'bg-[#FFE7BE]', text: 'text-[#8a5d17]' },
  { id: 'text',   title: 'Минимум текста',     description: 'Понятные карточки и символы',                 Icon: Text2DIcon,   bg: 'bg-[#E5E2FF]', text: 'text-[#5b47a0]' },
  { id: 'visual', title: 'Визуальные подсказки', description: 'Поддерживают понимание и снижают тревогу',  Icon: Eye2DIcon,    bg: 'bg-[#E5F4FF]', text: 'text-[#1c6cb8]' },
  { id: 'voice',  title: 'Голосовой ввод',     description: 'Ребёнок может сказать, если сложно нажать',   Icon: Mic2DIcon,    bg: 'bg-[#EAF8F0]', text: 'text-[#276b48]' },
  { id: 'choice', title: 'Выбор по оболочкам', description: 'Любимые мультики и видео — через карточки',  Icon: Fav2DIcon,    bg: 'bg-[#FFF3CE]', text: 'text-[#8a5d17]' },
  { id: 'phrase', title: 'Сборка фраз',        description: 'Простые слова помогают выразить себя',        Icon: Phrase2DIcon, bg: 'bg-[#FFEDEA]', text: 'text-[#a24545]' },
  { id: 'calm',   title: 'Спокойный режим',    description: 'Помогает восстановить состояние и фокус',    Icon: Calm2DIcon,   bg: 'bg-[#EAF8F0]', text: 'text-[#276b48]' },
  { id: 'sos',    title: 'Безопасный вызов',   description: 'Всегда можно позвать маму',                   Icon: SOS2DIcon,    bg: 'bg-[#FFECEC]', text: 'text-[#a24545]' },
];

const METHODS = ['AAC', 'Visual Supports', 'FCT', 'Prompting', 'Task Analysis', 'Social Stories', 'Self-management', 'Sensory Support'];

/**
 * ChildInterfaceGuide — принципы дизайна (v0.3.15).
 *
 * Заменяет emoji-иконки на 2D SVG. Маскот — DinoMascot2D.
 */
export const ChildInterfaceGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <ChildTopBar showSettings={false} />

      <div className="flex items-center gap-2.5 px-5 pt-1 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">О приложении</div>
      </div>

      <QoldauCard variant="default" padding="lg" className="mx-5 mt-3">
        <h3 className="text-base font-black text-ink mb-3 flex items-center gap-2">
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
                className={`w-12 h-12 rounded-2xl ${p.bg} flex items-center justify-center flex-shrink-0`}
                aria-hidden="true"
              >
                <p.Icon size={32} />
              </div>
              <div>
                <h4 className={`text-sm font-black ${p.text}`}>{p.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </QoldauCard>

      {/* Методики */}
      <div
        className="mx-5 mt-4 rounded-3xl p-5 border-0 shadow-card"
        style={{ background: 'linear-gradient(135deg, #E5F4FF 0%, #F0EBFF 100%)' }}
      >
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
      <QoldauCard variant="default" padding="lg" className="mx-5 mt-4 text-center">
        <div className="flex justify-center mb-2">
          <DinoMascot2D size={96} animated />
        </div>
        <p className="text-sm text-ink-2 leading-relaxed max-w-sm mx-auto">
          Интерфейс создан так, чтобы ребёнок чувствовал себя уверенно и спокойно,
          мог обратиться за помощью и получать поддержку в нужный момент.
        </p>
      </QoldauCard>

      <p className="px-5 mt-3 text-xs text-muted text-center italic">
        Приложение не является медицинским устройством. Это профиль достижений.
      </p>

      <div style={{ height: 12 }} />
    </div>
  );
};