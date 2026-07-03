import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import { Trash2, Delete, Volume2 } from 'lucide-react';
import {
  User2DIcon,
  Mom2DIcon,
  Dad2DIcon,
  Tutor2DIcon,
  Heart2DIcon,
  Water2DIcon,
  Food2DIcon,
  Walk2DIcon,
  Play2DIcon,
  Tired2DIcon,
  Hurt2DIcon,
  Help2DIcon,
  Home2DIcon,
  Puzzle2DIcon,
  Toilet2DIcon,
  Hug2DIcon,
  Yes2DIcon,
  No2DIcon,
  Cartoon2DIcon,
  Car2DIcon,
  Music2DIcon,
  Pause2DIcon,
  Headphones2DIcon,
} from '@/components/icons/child2d';

type IconComponent = React.FC<{ size?: number; animated?: boolean; className?: string }>;

/** Грамматическая функция слова — определяет цвет в "Выбирай слова" и подсказке (legend). */
type WordFunction = 'pron' | 'verb' | 'noun' | 'soc' | 'neg';

interface Word {
  text: string;
  icon: IconComponent;
  func: WordFunction;
}

/**
 * Цвета функций — вынесены в константы (как в phrase_ideal.html).
 * Каждая функция имеет три оттенка: bg (иконка-фон), text (label), icon (иконка).
 */
const FUNC_STYLES: Record<
  WordFunction,
  { bg: string; text: string; icon: string; label: string }
> = {
  pron: { bg: '#e8f2f8', text: '#245f7d', icon: '#3a90bd', label: 'кто' },
  verb: { bg: '#e9f4ee', text: '#2a6647', icon: '#3f9a6a', label: 'действие' },
  noun: { bg: '#f4ede2', text: '#6f5228', icon: '#b0864a', label: 'что' },
  soc:  { bg: '#eeecf7', text: '#564a86', icon: '#8172bd', label: 'вежливо' },
  neg:  { bg: '#f7ecec', text: '#9c4d4d', icon: '#c56a6a', label: 'нет' },
};

/**
 * Расширенный словарь для «Выбирай слова» (v0.3.22).
 * Упорядочен по грамматической функции: pron → verb → noun → soc → neg.
 * Иконки из child2d.tsx (2D inline SVG).
 */
/**
 * Готовые фразы для Wave 0 — ребёнок может выбрать одной кнопкой
 * самую частую коммуникацию. Это снижает барьер для детей,
 * которые ещё не ориентируются в словаре.
 */
const PRESET_PHRASES: Array<{
  id: string;
  label: string;
  words: string[];
  Icon: IconComponent;
  bg: string;
  text: string;
}> = [
  {
    id: 'want-drink',
    label: 'Я хочу пить',
    words: ['Я', 'хочу', 'пить'],
    Icon: Water2DIcon,
    bg: '#EAF5FF',
    text: '#1c6cb8',
  },
  {
    id: 'need-help',
    label: 'Мне нужна помощь',
    words: ['мне', 'нужна', 'помощь'],
    Icon: Help2DIcon,
    bg: '#EAF6EF',
    text: '#276b48',
  },
  {
    id: 'too-loud',
    label: 'Мне громко',
    words: ['мне', 'громко'],
    Icon: Headphones2DIcon,
    bg: '#FFF6DF',
    text: '#9a7820',
  },
  {
    id: 'want-pause',
    label: 'Я хочу паузу',
    words: ['Я', 'хочу', 'паузу'],
    Icon: Pause2DIcon,
    bg: '#F1EDFF',
    text: '#5a3eb4',
  },
  {
    id: 'call-mom',
    label: 'Позови маму',
    words: ['Позови', 'маму'],
    Icon: Mom2DIcon,
    bg: '#FBEDED',
    text: '#a24545',
  },
  {
    id: 'im-tired',
    label: 'Я устал',
    words: ['Я', 'устал'],
    Icon: Tired2DIcon,
    bg: '#F1EDFF',
    text: '#5a3eb4',
  },
  {
    id: 'it-hurts',
    label: 'Мне больно',
    words: ['мне', 'больно'],
    Icon: Hurt2DIcon,
    bg: '#FBEDED',
    text: '#a24545',
  },
  {
    id: 'im-okay',
    label: 'Я в порядке',
    words: ['Я', 'в', 'порядке'],
    Icon: Heart2DIcon,
    bg: '#EAF6EF',
    text: '#276b48',
  },
];

const VOCAB: Word[] = [
  // pron (кто)
  { text: 'Я',       icon: User2DIcon,   func: 'pron' },
  { text: 'мне',     icon: User2DIcon,   func: 'pron' },
  { text: 'мама',    icon: Mom2DIcon,    func: 'pron' },
  { text: 'маму',    icon: Mom2DIcon,    func: 'pron' },
  { text: 'папа',    icon: Dad2DIcon,    func: 'pron' },
  { text: 'тьютор',  icon: Tutor2DIcon,  func: 'pron' },

  // verb (действие)
  { text: 'хочу',    icon: Heart2DIcon,  func: 'verb' },
  { text: 'пить',    icon: Water2DIcon,  func: 'verb' },
  { text: 'есть',    icon: Food2DIcon,   func: 'verb' },
  { text: 'гулять',  icon: Walk2DIcon,   func: 'verb' },
  { text: 'играть',  icon: Play2DIcon,   func: 'verb' },
  { text: 'спать',   icon: Tired2DIcon,  func: 'verb' },
  { text: 'помощь',  icon: Help2DIcon,   func: 'verb' },
  { text: 'Позови',  icon: Mom2DIcon,    func: 'verb' },

  // noun (что)
  { text: 'воду',    icon: Water2DIcon,  func: 'noun' },
  { text: 'еду',     icon: Food2DIcon,   func: 'noun' },
  { text: 'игрушку', icon: Puzzle2DIcon, func: 'noun' },
  { text: 'туалет',  icon: Toilet2DIcon, func: 'noun' },
  { text: 'домой',   icon: Home2DIcon,   func: 'noun' },
  { text: 'мультик', icon: Cartoon2DIcon, func: 'noun' },
  { text: 'машину',  icon: Car2DIcon,     func: 'noun' },
  { text: 'музыку',  icon: Music2DIcon,   func: 'noun' },
  { text: 'паузу',   icon: Pause2DIcon,   func: 'noun' },

  // adj (состояние)
  { text: 'громко',  icon: Headphones2DIcon, func: 'noun' },
  { text: 'тихо',    icon: Music2DIcon,      func: 'noun' },
  { text: 'больно',  icon: Hurt2DIcon,        func: 'noun' },
  { text: 'устал',   icon: Tired2DIcon,       func: 'noun' },
  { text: 'в',       icon: User2DIcon,        func: 'noun' },
  { text: 'порядке', icon: Heart2DIcon,       func: 'noun' },
  { text: 'нужна',   icon: Help2DIcon,        func: 'noun' },

  // soc (вежливо)
  { text: 'пожалуйста', icon: Hug2DIcon, func: 'soc' },
  { text: 'спасибо',    icon: Heart2DIcon, func: 'soc' },
  { text: 'да',         icon: Yes2DIcon, func: 'soc' },

  // neg (нет)
  { text: 'не хочу', icon: No2DIcon, func: 'neg' },
  { text: 'нет',     icon: No2DIcon, func: 'neg' },
  { text: 'не надо', icon: No2DIcon, func: 'neg' },
];

/**
 * PhraseBuilderPage (v0.3.22) — редизайн под phrase_ideal.html.
 *
 * Структура (как в референсе):
 * - Back + title.
 * - **Phrase strip** (104px min-h, dashed border → solid teal когда заполнена)
 *   с большими chips: иконка 26px + текст 15px font-black.
 * - **Action row**:
 *   - «Сказать фразу» (teal big, flex-1) — создаёт event.
 *   - «Стереть последнее» (56px, иконка backspace) — удаляет последнее слово с fade.
 *   - «Очистить» (56px, иконка trash) — очищает всю фразу.
 * - **«ВЫБИРАЙ СЛОВА»** label (uppercase, small, ink-soft).
 * - **Word grid 3-col** — 23 слова с color-coding по грамматической функции:
 *   - pron (кто) — голубой
 *   - verb (действие) — зелёный
 *   - noun (что) — тёплый
 *   - soc (вежливо) — фиолет
 *   - neg (нет) — коралл
 * - **Legend** (5 dots) внизу — объясняет цвета.
 *
 * Toggle механика: tap → add с speak-pulse, tap again → fade-out из фразы.
 */
export const PhraseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const [phrase, setPhrase] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, []);

  /** Поиск иконки и функции по тексту (для рендера chips в phrase strip). */
  const findWord = (text: string): Word | null => VOCAB.find((w) => w.text === text) ?? null;

  /** Tap по preset phrase — заполняет phrase strip всеми словами пресета. */
  const handleSelectPreset = (words: string[]) => {
    setPhrase(words);
    setRemoving(null);
    // Подсветим все слова пресета (speak-pulse последовательно).
    words.forEach((w, idx) => {
      setTimeout(() => {
        setSpeaking(w);
        setTimeout(() => setSpeaking((cur) => (cur === w ? null : cur)), 320);
      }, idx * 80);
    });
  };

  /** Toggle: tap → add, tap again → remove. */
  const toggleWord = (text: string) => {
    if (removeTimerRef.current) {
      clearTimeout(removeTimerRef.current);
      removeTimerRef.current = null;
    }
    setRemoving(null);

    if (phrase.includes(text)) {
      setRemoving(text);
      removeTimerRef.current = setTimeout(() => {
        setPhrase((prev) => prev.filter((w) => w !== text));
        setRemoving(null);
        removeTimerRef.current = null;
      }, 300);
    } else {
      setPhrase((prev) => [...prev, text]);
      setSpeaking(text);
      setTimeout(() => setSpeaking((cur) => (cur === text ? null : cur)), 320);
    }
  };

  /** Стереть последнее слово с fade-анимацией. */
  const eraseLast = () => {
    if (phrase.length === 0) return;
    const last = phrase[phrase.length - 1];
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    setRemoving(last);
    removeTimerRef.current = setTimeout(() => {
      setPhrase((prev) => prev.slice(0, -1));
      setRemoving(null);
      removeTimerRef.current = null;
    }, 300);
  };

  /** Очистить всю фразу. */
  const clearPhrase = () => {
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    setPhrase([]);
    setRemoving(null);
  };

  const sendPhrase = () => {
    if (phrase.length === 0) return;
    const phraseText = phrase.join(' ');
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'phrase',
      title: `Фраза: «${phraseText}»`,
      description: `Ребёнок собрал фразу: «${phraseText}». Это наблюдение, не диагноз.`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { phrase: phraseText, source: 'phrase_builder' },
    });
    setShowSuccess(true);
    setPhrase([]);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/child/home');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Back + title */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border border-line flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Собрать фразу</div>
      </div>

      {/* PRESET PHRASES — быстрые готовые фразы для Wave 0 */}
      <div className="px-5 pt-2 pb-1">
        <div className="text-[11px] font-black text-ink-soft uppercase tracking-wide mb-2">
          Частые фразы — одно касание
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5">
          {PRESET_PHRASES.map((preset) => {
            const Icon = preset.Icon;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.words)}
                className="flex-shrink-0 bg-white border border-line rounded-[18px] p-2.5 flex items-center gap-2 active:scale-[0.95] transition-transform shadow-card-soft hover:shadow-card"
                aria-label={preset.label}
                style={{ minWidth: 140 }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: preset.bg }}
                >
                  <Icon size={28} animated={false} />
                </div>
                <div
                  className="text-[13px] font-black text-left leading-tight"
                  style={{ color: preset.text }}
                >
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phrase strip (large, dashed → solid) */}
      <div
        className="mx-5 mt-3.5 mb-2.5 min-h-[104px] bg-white rounded-[22px] flex items-center gap-2.5 p-4 flex-wrap transition-colors"
        style={{
          border: phrase.length > 0
            ? '2px solid #7fd1c9'
            : '2px dashed #cfe0df',
        }}
        aria-live="polite"
      >
        {phrase.length === 0 ? (
          <span className="text-[#9fb3ba] font-bold text-base">
            Собирай слова ниже ↓
          </span>
        ) : (
          phrase.map((w, i) => {
            const word = findWord(w);
            const WordIcon = word?.icon;
            const isRemoving = removing === w;
            return (
              <div
                key={`${w}-${i}-${phrase.length}`}
                className="flex flex-col items-center gap-1 rounded-[14px] px-3 pt-2 pb-1.5 transition-all duration-300 ease-out"
                style={{
                  background: '#e9f7f5',
                  opacity: isRemoving ? 0 : 1,
                  transform: isRemoving ? 'scale(0.85)' : 'scale(1)',
                  animation: isRemoving ? undefined : 'phrase-pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
              >
                {WordIcon && (
                  <WordIcon size={26} animated={false} />
                )}
                <span
                  className="text-[15px] font-black leading-none"
                  style={{ color: '#0d5c5c' }}
                >
                  {w}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Actions: Сказать + Стереть последнее + Очистить */}
      <div className="flex gap-2.5 px-5 mb-3">
        <button
          onClick={sendPhrase}
          disabled={phrase.length === 0}
          className="flex-1 border-0 rounded-[18px] py-4 text-white font-black text-[17px] flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform"
          style={{
            background: phrase.length > 0
              ? 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)'
              : '#aacfca',
            boxShadow: phrase.length > 0
              ? '0 6px 16px rgba(27,163,154,0.26)'
              : 'none',
            cursor: phrase.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Volume2 className="w-5 h-5" />
          Сказать фразу
        </button>
        <button
          onClick={eraseLast}
          disabled={phrase.length === 0}
          className="w-14 border border-line rounded-[18px] bg-white flex items-center justify-center active:scale-[0.94] transition-transform"
          style={{ opacity: phrase.length === 0 ? 0.4 : 1 }}
          aria-label="Стереть последнее"
          title="Стереть последнее"
        >
          <Delete className="w-6 h-6 text-ink-soft" />
        </button>
        <button
          onClick={clearPhrase}
          disabled={phrase.length === 0}
          className="w-14 border border-line rounded-[18px] bg-white flex items-center justify-center active:scale-[0.94] transition-transform"
          style={{ opacity: phrase.length === 0 ? 0.4 : 1 }}
          aria-label="Очистить"
          title="Очистить"
        >
          <Trash2 className="w-6 h-6 text-[#c56a6a]" />
        </button>
      </div>

      {/* ВЫБИРАЙ СЛОВА label */}
      <div className="px-5 pt-2 pb-1 text-[13px] font-black text-ink-soft tracking-wide">
        ВЫБИРАЙ СЛОВА
      </div>

      {/* Word grid 3-col, color-coded by function */}
      <div className="grid grid-cols-3 gap-3 px-5 pb-2">
        {VOCAB.map((word, i) => {
          const funcStyle = FUNC_STYLES[word.func];
          const used = phrase.includes(word.text);
          const isSpeaking = speaking === word.text;
          const WordIcon = word.icon;
          return (
            <button
              key={`${word.text}-${i}`}
              onClick={() => toggleWord(word.text)}
              className="bg-white border border-line rounded-[18px] cursor-pointer py-3 px-1.5 flex flex-col items-center gap-1.5 min-h-[92px] active:scale-[0.93] transition-transform"
              style={{
                boxShadow: '0 4px 14px rgba(23,48,57,0.07)',
                opacity: used ? 0.5 : 1,
                outline: used ? `2px solid ${funcStyle.icon}` : 'none',
                outlineOffset: used ? '-2px' : 0,
                animation: isSpeaking ? 'speak-pulse 280ms ease-out both' : undefined,
              }}
              aria-label={`Добавить «${word.text}»`}
              aria-pressed={used}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ background: funcStyle.bg }}
              >
                <WordIcon size={30} animated={false} />
              </div>
              <div
                className="text-sm font-black text-center leading-tight"
                style={{ color: funcStyle.text }}
              >
                {word.text}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 px-5 pt-2 pb-1 text-[11px] text-ink-soft font-semibold">
        {(Object.keys(FUNC_STYLES) as WordFunction[]).map((f) => {
          const s = FUNC_STYLES[f];
          return (
            <span key={f} className="inline-flex items-center gap-1.5 font-bold">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: s.icon }}
              />
              {s.label}
            </span>
          );
        })}
      </div>

      <div style={{ height: 12 }} />

      {/* Success overlay */}
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(234,245,255,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-3xl px-8 py-6 shadow-card-hover text-center max-w-xs">
            <div className="text-5xl mb-2">✓</div>
            <p className="text-lg font-black text-ink">Мама увидит фразу</p>
            <p className="text-sm text-muted mt-1">Спасибо, что сказал</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes phrase-pop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes speak-pulse {
          0%   { transform: scale(1);    box-shadow: 0 4px 14px rgba(23,48,57,0.07); }
          35%  { transform: scale(1.07); box-shadow: 0 4px 14px rgba(7,149,139,0.32); }
          100% { transform: scale(1);    box-shadow: 0 4px 14px rgba(23,48,57,0.07); }
        }
      `}</style>
    </div>
  );
};
