import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import {
  Water2DIcon,
  Mom2DIcon,
  Help2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';

/**
 * ChildSpeak — голосовой ввод (v0.3.15).
 *
 * Структура (как в child_v2.html):
 * - Back button + title.
 * - Big mic (150×150), teal gradient, pulse при recording.
 * - Hint text.
 * - Heard area (32px teal текст).
 * - 3 word-кнопки (Вода / Мама / Дай).
 */

interface SpeakWord {
  id: string;
  label: string;
  spoken: string;
  hint: string;
  Icon: React.FC<{ size?: number; animated?: boolean }>;
  family: ChildCardFamily;
}

const SPEAK_WORDS: SpeakWord[] = [
  { id: 'water', label: 'Вода', spoken: 'Вода', hint: 'ва', Icon: Water2DIcon, family: 'need' },
  { id: 'mom',   label: 'Мама', spoken: 'Мама', hint: 'ма', Icon: Mom2DIcon,   family: 'feel' },
  { id: 'give',  label: 'Дай',  spoken: 'Дай',  hint: 'дай', Icon: Help2DIcon, family: 'do' },
];

const SpeakWordCard: React.FC<{ w: SpeakWord; delay: number; onClick: () => void }> = ({
  w,
  delay,
  onClick,
}) => {
  const family = CHILD_FAMILY_STYLES[w.family];
  return (
    <button
      onClick={onClick}
      className="qoldau-icon-pop flex flex-col items-center gap-2.5 px-2 py-4 bg-white rounded-3xl shadow-card cursor-pointer min-h-[120px] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.94]"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={w.label}
    >
      <div className={`w-14 h-14 rounded-[18px] ${family.icoBg} flex items-center justify-center`}>
        <w.Icon size={46} />
      </div>
      <div className={`text-sm font-black text-center leading-tight ${family.lbl}`}>
        {w.label}
      </div>
    </button>
  );
};

export const ChildSpeak: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const { addEvent } = useEventStore();

  const toggleRec = () => {
    if (isRecording) {
      setIsRecording(false);
      setHeard('ва');
      return;
    }
    setIsRecording(true);
    setHeard(null);
  };

  const sayWord = (w: SpeakWord) => {
    setHeard(`${w.spoken} («${w.hint}»)`);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'communication',
      title: 'Голосовой запрос',
      description: `Сказал: «${w.spoken}». Похоже, это может быть связано с ${w.spoken.toLowerCase()}. Нужно подтвердить.`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { heard: w.hint, suggestion: w.spoken, source: 'voice' },
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] text-center">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Сказать</div>
      </div>

      {/* Big mic */}
      <button
        onClick={toggleRec}
        className={`mx-auto my-7 w-[150px] h-[150px] rounded-full border-0 cursor-pointer bg-white flex items-center justify-center relative ${
          isRecording ? 'qoldau-icon-rec' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #7fd1c9 0%, #1ba39a 100%)',
          boxShadow: isRecording
            ? undefined
            : '0 14px 34px rgba(27,163,154,0.34)',
        }}
        aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
      >
        <svg viewBox="0 0 24 24" width={66} height={66} style={{ overflow: 'visible' }} aria-hidden="true">
          <rect x={9} y={3} width={6} height={12} rx={3} fill="#fff" />
          <path d="M6 11a6 6 0 0 0 12 0" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d="M12 17v4M8 21h8" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>

      {/* Hint */}
      <div className="text-ink-soft font-bold text-[17px] mt-1.5">
        {isRecording ? 'Слушаю… говори' : 'Нажми и скажи слово'}
      </div>

      {/* Heard area */}
      <div
        className="mx-5 my-4.5 bg-white rounded-[20px] p-5 shadow-card text-[32px] font-black min-h-[40px] flex items-center justify-center"
        style={{ color: '#12807a' }}
        aria-live="polite"
      >
        {heard ?? '…'}
      </div>

      {/* 3 word buttons */}
      <div className="grid grid-cols-3 gap-3.5 px-5">
        {SPEAK_WORDS.map((w, i) => (
          <SpeakWordCard
            key={w.id}
            w={w}
            delay={i * 60}
            onClick={() => sayWord(w)}
          />
        ))}
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
};