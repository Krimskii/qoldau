import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { DinoMascot } from '@/components/illustrations/DinoMascot';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';

interface WordChip {
  text: string;
  color: string;
  textColor: string;
  border: string;
  wide?: boolean;
}

// Мягкая палитра. Красный убран — заменён на coral-soft.
const WORDS: WordChip[] = [
  { text: 'Я', color: 'bg-[#EAF8F0]', textColor: 'text-[#158647]', border: 'border-[#ccebd9]' },
  { text: 'хочу', color: 'bg-[#FFF6DF]', textColor: 'text-[#9a7820]', border: 'border-[#f0e2a7]' },
  { text: 'пить', color: 'bg-[#EAF5FF]', textColor: 'text-[#1c6cb8]', border: 'border-[#cce6f7]' },
  { text: 'воду', color: 'bg-[#EAF5FF]', textColor: 'text-[#1c6cb8]', border: 'border-[#cce6f7]' },
  { text: 'есть', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]', border: 'border-[#e1e7ee]' },
  { text: 'не хочу', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]', border: 'border-[#e1e7ee]', wide: true },
  { text: 'туалет', color: 'bg-[#F1EDFF]', textColor: 'text-[#5a3eb4]', border: 'border-[#e0d6f7]' },
  { text: 'домой', color: 'bg-[#FFEAEA]', textColor: 'text-[#cc251d]', border: 'border-[#ffd9d3]' },
  { text: 'гулять', color: 'bg-[#FFEAEA]', textColor: 'text-[#cc251d]', border: 'border-[#ffd9d3]' },
  { text: 'ещё', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]', border: 'border-[#e1e7ee]' },
  { text: 'пауза', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]', border: 'border-[#e1e7ee]', wide: true },
];

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

    // Через 1.6s убираем success и возвращаемся на home
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/child/home');
    }, 1600);
  };

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <button
          onClick={clearPhrase}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Очистить"
        >
          <span className="text-2xl text-[#53677e]">⌫</span>
        </button>
      </div>

      {/* Блок собранной фразы — DinoMascot + крупный текст */}
      <div className="bg-gradient-to-br from-[#F0FBFF] to-[#EAF5FF] border-2 border-[#bee1f4] rounded-3xl p-5 flex items-center gap-4 min-h-[96px]">
        <DinoMascot animated={!showSuccess} className="w-16 h-16 flex-shrink-0" />
        <div className="flex-1 text-center text-3xl font-black tracking-tight text-[#102544] min-h-[36px] flex items-center justify-center">
          {phrase.length > 0 ? phrase.join(' ') : <span className="text-muted">...</span>}
        </div>
      </div>

      {/* Сетка слов — 4 колонки, мягкая подсветка выбранных (через ring) */}
      <div className="grid grid-cols-4 gap-2.5">
        {WORDS.map((word, i) => {
          const used = phrase.includes(word.text);
          return (
            <button
              key={i}
              onClick={() => addWord(word.text)}
              className={`min-h-[56px] rounded-2xl border-2 ${word.border} ${word.color} flex items-center justify-center font-black text-base ${word.textColor} ${
                word.wide ? 'col-span-4' : ''
              } transition-all duration-200 ease-out active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${
                used ? 'ring-2 ring-teal/50' : ''
              }`}
              aria-label={`Добавить слово ${word.text}`}
            >
              {word.text}
            </button>
          );
        })}
      </div>

      {/* Кнопка отправки */}
      {phrase.length > 0 && (
        <button
          onClick={sendPhrase}
          className="w-full py-5 bg-gradient-to-br from-teal to-[#037A76] text-white font-black rounded-2xl text-lg shadow-card hover:shadow-card-soft transition-shadow mt-auto active:scale-[0.98]"
        >
          Отправить маме
        </button>
      )}

      {/* Success overlay — мягкая success-карточка */}
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 bg-[#EAF5FF]/85 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-white border-2 border-[#DDF5F0] rounded-3xl px-8 py-7 shadow-card max-w-xs text-center">
            <div className="flex justify-center mb-3">
              <SuccessSparkle className="w-20 h-20" />
            </div>
            <p className="text-lg font-black text-ink">Мама увидит фразу</p>
            <p className="text-sm text-muted mt-1">Спасибо, что сказал</p>
          </div>
        </div>
      )}
    </div>
  );
};