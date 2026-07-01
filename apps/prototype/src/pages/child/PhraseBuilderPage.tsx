import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const words = [
  { text: 'Я', color: 'bg-[#eaf9ef]' },
  { text: 'хочу', color: 'bg-[#fff3ce]' },
  { text: 'пить', color: 'bg-[#e8f4ff]' },
  { text: 'воду', color: 'bg-[#e8f4ff]' },
  { text: 'я', color: 'bg-[#eaf9ef]' },
  { text: 'не хочу', color: 'bg-[#f3f6fa]', span: true },
  { text: 'есть', color: 'bg-[#f3f6fa]' },
  { text: 'домой', color: 'bg-[#ffeceb]' },
  { text: 'гулять', color: 'bg-[#ffeceb]' },
  { text: 'ещё', color: 'bg-[#f3f6fa]' },
  { text: 'пауза', color: 'bg-[#f3f6fa]', wide: true },
];

export const PhraseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState<string[]>([]);

  const addWord = (word: string) => {
    setPhrase([...phrase, word]);
  };

  const clearPhrase = () => {
    setPhrase([]);
  };

  const sendPhrase = () => {
    if (phrase.length > 0) {
      alert(`Я хочу сказать: "${phrase.join(' ')}"`);
      setPhrase([]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/child/home')} className="text-3xl font-black text-[#203a60]">‹</button>
        <button onClick={clearPhrase} className="text-2xl">⌫</button>
      </div>

      {/* Phrase Box */}
      <div className="bg-[#f0fbff] border border-[#bee1f4] rounded-2xl p-4 flex items-center gap-3">
        <span className="text-4xl">🦕</span>
        <div className="flex-1 text-center text-2xl font-black tracking-tight text-[#102544]">
          {phrase.length > 0 ? phrase.join(' ') : '...'}
        </div>
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {words.map((word, i) => (
          <button
            key={i}
            onClick={() => addWord(word.text)}
            className={`min-h-[52px] rounded-xl border border-[#dce9f4] flex items-center justify-center font-black text-base ${word.color} ${word.wide ? 'col-span-4' : ''}`}
          >
            {word.text}
          </button>
        ))}
      </div>

      {/* Send Button */}
      {phrase.length > 0 && (
        <button
          onClick={sendPhrase}
          className="w-full py-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-black rounded-2xl text-lg"
        >
          Отправить маме
        </button>
      )}
    </div>
  );
};
