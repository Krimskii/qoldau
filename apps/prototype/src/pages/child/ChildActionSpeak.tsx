import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon, Pause2DIcon } from '@/components/icons/child2d';
import { X, Volume2 } from 'lucide-react';

/**
 * Конфиг для ChildActionSpeak — контекстно-зависимый sub-page.
 * Используется для /child/water, /child/food, /child/toilet.
 */
export interface ActionSpeakConfig {
  /** id действия (water | food | toilet) */
  actionId: 'water' | 'food' | 'toilet';
  /** Заголовок страницы, например "Хочу пить" */
  title: string;
  /** Цветовая схема (для accent-кнопок, чипов) */
  accent: {
    from: string;  // hex для градиента
    to: string;    // hex для градиента
    text: string;  // hex для текста
    chipBg: string;
    chipText: string;
    /**
     * Акцентный фон для ВЫБРАННОГО (in-phrase) состояния главной кнопки.
     * Если не задан — используется chipBg.
     */
    selectedBg?: string;
    selectedText?: string;
  };
  /** Большая иконка (из child2d.tsx) */
  HeroIcon: React.FC<{ size?: number; animated?: boolean }>;
  /**
   * 3 главные кнопки — БОЛЬШИЕ (явные). Каждая добавляет/убирает своё слово из фразы.
   * 1-й символ label используется как буква на иконке.
   */
  mainWords: Array<{
    id: string;
    label: string;
    spoken: string;
    hint: string;
  }>;
  /** Слова для нижней сетки (вспомогательные, меньше). Опционально. */
  phraseWords?: Array<{ text: string; bg: string; color: string; wide?: boolean }>;
  /** Включить ли timer card (только для toilet) */
  showTimer?: boolean;
  /** Длительность таймера по умолчанию (сек), дефолт 300 (5 мин) */
  timerSeconds?: number;
  /** Event type для addEvent */
  eventType: 'water' | 'food' | 'toilet';
  /** Title события (рус.) */
  eventTitle: string;
  /** Описание для события по типу */
  makeEventDescription: (params: { phrase: string }) => string;
}

interface ChildActionSpeakProps {
  config: ActionSpeakConfig;
}

const DEFAULT_PHRASE_WORDS = [
  { text: 'Я',          bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
  { text: 'хочу',       bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
  { text: 'ещё',       bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]' },
  { text: 'не хочу',    bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
  { text: 'пожалуйста', bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]', wide: true },
];

/**
 * ChildActionSpeak — общий sub-page для /child/water | /child/food | /child/toilet.
 *
 * UX (v0.3.20):
 * - Hero (96×96) + title.
 * - **3 БОЛЬШИЕ кнопки** (явные): нажатие → слово добавляется в фразу
 *   с анимацией «произносится» (qoldau-speak-pulse, 280 мс). Повторное нажатие
 *   → слово тихо исчезает из фразы (opacity 0 за 300 мс, потом удаляется из state).
 * - Phrase strip — показывает выбранные слова, анимация pop-in / fade-out.
 * - «Сказать фразу» (teal big button) — появляется только если фраза не пустая.
 * - **Нижние чипы** (вспомогательные, меньше) — та же механика toggle.
 * - Timer (toilet only) — start/stop, 5 мин.
 *
 * Большой микрофон удалён: эти страницы про СОСТАВЛЕНИЕ фразы, а не про voice recording.
 * Voice input — на отдельной /child/speak.
 */
export const ChildActionSpeak: React.FC<ChildActionSpeakProps> = ({ config }) => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const [phrase, setPhrase] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Анимации состояний
  const [speaking, setSpeaking] = useState<string | null>(null);     // последнее «произнесённое» слово
  const [removing, setRemoving] = useState<string | null>(null);     // слово, которое сейчас «уходит»
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer state
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSec = config.timerSeconds ?? 300;

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

  // Cleanup any pending remove timer on unmount
  useEffect(() => {
    return () => {
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, []);

  /**
   * Toggle: нажатие на слово.
   * - Если слова нет в фразе → добавляем с speak-pulse.
   * - Если есть → запускаем fade-out, через 300мс удаляем.
   */
  const toggleWord = (text: string) => {
    // Reset предыдущего "removing" если оно есть — нельзя два remove параллельно
    if (removeTimerRef.current) {
      clearTimeout(removeTimerRef.current);
      removeTimerRef.current = null;
      // Если был в процессе remove, но юзер передумал — сначала отменим, потом снова нажмёт
    }
    setRemoving(null);

    if (phrase.includes(text)) {
      // Удаляем с анимацией
      setRemoving(text);
      removeTimerRef.current = setTimeout(() => {
        setPhrase((prev) => prev.filter((w) => w !== text));
        setRemoving(null);
        removeTimerRef.current = null;
      }, 300);
    } else {
      // Добавляем с «произносится» эффектом
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

  const words = config.phraseWords ?? DEFAULT_PHRASE_WORDS;
  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Цвета для состояний главной кнопки
  const selectedBg = config.accent.selectedBg ?? config.accent.chipBg;
  const selectedText = config.accent.selectedText ?? config.accent.chipText;

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
      <div className="flex flex-col items-center mt-3 mb-1">
        <div
          className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-card"
          style={{
            background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
          }}
        >
          <config.HeroIcon size={80} animated={false} />
        </div>
      </div>

      {/* 3 БОЛЬШИЕ кнопки (явные) — toggle в фразу */}
      <div className="grid grid-cols-3 gap-3.5 px-5 mt-2">
        {config.mainWords.map((w) => {
          const inPhrase = phrase.includes(w.label);
          const isSpeaking = speaking === w.label;
          return (
            <button
              key={w.id}
              onClick={() => toggleWord(w.label)}
              className={`flex flex-col items-center gap-2 px-2 py-3 rounded-2xl shadow-card cursor-pointer min-h-[120px] transition-all duration-200 active:scale-[0.94] ${
                inPhrase
                  ? 'ring-2 ring-teal border-teal'
                  : 'bg-white hover:-translate-y-0.5 hover:shadow-card-lg'
              } ${isSpeaking ? 'qoldau-speak-pulse' : ''}`}
              style={inPhrase ? { background: selectedBg } : undefined}
              aria-label={`${w.label} — ${inPhrase ? 'убрать из фразы' : 'добавить в фразу'}`}
              aria-pressed={inPhrase}
            >
              <div
                className={`w-16 h-16 rounded-[18px] flex items-center justify-center text-2xl font-black ${
                  inPhrase ? '' : ''
                }`}
                style={{
                  background: inPhrase ? '#ffffff' : config.accent.chipBg,
                  color: inPhrase ? selectedText : config.accent.chipText,
                }}
              >
                {w.label.slice(0, 1).toUpperCase()}
              </div>
              <div
                className={`text-base font-black leading-tight ${
                  inPhrase ? 'text-ink' : 'text-ink'
                }`}
              >
                {w.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint — подсказка как произносить */}
      <div className="text-ink-soft font-bold text-sm mt-3 text-center px-5">
        Нажми на слово — оно добавится. Нажми ещё раз — уберётся.
      </div>

      {/* Phrase strip */}
      <div className="mx-5 mt-3 min-h-[60px] bg-white rounded-[20px] shadow-card flex items-center gap-2 p-3 flex-wrap">
        {phrase.length === 0 ? (
          <span className="text-muted font-bold px-2">
            Собирай слова выше ↓ или ниже
          </span>
        ) : (
          <>
            {phrase.map((w, i) => {
              const isRemoving = removing === w;
              return (
                <span
                  key={`${w}-${i}-${phrase.length}`}
                  className="font-black px-3 py-2 rounded-[12px] text-sm transition-all duration-300 ease-out"
                  style={{
                    background: config.accent.chipBg,
                    color: config.accent.chipText,
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'scale(0.85)' : 'scale(1)',
                    animation: isRemoving ? undefined : 'qoldau-fade-in-up 240ms ease-out both',
                  }}
                >
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

      {/* Timer card (опционально, для toilet) */}
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

      {/* Lower word grid — smaller chips (вспомогательные) */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs font-bold text-muted mb-2 px-1">Дополнительные слова</p>
        <div className="grid grid-cols-3 gap-2">
          {words.map((word, i) => {
            const used = phrase.includes(word.text);
            const isSpeaking = speaking === word.text;
            return (
              <button
                key={i}
                onClick={() => toggleWord(word.text)}
                className={`min-h-[48px] rounded-xl ${word.bg} flex items-center justify-center font-bold text-sm ${word.color} ${
                  word.wide ? 'col-span-3' : ''
                } transition-all duration-200 ease-out active:scale-[0.94] shadow-card ${
                  used ? 'ring-2 ring-teal/50 opacity-60' : ''
                } ${isSpeaking ? 'qoldau-speak-pulse' : ''}`}
                aria-label={`Добавить слово ${word.text}`}
                aria-pressed={used}
              >
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
