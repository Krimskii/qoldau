import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

export const ChildSpeak: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { addEvent } = useEventStore();

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
    setTimeout(() => {
      setIsRecording(false);
      setHeard('ва');
      setSuggestion('вода');
    }, 3000);
  };

  const handleConfirm = () => {
    if (!heard) return;
    // Create communication event with the heard phrase
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="text-3xl font-black text-[#203a60]"
          aria-label="Назад"
        >
          ‹
        </button>
        <h2 className="text-lg font-black text-[#143259]">Нажми и скажи</h2>
        <div className="w-8" />
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        {/* Mic Button */}
        <button
          onClick={handleMic}
          className={`w-[168px] h-[168px] rounded-full flex items-center justify-center shadow-[0_0_0_16px_rgba(0,150,143,0.08),0_0_0_32px_rgba(0,150,143,0.045),0_20px_34px_rgba(0,150,143,0.22)] ${
            isRecording
              ? 'bg-gradient-to-br from-coral to-[#cc251d] animate-pulse'
              : 'bg-gradient-to-br from-[#10c8bd] to-[#008982]'
          }`}
          aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
        >
          <Mic className="w-[88px] h-[88px] text-white" />
        </button>

        {isRecording && <VoiceWave bars={10} />}

        {heard && !isRecording && (
          <div className="text-center animate-fade-in">
            <p className="text-sm font-bold text-[#657a97] mb-2">Я услышал: «{heard}»</p>
            {suggestion && (
              <p className="text-sm font-bold text-teal mb-4">
                Похоже: {suggestion} (нужно подтвердить)
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirm}
                className="px-6 py-3 rounded-full bg-[#e8faef] font-bold text-green hover:bg-green hover:text-white transition-colors"
              >
                Да ✓
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-3 rounded-full bg-[#ffeceb] font-bold text-coral hover:bg-coral hover:text-white transition-colors"
              >
                Нет ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {!heard && !isRecording && (
        <>
          <div className="text-center text-[#657a97] font-bold mb-2">Например:</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {examples.map((ex) => (
              <span
                key={ex}
                className="border border-[#dce9f4] bg-white rounded-full px-5 py-2 text-sm font-bold text-[#365579]"
              >
                {ex}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};