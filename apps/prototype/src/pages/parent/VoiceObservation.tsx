import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { VoiceWave } from '@/components/ui/VoiceWave';

export const VoiceObservation: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setDuration(0);
    intervalRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    navigate('/parent/ai-review');
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRecord = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const examples = [
    'Он поел кашу с сыром',
    'Сходили в туалет, стул нормальный',
    'Начал нервничать, закрывал уши',
    'Сказал «ва» и потянулся к воде',
  ];

  return (
    <div className="flex flex-col gap-6 min-h-[70vh]">
      <PageHeader
        title="Говорите обычным языком"
        subtitle="AI поймёт и предложит структуру"
        showBack
      />

      {/* Recording zone — центральный фокус */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        {/* Большая круглая кнопка-микрофон */}
        <button
          onClick={handleRecord}
          aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
          className={`w-48 h-48 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isRecording
              ? 'bg-gradient-to-br from-coral to-[#cc251d]'
              : 'bg-gradient-to-br from-teal to-teal-dark'
          }`}
          style={{
            boxShadow: isRecording
              ? '0 0 0 20px rgba(229,111,93,0.10), 0 0 0 40px rgba(229,111,93,0.05), 0 24px 40px rgba(229,111,93,0.30)'
              : '0 0 0 20px rgba(0,150,136,0.08), 0 0 0 40px rgba(0,150,136,0.045), 0 24px 40px rgba(0,150,136,0.25)',
          }}
        >
          {isRecording ? (
            <MicOff className="w-24 h-24 text-white" strokeWidth={2.5} />
          ) : (
            <Mic className="w-24 h-24 text-white" strokeWidth={2.5} />
          )}
        </button>

        {/* Волна */}
        {isRecording && (
          <div className="w-full max-w-xs">
            <VoiceWave />
          </div>
        )}

        {/* Таймер */}
        {isRecording && (
          <div className="text-3xl font-black text-ink tabular-nums">
            {formatDuration(duration)}
          </div>
        )}

        {/* Hint text */}
        {!isRecording && (
          <p className="text-sm text-muted text-center max-w-xs">
            Нажмите на кнопку и расскажите, что произошло.
            AI предложит структуру наблюдения.
          </p>
        )}
      </div>

      {/* Примеры фраз */}
      <div>
        <p className="text-xs font-bold text-muted mb-2 px-1">
          Примеры наблюдений
        </p>
        <div className="flex flex-col gap-2">
          {examples.map((ex, i) => (
            <div
              key={i}
              className="text-sm border border-line-soft bg-white rounded-2xl px-4 py-2.5 text-ink-2"
            >
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* Stop button */}
      {isRecording && (
        <button
          onClick={handleRecord}
          className="w-full h-13 rounded-2xl bg-coral text-white font-bold text-base shadow-card active:scale-[0.98] transition-all"
        >
          Остановить запись
        </button>
      )}
    </div>
  );
};