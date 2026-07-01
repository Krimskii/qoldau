import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

// Анимированная волна — больше баров, ярче анимация при записи
const VoiceWave: React.FC<{ active?: boolean }> = ({ active = true }) => {
  return (
    <div
      className={`flex items-end justify-center gap-1.5 h-16 px-4 ${
        active ? 'wave-animation-active' : ''
      }`}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 bg-teal rounded-full inline-block"
          style={{
            height: '40%',
            animation: active
              ? `waveBar 0.8s ease-in-out ${i * 0.07}s infinite alternate`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0% { height: 25%; }
          100% { height: 90%; }
        }
      `}</style>
    </div>
  );
};

export const ChildSpeak: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { addEvent } = useEventStore();

  // Авто-имитация после 3 сек записи
  useEffect(() => {
    if (!isRecording) return;
    const id = setTimeout(() => {
      setIsRecording(false);
      setHeard('ва');
      setSuggestion('вода');
    }, 3000);
    return () => clearTimeout(id);
  }, [isRecording]);

  const handleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      setHeard('ва');
      setSuggestion('вода');
      return;
    }
    setIsRecording(true);
    setHeard(null);
    setSuggestion(null);
  };

  const handleConfirm = () => {
    if (!heard) return;
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'communication',
      title: 'Голосовой запрос',
      description: `Сказал: «${heard}». Похоже, это может быть связано с водой. Нужно подтвердить.`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { heard, suggestion, source: 'voice' },
    });
    setHeard(null);
    setSuggestion(null);
  };

  const handleReject = () => {
    setHeard(null);
    setSuggestion(null);
  };

  const examples = ['вода', 'мама', 'домой'];

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
        <h2 className="text-lg font-black text-[#143259]">Нажми и скажи</h2>
        <button
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Очистить"
        >
          <span className="text-2xl text-[#53677e]">⌫</span>
        </button>
      </div>

      {/* Большая зона с микрофоном — занимает основную часть */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        {/* Кнопка-микрофон — крупнее, мягкое свечение */}
        <button
          onClick={handleMic}
          aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
          className={`w-[180px] h-[180px] rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-gradient-to-br from-coral to-[#cc251d] scale-110'
              : 'bg-gradient-to-br from-[#10c8bd] to-[#008982] hover:scale-105'
          }`}
          style={{
            boxShadow: isRecording
              ? '0 0 0 18px rgba(229,111,93,0.10), 0 0 0 36px rgba(229,111,93,0.05), 0 22px 36px rgba(229,111,93,0.30)'
              : '0 0 0 18px rgba(0,150,143,0.08), 0 0 0 36px rgba(0,150,143,0.045), 0 22px 36px rgba(0,150,143,0.22)',
          }}
        >
          <Mic className="w-24 h-24 text-white" strokeWidth={2.5} />
        </button>

        {/* Волна только когда идёт запись */}
        {isRecording && (
          <div className="w-full max-w-xs">
            <VoiceWave active />
          </div>
        )}

        {/* Расшифровка */}
        {heard && !isRecording && (
          <div
            role="status"
            aria-live="polite"
            className="text-center bg-white border-2 border-teal/30 rounded-3xl px-8 py-5 animate-fade-in"
          >
            <p className="text-base font-black text-[#657a97] mb-1">Я услышал: «{heard}»</p>
            {suggestion && (
              <p className="text-base font-black text-teal">
                Похоже: {suggestion} <span className="text-muted text-xs">(нужно подтвердить)</span>
              </p>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={handleConfirm}
                className="px-7 py-3 rounded-full bg-[#e8faef] font-black text-green text-base hover:bg-green hover:text-white transition-colors"
              >
                Да ✓
              </button>
              <button
                onClick={handleReject}
                className="px-7 py-3 rounded-full bg-[#ffeceb] font-black text-coral text-base hover:bg-coral hover:text-white transition-colors"
              >
                Нет ✕
              </button>
            </div>
          </div>
        )}

        {!heard && !isRecording && (
          <p className="text-center text-[#657a97] font-bold text-sm">
            Нажми на кнопку и скажи слово
          </p>
        )}
      </div>

      {/* Примеры */}
      {!heard && !isRecording && (
        <div>
          <p className="text-center text-[#657a97] font-bold mb-3 text-sm">Например:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {examples.map((ex) => (
              <span
                key={ex}
                className="border-2 border-[#dce9f4] bg-white rounded-full px-6 py-2.5 text-sm font-black text-[#365579]"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};