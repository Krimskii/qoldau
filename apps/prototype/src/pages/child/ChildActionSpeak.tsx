import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon, Pause2DIcon } from '@/components/icons/child2d';
import { Mic, X } from 'lucide-react';

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
  };
  /** Большая иконка (из child2d.tsx) */
  HeroIcon: React.FC<{ size?: number; animated?: boolean }>;
  /** 3 кнопки-слова (как в ChildSpeak) */
  speakWords: Array<{
    id: string;
    label: string;
    spoken: string;
    hint: string;
  }>;
  /** Слова для phrase-builder (опционально, дефолт — общий набор) */
  phraseWords?: Array<{ text: string; bg: string; color: string; wide?: boolean }>;
  /** Включить ли timer card (только для toilet) */
  showTimer?: boolean;
  /** Длительность таймера по умолчанию (сек), дефолт 300 (5 мин) */
  timerSeconds?: number;
  /** Лейбл подсказки для микрофона */
  micHint: string;
  /** Дополнительное сообщение в phrase strip (опционально) */
  phraseHint?: string;
  /** Event type для addEvent */
  eventType: 'water' | 'food' | 'toilet';
  /** Title события (рус.) */
  eventTitle: string;
  /** Описание для события по типу (с поддержкой {spoken}/{phrase}) */
  makeEventDescription: (params: {
    spoken?: string;
    phrase?: string;
    finishedTimer?: boolean;
  }) => string;
}

interface ChildActionSpeakProps {
  config: ActionSpeakConfig;
}

const DEFAULT_PHRASE_WORDS = [
  { text: 'Я',       bg: 'bg-[#EAF8F0]', color: 'text-[#158647]' },
  { text: 'хочу',    bg: 'bg-[#FFF6DF]', color: 'text-[#9a7820]' },
  { text: 'ещё',     bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]' },
  { text: 'не хочу', bg: 'bg-[#F3F6FA]', color: 'text-[#53677e]', wide: true },
  { text: 'пожалуйста', bg: 'bg-[#F1EDFF]', color: 'text-[#5a3eb4]', wide: true },
];

/**
 * ChildActionSpeak — общий sub-page для /child/water | /child/food | /child/toilet.
 *
 * Структура (как в ChildSpeak, расширенная):
 * - Back + title.
 * - Hero: большая цветная иконка (96×96) с лёгкой пульсацией.
 * - Большой микрофон (150×150) — старт/стоп записи (mock).
 * - Heard area (32px текст).
 * - 3 кнопки-слова (контекстные).
 * - Phrase builder (опционально) — собирает фразу.
 * - Timer card (опционально, для туалета) — старт/стоп, лог события.
 * - «Сказать фразу» big teal button (когда фраза не пустая).
 */
export const ChildActionSpeak: React.FC<ChildActionSpeakProps> = ({ config }) => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const [isRecording, setIsRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [phrase, setPhrase] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

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
        // Авто-стоп по достижению
        clearInterval(intervalRef.current!);
        setTimerFinished(true);
      }
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStartedAt, totalSec]);

  const toggleRec = () => {
    if (isRecording) {
      setIsRecording(false);
      // Пример «распознанного» слова — берём первый speakWord как имитацию
      const first = config.speakWords[0];
      setHeard(first.hint);
      return;
    }
    setIsRecording(true);
    setHeard(null);
  };

  const sayWord = (w: typeof config.speakWords[number]) => {
    setHeard(`${w.spoken} («${w.hint}»)`);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: config.eventType,
      title: config.eventTitle,
      description: config.makeEventDescription({ spoken: w.spoken }),
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { action: config.actionId, source: 'voice', heard: w.hint },
    });
  };

  const addWord = (word: string) => setPhrase([...phrase, word]);
  const clearPhrase = () => setPhrase([]);

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
        description: config.makeEventDescription({ finishedTimer: true }),
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

      {/* Hero icon — большой 96×96 (планшет-friendly) */}
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

      {/* Big mic */}
      <button
        onClick={toggleRec}
        className={`mx-auto my-4 w-[150px] h-[150px] rounded-full border-0 cursor-pointer flex items-center justify-center relative ${
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
        <Mic className="w-16 h-16 text-white" strokeWidth={2.5} />
      </button>

      {/* Hint */}
      <div className="text-ink-soft font-bold text-[17px] mt-1.5 text-center">
        {isRecording ? 'Слушаю… говори' : config.micHint}
      </div>

      {/* Heard area */}
      <div
        className="mx-5 my-4 bg-white rounded-[20px] p-5 shadow-card text-[32px] font-black min-h-[40px] flex items-center justify-center"
        style={{ color: config.accent.text }}
        aria-live="polite"
      >
        {heard ?? '…'}
      </div>

      {/* 3 word buttons */}
      <div className="grid grid-cols-3 gap-3.5 px-5">
        {config.speakWords.map((w, i) => (
          <button
            key={w.id}
            onClick={() => sayWord(w)}
            className="qoldau-icon-pop flex flex-col items-center gap-2 px-2 py-3 bg-white rounded-2xl shadow-card cursor-pointer min-h-[88px] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.94]"
            style={{ animationDelay: `${i * 60}ms` }}
            aria-label={w.label}
          >
            <div
              className="w-12 h-12 rounded-[16px] flex items-center justify-center text-xl font-black"
              style={{ background: config.accent.chipBg, color: config.accent.chipText }}
            >
              {w.label.slice(0, 1)}
            </div>
            <div className="text-sm font-black text-ink leading-tight">
              {w.label}
            </div>
          </button>
        ))}
      </div>

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
                {config.phraseHint ?? 'Запусти таймер, когда пойдёшь. Можно остановить в любой момент.'}
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

      {/* Phrase builder strip */}
      <div className="mx-5 mt-5 min-h-[64px] bg-white rounded-[20px] shadow-card flex items-center gap-2 p-3 flex-wrap">
        {phrase.length === 0 ? (
          <span className="text-muted font-bold px-2">
            {config.phraseHint ?? 'Собрать фразу →'}
          </span>
        ) : (
          <>
            {phrase.map((w, i) => (
              <span
                key={i}
                className="qoldau-icon-pop font-black px-3 py-2 rounded-[12px] text-sm"
                style={{ background: config.accent.chipBg, color: config.accent.chipText }}
              >
                {w}
              </span>
            ))}
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
          className="mx-5 mt-3 mb-3 border-0 rounded-[18px] p-4 text-white font-black text-[17px] cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform"
          style={{
            background: `linear-gradient(135deg, ${config.accent.from} 0%, ${config.accent.to} 100%)`,
            boxShadow: `0 8px 20px ${config.accent.from}55`,
          }}
        >
          Сказать фразу
        </button>
      )}

      {/* Word grid для phrase-builder */}
      <div className="grid grid-cols-3 gap-2.5 px-5 pb-4">
        {words.map((word, i) => {
          const used = phrase.includes(word.text);
          return (
            <button
              key={i}
              onClick={() => addWord(word.text)}
              className={`min-h-[52px] rounded-2xl ${word.bg} flex items-center justify-center font-black text-base ${word.color} ${
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
