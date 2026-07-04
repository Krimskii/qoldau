import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Check, X, Volume2, Trash2 } from 'lucide-react';
import { BackArrowIcon } from '@/components/icons/child2d';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { layout } from '@/styles/tokens';
import { useElapsedTimer } from '@/hooks/useElapsedTimer';
import { formatDuration } from '@/utils/formatDuration';
import { speak } from '@/lib/tts/speak';

/** Грамматическая функция слова (определяет цвет плитки-иконки). */
export type WordFunc = 'pron' | 'verb' | 'noun' | 'soc';

export interface NeedWord {
  text: string;
  icon: React.FC<{ size?: number; animated?: boolean; className?: string }>;
  func: WordFunc;
}

export interface NeedCardConfig {
  /** Заголовок экрана (e.g. "Хочу пить") */
  title: string;
  /** Иконка потребности — отображается в шапке и как HeroIcon */
  HeroIcon: React.FC<{ size?: number; animated?: boolean; className?: string }>;
  /** Подсказка в пустой строке фразы (e.g. "Я хочу пить …") */
  phraseHint: string;
  /** 4 слова для 2×2 сетки */
  words: NeedWord[];
  /** event type для addEvent (water | food | toilet) */
  eventType: 'water' | 'food' | 'toilet';
  /** Title события */
  eventTitle: string;
  /** Описание события */
  makeEventDescription: (params: { phrase: string }) => string;
  /** Опциональный extra-блок (e.g. timer для туалета) */
  extra?: React.ReactNode;
}

const FUNC_STYLES: Record<WordFunc, { bg: string; text: string; iconColor: string }> = {
  pron: { bg: '#e8f2f8', text: '#245f7d', iconColor: '#3a90bd' },
  verb: { bg: '#e9f4ee', text: '#2a6647', iconColor: '#3f9a6a' },
  noun: { bg: '#f4ede2', text: '#6f5228', iconColor: '#b0864a' },
  soc:  { bg: '#eeecf7', text: '#564a86', iconColor: '#8172bd' },
};

/**
 * NeedCard (v0.3.24) — единый переиспользуемый шаблон «Карточка потребности».
 *
 * Используется на 3 экранах: «Хочу пить», «Хочу есть», «Хочу в туалет».
 * Отличаются только: иконка, заголовок, phraseHint, набор 4 слов.
 *
 * ЦЕЛЬ ЭКРАНА: ребёнок сообщает потребность. Может сказать голосом (большой
 * teal-микрофон) ИЛИ собрать фразу из 2×2 слов — на выбор. В ЛЮБОМ случае
 * может подтвердить крупными Да/Нет внизу — даже если фраза пустая.
 *
 * СТРУКТУРА (сверху вниз):
 * 1. Шапка: back + иконка потребности + заголовок.
 * 2. **Строка фразы** — dashed border (пустая) / solid teal (заполнена).
 *    Внутри chips: иконка 22px + текст 14px font-black.
 * 3. **Карточка «Сказать голосом»** — большая teal-кнопка с микрофоном.
 * 4. **Карточка «СОБРАТЬ ИЗ СЛОВ»** — 2×2 сетка слов с цветом по AAC-функции.
 * 5. Строка: «Озвучить фразу» (teal-50) + «очистить» (coral).
 * 6. Опциональный extra (timer для туалета).
 * 7. **Крупные ✓ Да / ✗ Нет** (88px каждая) — ВСЕГДА видны и активны.
 *
 * ПОВЕДЕНИЕ ПОДТВЕРЖДЕНИЯ:
 * - «Да» → addEvent с фразой (или без) → success-toast → /child/home.
 * - «Нет» → navigate(-1), без события.
 *
 * DESIGN_RULES: no ambient animations, only ≤300ms feedback,
 * `prefers-reduced-motion: reduce` отключает всё.
 */
export const NeedCard: React.FC<{ config: NeedCardConfig }> = ({ config }) => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();

  // Phrase state
  const [phrase, setPhrase] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mic state (no auto-stop — пользователь сам решает, когда сказать)
  const mic = useElapsedTimer();

  // Success overlay
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, []);

  /** Toggle: tap → add с speak-pulse, tap again → fade-out. */
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
      speak(text);
      setTimeout(() => setSpeaking((cur) => (cur === text ? null : cur)), 320);
    }
  };

  const clearPhrase = () => {
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    setPhrase([]);
    setRemoving(null);
  };

  const toggleMic = () => (mic.isActive ? mic.stop() : mic.start());

  const handleYes = () => {
    const phraseText = phrase.length > 0 ? phrase.join(' ') : '';
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: config.eventType,
      title: config.eventTitle,
      description: config.makeEventDescription({ phrase: phraseText }),
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        action: config.eventType,
        source: 'need_card',
        phrase: phraseText,
        voiceRecorded: mic.isActive || mic.seconds > 0,
        voiceDurationSec: mic.seconds,
      },
    });
    speak(phraseText || config.eventTitle);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/child/home');
    }, 1500);
  };

  const handleNo = () => {
    mic.reset();
    navigate(-1);
  };

  /** Озвучить собранную фразу — TTS + визуальный feedback. */
  const handleSpeak = () => {
    if (phrase.length === 0) return;
    const phraseText = phrase.join(' ');
    setSpeaking('__speak__');
    speak(phraseText);
    setTimeout(() => setSpeaking(null), 600);
  };

  return (
    <>
      {/* Main scrollable content — pb-[112px] reserves space for fixed Да/Нет */}
      <div className="flex flex-col min-h-[calc(100vh-80px)] pb-[112px]">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-[13px] border border-line bg-white flex items-center justify-center hover:bg-bg transition-colors"
            aria-label="Назад"
          >
            <BackArrowIcon size={20} />
          </button>
          <div className="text-xl font-black text-ink flex items-center gap-2">
            <span
              className="w-[26px] h-[26px] rounded-[9px] flex items-center justify-center"
              style={{ background: '#e9f7f5' }}
            >
              <config.HeroIcon size={20} animated={false} />
            </span>
            {config.title}
          </div>
        </div>

        {/* Phrase strip */}
        <div
          className="mx-4 mt-3 mb-1.5 min-h-[76px] bg-white rounded-[20px] flex items-center gap-2 p-3 flex-wrap transition-colors"
          style={{
            border: phrase.length > 0 ? '2px solid #7fd1c9' : '2px dashed #cfe0df',
          }}
        >
          {phrase.length === 0 ? (
            <span className="text-[#9fb3ba] font-bold text-[15px]">{config.phraseHint}</span>
          ) : (
            phrase.map((w, i) => {
              const word = config.words.find((x) => x.text === w);
              const WordIcon = word?.icon;
              const isRemoving = removing === w;
              return (
                <div
                  key={`${w}-${i}-${phrase.length}`}
                  className="flex flex-col items-center gap-0.5 rounded-[12px] px-2.5 pt-1.5 pb-1"
                  style={{
                    background: '#e9f7f5',
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'scale(0.85)' : 'scale(1)',
                    transition: 'all 300ms ease-out',
                    animation: isRemoving
                      ? undefined
                      : 'need-pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  }}
                >
                  {WordIcon && <WordIcon size={22} animated={false} />}
                  <span className="text-[14px] font-black leading-none" style={{ color: '#0d5c5c' }}>
                    {w}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Two paths: mic card (top) + words card (bottom) */}
        <div className="flex flex-col gap-2.5 px-5 pt-1.5 pb-1.5">
          {/* Mic card — large teal круг с подписью */}
          <button
            onClick={toggleMic}
            className="bg-white border border-line rounded-[20px] shadow-card p-3 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform"
            aria-label={mic.isActive ? 'Остановить запись' : 'Сказать голосом'}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: mic.isActive
                  ? 'linear-gradient(135deg, #E56F5D 0%, #cc251d 100%)'
                  : 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)',
                boxShadow: mic.isActive
                  ? '0 6px 16px rgba(229,111,93,0.34)'
                  : '0 6px 16px rgba(27,163,154,0.28)',
              }}
            >
              {mic.isActive ? (
                <MicOff className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <Mic className="w-8 h-8 text-white" strokeWidth={2.5} />
              )}
            </div>
            <div
              className="text-[13px] font-black text-center"
              style={{ color: mic.isActive ? '#c95f5f' : '#12807a' }}
            >
              {mic.isActive ? formatDuration(mic.seconds) : 'Сказать голосом'}
            </div>
          </button>

          {/* Words card — 2×2 сетка */}
          <div className="bg-white border border-line rounded-[20px] shadow-card p-2.5">
            <div className="text-[11px] font-black text-ink-soft tracking-wide px-1.5 mb-2">
              СОБРАТЬ ИЗ СЛОВ
            </div>
            <div className="grid grid-cols-2 gap-2">
              {config.words.map((word, i) => {
                const used = phrase.includes(word.text);
                const isSpeaking = speaking === word.text;
                const funcStyle = FUNC_STYLES[word.func];
                const WordIcon = word.icon;
                return (
                  <button
                    key={`${word.text}-${i}`}
                    onClick={() => toggleWord(word.text)}
                    className="border border-line rounded-[13px] bg-white py-2 px-1 flex flex-col items-center gap-0.5 active:scale-[0.92] transition-transform"
                    style={{
                      opacity: used ? 0.5 : 1,
                      outline: used ? `1.5px solid ${funcStyle.text}` : 'none',
                      animation: isSpeaking
                        ? 'need-speak-pulse 280ms ease-out both'
                        : undefined,
                    }}
                    aria-label={`Добавить «${word.text}»`}
                    aria-pressed={used}
                  >
                    <div
                      className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
                      style={{ background: funcStyle.bg }}
                    >
                      <WordIcon size={22} animated={false} />
                    </div>
                    <div
                      className="text-[12px] font-black text-center leading-tight"
                      style={{ color: funcStyle.text }}
                    >
                      {word.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Speak + clear row */}
        <div className="flex gap-2 px-5 pt-1.5 pb-1.5">
          <button
            onClick={handleSpeak}
            disabled={phrase.length === 0}
            className="flex-1 border-0 rounded-[15px] py-3 px-3 font-black text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={{
              background: phrase.length > 0 ? '#e9f7f5' : '#f4f8f8',
              color: phrase.length > 0 ? '#12807a' : '#9fb3ba',
              cursor: phrase.length === 0 ? 'not-allowed' : 'pointer',
              animation: speaking === '__speak__' ? 'need-speak-pulse 600ms ease-out both' : undefined,
            }}
          >
            <Volume2 className="w-[18px] h-[18px]" />
            Озвучить фразу
          </button>
          <button
            onClick={clearPhrase}
            disabled={phrase.length === 0}
            className="w-12 border border-line rounded-[15px] bg-white flex items-center justify-center active:scale-[0.94] transition-transform"
            style={{ opacity: phrase.length === 0 ? 0.4 : 1 }}
            aria-label="Очистить"
          >
            <Trash2 className="w-5 h-5 text-[#c56a6a]" />
          </button>
        </div>

        {/* Optional extra (timer for toilet) */}
        {config.extra && <div className="px-5 pt-1.5 pb-1.5">{config.extra}</div>}
      </div>

      {/* FIXED ✓ / ✗ — ВСЕГДА в поле зрения, над bottom nav (v0.3.25) */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 px-5 pointer-events-none"
        style={{ bottom: layout.bottomNavClearance }}
      >
        <div
          className="pointer-events-auto pt-3 pb-2"
          style={{
            background: 'linear-gradient(to top, #f4f8f8 60%, rgba(244,248,248,0))',
          }}
        >
          <div className="flex gap-3">
            <button
              onClick={handleYes}
              className="flex-1 h-[88px] border-0 rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
              style={{
                background: '#e9f4ee',
                color: '#3f9a6a',
                boxShadow: '0 6px 16px rgba(63,154,106,0.18)',
              }}
              aria-label="Подтвердить потребность"
            >
              <Check className="w-[38px] h-[38px]" strokeWidth={3} />
              <span className="text-base font-black">Да</span>
            </button>
            <button
              onClick={handleNo}
              className="flex-1 h-[88px] border-0 rounded-[22px] flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
              style={{
                background: '#f7ecec',
                color: '#c56a6a',
                boxShadow: '0 6px 16px rgba(197,106,106,0.16)',
              }}
              aria-label="Отменить"
            >
              <X className="w-[38px] h-[38px]" strokeWidth={3} />
              <span className="text-base font-black">Нет</span>
            </button>
          </div>
        </div>
      </div>

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
            <p className="text-lg font-black text-ink">Мама увидит</p>
            <p className="text-sm text-muted mt-1">Спасибо!</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes need-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes need-speak-pulse {
          0%   { transform: scale(1);    box-shadow: 0 4px 14px rgba(23,48,57,0.07); }
          35%  { transform: scale(1.06); box-shadow: 0 4px 14px rgba(7,149,139,0.32); }
          100% { transform: scale(1);    box-shadow: 0 4px 14px rgba(23,48,57,0.07); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
};
