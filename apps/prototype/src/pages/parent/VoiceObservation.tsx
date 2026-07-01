import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MicButton } from '@/components/ui/MicButton';
import { VoiceWave } from '@/components/ui/VoiceWave';

export const VoiceObservation: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording and go to AI review
      setIsRecording(false);
      navigate('/parent/ai-review');
    } else {
      // Start recording
      setIsRecording(true);
      setDuration(0);
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Store interval to clear later if needed
      (window as unknown as { recordInterval: NodeJS.Timeout }).recordInterval = interval;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const examples = [
    'Он поел кашу с сыром',
    'Сходили в туалет, стул жидкий',
    'Начал нервничать, закрывал уши',
    'Сказал «ба» и потянулся к воде',
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Говорите обычным языком"
        subtitle="AI поймёт и структурирует"
        showBack
      />

      {/* Recording Zone */}
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

        {!isRecording && (
          <p className="text-center text-muted">
            Нажмите на кнопку и начните говорить
          </p>
        )}
      </div>

      {/* Examples */}
      <div>
        <p className="text-xs font-bold text-ink-2 mb-2">Примеры фраз</p>
        <div className="flex flex-col gap-2">
          {examples.map((example, i) => (
            <div
              key={i}
              className="text-xs border border-line bg-white rounded-xl p-2.5 flex gap-2 items-center text-ink-2"
            >
              <span className="w-5 h-5 rounded-lg bg-[#F7FBFA] flex items-center justify-center">
                <span className="text-[8px]">💬</span>
              </span>
              {example}
            </div>
          ))}
        </div>
      </div>

      {/* Stop Button */}
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
