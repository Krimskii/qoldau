import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MicButton } from '@/components/ui/MicButton';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { PageHeader } from '@/components/layout/PageHeader';

export const TutorVoice: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      navigate('/tutor/ai-review');
    } else {
      setIsRecording(true);
      setDuration(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const examples = [
    'Отказался от задания, начал нервничать',
    'Сходил в туалет, стул нормальный',
    'Попросил паузу, посидели тихо',
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Запись наблюдения"
        subtitle="Говорите обычным языком"
        showBack
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        <MicButton isRecording={isRecording} onClick={handleRecord} size="xl" />

        {isRecording && (
          <>
            <VoiceWave />
            <div className="text-3xl font-black tracking-wider">
              {formatDuration(duration)}
              <span className="inline-block w-2 h-2 rounded-full bg-[#EF5A5A] ml-2 animate-pulse" />
            </div>
          </>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-ink-2 mb-2">Примеры</p>
        <div className="flex flex-col gap-2">
          {examples.map((ex, i) => (
            <div key={i} className="text-xs border border-line bg-white rounded-xl p-2.5 text-ink-2">
              {ex}
            </div>
          ))}
        </div>
      </div>

      {isRecording && (
        <button
          onClick={handleRecord}
          className="w-full border border-teal rounded-xl bg-white text-teal-dark font-bold py-3"
        >
          Остановить запись
        </button>
      )}
    </div>
  );
};
