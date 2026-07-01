import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const contacts = [
  { id: 'mom', name: 'Позвать маму', emoji: '👩', bg: 'bg-[#eefbf2]' },
  { id: 'tutor', name: 'Позвать тьютора', emoji: '👨', bg: 'bg-[#edf6ff]' },
];

export const ChildCall: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addEvent } = useEventStore();

  const handleCall = (contact: typeof contacts[number]) => {
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: `SOS: ${contact.name}`,
      description: `Ребёнок нажал кнопку «${contact.name}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { contact: contact.id, source: 'call_button' },
    });
    setFeedback(contact.name);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="text-3xl font-black text-[#203a60]"
          aria-label="Назад"
        >
          ‹
        </button>
        <h2 className="text-lg font-black text-[#143259]">Позвать</h2>
        <div className="w-8" />
      </div>

      <div className="flex flex-col gap-3">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => handleCall(contact)}
            className={`grid grid-cols-[56px_1fr_48px_48px] gap-2.5 items-center min-h-[76px] rounded-2xl border border-[#dce9f4] ${contact.bg} p-3 hover:scale-[0.98] transition-transform`}
          >
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl">
              {contact.emoji}
            </div>
            <div className="font-black text-[#173760] leading-tight text-left">
              {contact.name}
            </div>
            <div className="w-12 h-12 rounded-full bg-[#39bb72] flex items-center justify-center text-2xl text-white">
              ☎
            </div>
            <div className="w-12 h-12 rounded-full bg-[#2d9bf0] flex items-center justify-center text-xl text-white">
              💬
            </div>
          </button>
        ))}
      </div>

      {/* SOS */}
      <button
        onClick={() => handleCall({ id: 'sos', name: 'SOS', emoji: '!', bg: '' })}
        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-[#ffe7e5] border border-[#ffc2be] rounded-2xl p-4 text-3xl font-black text-[#cc251d] hover:scale-[0.98] transition-transform"
      >
        <span>!</span>
        <span>SOS</span>
        <span>☎</span>
      </button>

      {feedback && (
        <div className="fixed bottom-24 left-4 right-4 bg-coral text-white text-center py-4 rounded-xl font-bold text-lg animate-fade-in shadow-card">
          ✓ Мама получила сигнал
          <div className="text-sm font-normal opacity-90 mt-1">Событие добавлено в Event Timeline</div>
        </div>
      )}
    </div>
  );
};