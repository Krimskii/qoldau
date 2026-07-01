import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface WordChip {
  text: string;
  color: string;
  textColor: string;
  wide?: boolean;
}

const WORDS: WordChip[] = [
  { text: 'Я', color: 'bg-[#E9F8F0]', textColor: 'text-[#158647]' },
  { text: 'хочу', color: 'bg-[#FFF3CE]', textColor: 'text-[#9a7820]' },
  { text: 'пить', color: 'bg-[#E8F4FF]', textColor: 'text-[#1c6cb8]' },
  { text: 'воду', color: 'bg-[#E8F4FF]', textColor: 'text-[#1c6cb8]' },
  { text: 'есть', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]' },
  { text: 'не хочу', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]', wide: true },
  { text: 'туалет', color: 'bg-[#F2ECFF]', textColor: 'text-[#5a3eb4]' },
  { text: 'домой', color: 'bg-[#FFECEC]', textColor: 'text-[#cc251d]' },
  { text: 'гулять', color: 'bg-[#FFECEC]', textColor: 'text-[#cc251d]' },
  { text: 'ещё', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]' },
  { text: 'пауза', color: 'bg-[#F3F6FA]', textColor: 'text-[#53677e]', wide: true },
];

export const PhraseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState<string[]>([]);
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
    setPhrase([]);
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

      {/* Блок собранной фразы — крупный, с динозавром */}
      <div className="bg-[#F0FBFF] border-2 border-[#bee1f4] rounded-3xl p-5 flex items-center gap-4 min-h-[88px]">
        <span className="text-5xl flex-shrink-0" aria-hidden="true">🦕</span>
        <div className="flex-1 text-center text-3xl font-black tracking-tight text-[#102544] min-h-[36px]">
          {phrase.length > 0 ? phrase.join(' ') : <span className="text-muted">...</span>}
        </div>
      </div>

      {/* Сетка слов — 4 колонки */}
      <div className="grid grid-cols-4 gap-2.5">
        {WORDS.map((word, i) => (
          <button
            key={i}
            onClick={() => addWord(word.text)}
            className={`min-h-[56px] rounded-2xl border-2 border-[#dce9f4] ${word.color} flex items-center justify-center font-black text-base ${word.textColor} ${
              word.wide ? 'col-span-4' : ''
            } hover:scale-[0.97] active:scale-[0.94] transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]`}
          >
            {word.text}
          </button>
        ))}
      </div>

      {/* Кнопка отправки */}
      {phrase.length > 0 && (
        <button
          onClick={sendPhrase}
          className="w-full py-5 bg-gradient-to-br from-teal to-[#037A76] text-white font-black rounded-2xl text-lg shadow-card hover:shadow-card-soft transition-shadow mt-auto"
        >
          Отправить маме
        </button>
      )}
    </div>
  );
};