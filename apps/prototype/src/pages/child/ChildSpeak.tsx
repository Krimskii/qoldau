import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { VoiceWave } from '@/components/ui/VoiceWave';

export const ChildSpeak: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);

  const handleMic = () => {
    if (isRecording) {
      setIsRecording(false);
      setHeard('ва');
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHeard('ва');
      }, 3000);
    }
  };

  const examples = ['вода', 'мама', 'домой'];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/child/home')} className="text-3xl font-black text-[#203a60]">‹</button>
        <h2 className="text-lg font-black text-[#143259]">Нажми и скажи</h2>
        <div className="w-8" />
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        {/* Mic Button */}
        <button
          onClick={handleMic}
          className="w-[168px] h-[168px] rounded-full bg-gradient-to-br from-[#10c8bd] to-[#008982] flex items-center justify-center shadow-[0_0_0_16px_rgba(0,150,143,0.08),0_0_0_32px_rgba(0,150,143,0.045),0_20px_34px_rgba(0,150,143,0.22)]"
        >
          <Mic className="w-[88px] h-[88px] text-white" />
        </button>

        {isRecording && <VoiceWave bars={10} />}

        {heard && !isRecording && (
          <div className="text-center">
            <p className="text-sm font-bold text-[#657a97] mb-2">Я услышал: «{heard}»</p>
            <p className="text-sm font-bold text-teal">Возможно: вода</p>
            <div className="flex gap-2 justify-center mt-4">
              <button className="px-6 py-2 rounded-full bg-[#e8faef] font-bold">Да</button>
              <button className="px-6 py-2 rounded-full bg-[#ffeceb] font-bold">Нет</button>
            </div>
          </div>
        )}
      </div>

      {!heard && (
        <div className="text-center text-[#657a97] font-bold mb-4">Например:</div>
      )}

      {!heard && (
        <div className="flex gap-2 justify-center flex-wrap">
          {examples.map((ex) => (
            <span key={ex} className="border border-[#dce9f4] bg-white rounded-full px-5 py-2 text-sm font-bold text-[#365579]">
              {ex}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
