import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { ChildTopBar } from '@/components/layout/ChildTopBar';
import { BackArrowIcon, DinoMascot2D } from '@/components/icons/child2d';
import { X } from 'lucide-react';

interface WordChip {
  text: string;
  bg: string;
  color: string;
  wide?: boolean;
}

// Мягкая палитра, согласованная с дизайн-системой.
const WORDS: WordChip[] = [
  { text: 'Я',         bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
  { text: 'хочу',      bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
  { text: 'пить',      bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
  { text: 'воду',      bg: 'bg-[#EAF5FF]', color: 'text-[#1c6cb8]' },
  { text: 'есть',      bg: 'bg-[#EAF6EF]', color: 'text-[#276b48]' },
  { text: 'не хочу',   bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
  { text: 'туалет',    bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]' },
  { text: 'домой',     bg: 'bg-[#FBEDED]', color: 'text-[#a24545]' },
  { text: 'гулять',    bg: 'bg-[#FBEDED]', color: 'text-[#a24545]' },
  { text: 'ещё',       bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]' },
  { text: 'пауза',     bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
];

/**
 * PhraseBuilderPage — сборка фразы из слов (v0.3.15).
 *
 * Структура (как в child_v2.html):
 * - Back + clear buttons.
 * - Phrase strip с чипами + DinoMascot2D.
 * - "Сказать фразу" big teal button (когда фраза не пустая).
 * - Word grid 3 cols.
 */
export const PhraseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addEvent } = useEventStore();
  const { showToast } = useToastStore();

  const addWord = (word: string) => setPhrase([...phrase, word]);
  const clearPhrase = () => setPhrase([]);

  const sendPhrase = () => {
    if (phrase.length === 0) return;
    const phraseText = phrase.join(' ');
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'phrase',
      title: `Фраза: «${phraseText}»`,
      description: `Ребёнок собрал фразу из AAC карточек: «${phraseText}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { phrase: phraseText, source: 'phrase_builder' },
    });
    showToast('Мама увидит фразу', 'success');
    setShowSuccess(true);
    setPhrase([]);

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/child/home');
    }, 1600);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <ChildTopBar />

      {/* Header: back + clear */}
      <div className="flex items-center gap-2.5 px-5 pt-1 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Собрать фразу</div>
        {phrase.length > 0 && (
          <button
            onClick={clearPhrase}
            className="ml-auto w-[42px] h-[42px] rounded-[14px] border-0 flex items-center justify-center transition-colors shadow-card"
            style={{ background: '#f4eaea', color: '#c95f5f' }}
            aria-label="Очистить фразу"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Phrase strip + DinoMascot2D */}
      <div className="mx-5 my-3.5 min-h-[80px] bg-white rounded-[20px] shadow-card flex items-center gap-2 p-3.5 flex-wrap">
        {phrase.length === 0 ? (
          <div className="flex items-center gap-3 w-full">
            <DinoMascot2D size={56} animated />
            <span className="text-muted font-bold">Выбирай слова →</span>
          </div>
        ) : (
          <>
            <DinoMascot2D size={56} animated />
            {phrase.map((w, i) => (
              <span
                key={i}
                className="qoldau-icon-pop font-black px-4 py-3 rounded-[14px] text-base"
                style={{ background: '#e9f7f5', color: '#0d5c5c' }}
              >
                {w}
              </span>
            ))}
            <button
              onClick={clearPhrase}
              className="ml-auto border-0 font-black rounded-xl px-3 py-2.5 cursor-pointer"
              style={{ background: '#f4eaea', color: '#c95f5f' }}
            >
              ✕
            </button>
          </>
        )}
      </div>

      {/* Speak button (only when phrase has words) */}
      {phrase.length > 0 && (
        <button
          onClick={sendPhrase}
          className="mx-5 mb-3.5 border-0 rounded-[18px] p-4 text-white font-black text-[17px] cursor-pointer flex items-center justify-center gap-2.5"
          style={{
            background: '#1ba39a',
            boxShadow: '0 8px 20px rgba(27,163,154,0.28)',
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M3 10v4h4l5 5V5L7 10H3z" />
            <path d="M16 9a4 4 0 0 1 0 6" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
          </svg>
          Сказать фразу
        </button>
      )}

      {/* Word grid 3-col */}
      <div className="grid grid-cols-3 gap-2.5 px-5">
        {WORDS.map((word, i) => {
          const used = phrase.includes(word.text);
          return (
            <button
              key={i}
              onClick={() => addWord(word.text)}
              className={`min-h-[56px] rounded-2xl ${word.bg} flex items-center justify-center font-black text-base ${word.color} ${
                word.wide ? 'col-span-3' : ''
              } transition-all duration-200 ease-out active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-card ${
                used ? 'ring-2 ring-teal/50' : ''
              }`}
              aria-label={`Добавить слово ${word.text}`}
            >
              {word.text}
            </button>
          );
        })}
      </div>

      <div style={{ height: 16 }} />

      {/* Success overlay */}
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(234,245,255,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <QoldauCard variant="elevated" padding="lg" className="max-w-xs text-center">
            <div className="flex justify-center mb-3">
              <SuccessSparkle className="w-20 h-20" />
            </div>
            <p className="text-lg font-black text-ink">Мама увидит фразу</p>
            <p className="text-sm text-muted mt-1">Спасибо, что сказал</p>
          </QoldauCard>
        </div>
      )}
    </div>
  );
};