import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import {
  BackArrowIcon,
  Pause2DIcon,
  Sparkle2DIcon,
} from '@/components/icons/child2d';
import { X, Volume2, Mic, MicOff } from 'lucide-react';

/** Тип для 2D-иконки из child2d.tsx (принимает size/animated/className) */
type IconComponent = React.FC<{ size?: number; animated?: boolean; className?: string }>;

/** Слово с иконкой для главных кнопок и нижних чипов. */
export interface WordWithIcon {
  text: string;
  icon: IconComponent;
  /** Доп. фон (если хочется переопределить дефолтный chipBg) */
  bg?: string;
  color?: string;
  wide?: boolean;
}

/**
 * Конфиг для ChildActionSpeak — контекстно-зависимый sub-page.
 * Используется для /child/water, /child/food, /child/toilet.
 */
export interface ActionSpeakConfig {
  actionId: 'water' | 'food' | 'toilet';
  title: string;
  /** Цветовая схема */
  accent: {
    from: string;
    to: string;
    text: string;
    chipBg: string;
    chipText: string;
  };
  HeroIcon: IconComponent;
  /** 3 главные кнопки (явные, БОЛЬШИЕ) — каждая с иконкой */
  mainWords: Array<{
    id: string;
    label: string;
    spoken: string;
    hint: string;
    icon: IconComponent;
  }>;
  /** Слова для нижней сетки (вспомогательные, меньше) — каждое с иконкой */
  phraseWords: WordWithIcon[];
  /** Показывать timer card (toilet only) */
  showTimer?: boolean;
  /** Длительность таймера (сек), дефолт 300 (5 мин) */
  timerSeconds?: number;
  eventType: 'water' | 'food' | 'toilet';
  eventTitle: string;
  makeEventDescription: (params: { phrase: string }) => string;
}

interface ChildActionSpeakProps {
  config: ActionSpeakConfig;
}

/** Дефолтные «без иконки»-заглушки — иконка-слот для слов без явной иконки. */
const FALLBACK_ICON: IconComponent = Sparkle2DIcon;

/**
 * ChildActionSpeak — общий sub-page для /child/water | /child/food | /child/toilet.
 *
 * UX (v0.3.21):
 * - **Hero** (96×96) + title.
 * - **Большой микрофон** (150×150, mock STT) — tap to record, показывает «heard».
 * - **3 БОЛЬШИЕ кнопки (явные)** с ПОЛНЫМИ 2D-иконками:
 *   - tap → слово добавляется в фразу с анимацией «произносится» (speak-pulse, 280 мс).
 *   - tap again → слово тихо исчезает из фразы (opacity 1→0 + scale 1→0.85, 300 мс).
 * - **Phrase strip** с иконкой + текстом каждого слова, pop-in / fade-out.
 * - «Сказать фразу» (teal big button) — только когда фраза не пустая.
 * - **Нижние чипы** (вспомогательные, меньше) — иконка + текст, та же механика toggle.
 * - **Timer** (toilet only) — start/stop, 5 мин.
 *
 * Никаких подсказок в UI — ребёнок сам разберётся через tactile feedback (speak-pulse).
 */
export const ChildActionSpeak: React.FC<ChildActionSpeakProps> = ({ config }) => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();

  // === State ===
  const [phrase, setPhrase] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mic state
  const [isRecording, setIsRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);

  // Анимации
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer state
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSec = config.timerSeconds ?? 300;

  // === Effects ===
  useEffect(() => {
    if (timerStartedAt === null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimerElapsed(0);
      return;
    }
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
      setTimerElapsed(elapsed);
      if (elapsed >= totalSec) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimerFinished(true);
      }
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStartedAt, totalSec]);

  useEffect(() => {
    return () => {
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, []);

  // === Handlers ===
  /** Mock STT: tap to record, tap again to stop. */
  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      // Имитация «распознанного» — берём первое mainWord.hint
      const first = config.mainWords[0];
      setHeard(first.hint);
      return;
    }
    setIsRecording(true);
    setHeard(null);
  };

  /** Toggle: tap → add with pulse, tap again → fade out. */
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
      type: config.eventType,
      title: config.eventTitle,
      description: config.makeEventDescription({ phrase: phraseText }),
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { action: config.actionId, source: 'phrase_builder', phrase: phraseText },
    });
    setShowSuccess(true);
    setPhrase([]);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/child/home');
    }, 1500);
  };

  // Timer handlers
  const startTimer = () => {
    setTimerStartedAt(Date.now());
    setTimerFinished(false);
  };
  const stopTimer = (finished: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerStartedAt(null);
    if (finished) {
      setTimerFinished(true);
      addEvent({
        childId: DEMO_PRIMARY_CHILD.id,
        type: config.eventType,
        title: config.eventTitle,
        description: config.makeEventDescription({ phrase: '[таймер · сходил]' }),
        timestamp: new Date().toISOString(),
        sourceRole: 'child',
        status: 'confirmed',
        payload: {
          action: config.actionId,
          source: 'timer',
          durationSec: timerElapsed,
        },
      });
    } else {
      setTimerFinished(false);
    }
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Helper: ищет icon по тексту в mainWords + phraseWords
  const findIcon = (text: string): IconComponent | null => {
    const fromMain = config.mainWords.find((w) => w.label === text);
    if (fromMain) return fromMain.icon;
    const fromPhrase = config.phraseWords.find((w) => w.text === text);
    if (fromPhrase) return fromPhrase.icon;
    return null;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">{config.title}</div>
      </div>

      {/* Hero icon — 96×96 */}
      <div className="flex flex-col items-center mt-3 mb-2">
        <div
          className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-card"
          style={{
            background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
          }}
        >
          <config.HeroIcon size={80} animated={false} />
        </div>
      </div>

      {/* Big mic — 150×150, mock STT */}
      <button
        onClick={toggleMic}
        className={`mx-auto my-3 w-[150px] h-[150px] rounded-full border-0 cursor-pointer flex items-center justify-center relative ${
          isRecording ? 'qoldau-icon-rec' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
          boxShadow: isRecording
            ? undefined
            : `0 14px 34px ${config.accent.from}55`,
        }}
        aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
      >
        {isRecording ? (
          <MicOff className="w-16 h-16 text-white" strokeWidth={2.5} />
        ) : (
          <Mic className="w-16 h-16 text-white" strokeWidth={2.5} />
        )}
      </button>

      {/* Heard area */}
      <div
        className="mx-5 mb-3 bg-white rounded-[20px] p-4 shadow-card text-[28px] font-black min-h-[40px] flex items-center justify-center"
        style={{ color: config.accent.text }}
        aria-live="polite"
      >
        {heard ?? (isRecording ? '…' : '')}
      </div>

      {/* 3 БОЛЬШИЕ кнопки (явные) с ИКОНКАМИ — toggle в фразу */}
      <div className="grid grid-cols-3 gap-3.5 px-5">
        {config.mainWords.map((w) => {
          const inPhrase = phrase.includes(w.label);
          const isSpeaking = speaking === w.label;
          return (
            <button
              key={w.id}
              onClick={() => toggleWord(w.label)}
              className={`flex flex-col items-center gap-2 px-2 py-3 rounded-2xl shadow-card cursor-pointer min-h-[130px] transition-all duration-200 active:scale-[0.94] ${
                inPhrase
                  ? 'ring-2 ring-teal border-teal'
                  : 'bg-white hover:-translate-y-0.5 hover:shadow-card-lg'
              } ${isSpeaking ? 'qoldau-speak-pulse' : ''}`}
              style={inPhrase ? { background: config.accent.chipBg } : undefined}
              aria-label={`${w.label} — ${inPhrase ? 'убрать из фразы' : 'добавить в фразу'}`}
              aria-pressed={inPhrase}
            >
              <div
                className="w-16 h-16 rounded-[18px] flex items-center justify-center"
                style={{ background: '#ffffff' }}
              >
                <w.icon size={56} animated={false} />
              </div>
              <div
                className="text-base font-black leading-tight"
                style={{ color: inPhrase ? config.accent.chipText : '#102A43' }}
              >
                {w.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Phrase strip — иконка + текст в каждом чипе */}
      <div className="mx-5 mt-4 min-h-[60px] bg-white rounded-[20px] shadow-card flex items-center gap-2 p-3 flex-wrap">
        {phrase.length === 0 ? (
          // Без подсказки — пустая полоса
          <span className="text-transparent select-none px-2">·</span>
        ) : (
          <>
            {phrase.map((w, i) => {
              const WordIcon = findIcon(w) ?? FALLBACK_ICON;
              const isRemoving = removing === w;
              return (
                <span
                  key={`${w}-${i}-${phrase.length}`}
                  className="font-black px-3 py-2 rounded-[12px] text-sm transition-all duration-300 ease-out flex items-center gap-1.5"
                  style={{
                    background: config.accent.chipBg,
                    color: config.accent.chipText,
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'scale(0.85)' : 'scale(1)',
                    animation: isRemoving ? undefined : 'qoldau-fade-in-up 240ms ease-out both',
                  }}
                >
                  <WordIcon size={20} animated={false} />
                  {w}
                </span>
              );
            })}
            <button
              onClick={clearPhrase}
              className="ml-auto w-8 h-8 rounded-xl border-0 font-black flex items-center justify-center"
              style={{ background: '#f4eaea', color: '#c95f5f' }}
              aria-label="Очистить фразу"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>

      {/* Send phrase button */}
      {phrase.length > 0 && (
        <button
          onClick={sendPhrase}
          className="mx-5 mt-3 border-0 rounded-[18px] p-4 text-white font-black text-[17px] cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform"
          style={{
            background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
            boxShadow: `0 8px 20px ${config.accent.from}55`,
          }}
        >
          <Volume2 className="w-5 h-5" />
          Сказать фразу
        </button>
      )}

      {/* Timer card (toilet only) */}
      {config.showTimer && (
        <div className="mx-5 mt-5 bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Pause2DIcon size={20} animated={false} />
            <div className="text-sm font-black text-ink">Таймер</div>
          </div>
          {timerStartedAt === null ? (
            <>
              <p className="text-sm text-muted leading-relaxed">
                Запусти таймер, когда пойдёшь. Можно остановить в любой момент.
              </p>
              <button
                onClick={startTimer}
                className="w-full mt-3 border-0 rounded-[18px] py-4 text-white text-[17px] font-black cursor-pointer transition-transform active:scale-[0.97]"
                style={{
                  background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
                  boxShadow: `0 8px 20px ${config.accent.from}55`,
                }}
              >
                ▶ Запустить таймер
              </button>
            </>
          ) : (
            <div className="text-center">
              <div
                className="text-[44px] font-black tabular-nums tracking-tight"
                style={{ color: config.accent.text }}
                aria-live="polite"
              >
                {formatTimer(timerElapsed)}
              </div>
              <p className="text-sm text-muted mt-1">
                {timerFinished ? 'Готово! Можно остановить' : 'Идёт отсчёт…'}
              </p>
              <button
                onClick={() => stopTimer(true)}
                className="w-full mt-3 border-0 rounded-[18px] py-4 text-white text-[17px] font-black cursor-pointer transition-transform active:scale-[0.97]"
                style={{
                  background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
                  boxShadow: `0 8px 20px ${config.accent.from}55`,
                }}
              >
                ⏹ Остановить и отметить
              </button>
              {timerFinished && (
                <p className="text-xs text-muted mt-2 italic">
                  Таймер закончился — отмечено «готово»
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lower word grid — маленькие чипы с ИКОНКАМИ */}
      <div className="px-5 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-2">
          {config.phraseWords.map((word, i) => {
            const used = phrase.includes(word.text);
            const isSpeaking = speaking === word.text;
            const WordIcon = word.icon;
            return (
              <button
                key={i}
                onClick={() => toggleWord(word.text)}
                className={`min-h-[48px] rounded-xl ${word.bg ?? 'bg-white'} flex items-center justify-center gap-1.5 font-bold text-sm ${word.color ?? 'text-ink-2'} ${
                  word.wide ? 'col-span-3' : ''
                } transition-all duration-200 ease-out active:scale-[0.94] shadow-card ${
                  used ? 'ring-2 ring-teal/50 opacity-60' : ''
                } ${isSpeaking ? 'qoldau-speak-pulse' : ''}`}
                aria-label={`Добавить слово ${word.text}`}
                aria-pressed={used}
              >
                <WordIcon size={20} animated={false} />
                {word.text}
              </button>
            );
          })}
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

      <div style={{ height: 12 }} />
    </div>
  );
};
