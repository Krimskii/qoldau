import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface Contact {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  border: string;
}

const CONTACTS: Contact[] = [
  { id: 'mom', name: 'Позвать маму', emoji: '👩', bg: 'bg-[#eefbf2]', border: 'border-[#cfe9d8]' },
  { id: 'tutor', name: 'Позвать тьютора', emoji: '👨', bg: 'bg-[#edf6ff]', border: 'border-[#cee0f0]' },
];

export const ChildCall: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addEvent } = useEventStore();

  const handleCall = (contact: Contact | { id: 'sos'; name: string }) => {
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
    <div className="flex flex-col gap-4 relative min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <h2 className="text-lg font-black text-[#143259]">Позвать</h2>
        <div className="w-10" />
      </div>

      {/* Контакт-карточки — крупнее, как в референсе */}
      <div className="flex flex-col gap-3">
        {CONTACTS.map((contact) => (
          <button
            key={contact.id}
            onClick={() => handleCall(contact)}
            aria-label={`Позвать ${contact.name}`}
            className={`${contact.bg} border-2 ${contact.border} rounded-2xl px-4 py-4 grid grid-cols-[64px_1fr_56px_56px] gap-3 items-center min-h-[88px] hover:scale-[0.98] active:scale-[0.96] transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl flex-shrink-0">
              {contact.emoji}
            </div>
            <div className="font-black text-ink leading-tight text-base text-left">
              {contact.name}
            </div>
            <div className="w-14 h-14 rounded-full bg-[#39bb72] flex items-center justify-center text-3xl text-white shadow-md">
              ☎
            </div>
            <div className="w-14 h-14 rounded-full bg-[#2d9bf0] flex items-center justify-center text-2xl text-white shadow-md">
              ▣
            </div>
          </button>
        ))}
      </div>

      {/* SOS — большая красная кнопка */}
      <button
        onClick={() =>
          handleCall({ id: 'sos', name: 'SOS' })
        }
        aria-label="SOS — экстренный вызов"
        className="bg-gradient-to-br from-[#ffe7e5] to-[#ffd0cc] border-2 border-[#ffc2be] rounded-2xl p-5 grid grid-cols-[auto_1fr_auto] items-center gap-4 min-h-[88px] hover:scale-[0.98] active:scale-[0.96] transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(204,37,29,0.10)]"
      >
        <span className="text-5xl text-coral font-black" aria-hidden="true">!</span>
        <span className="text-3xl font-black text-[#cc251d] tracking-wider">SOS</span>
        <span className="text-3xl text-[#cc251d]" aria-hidden="true">☎</span>
      </button>

      {/* Написать сообщение */}
      <button
        onClick={() => handleCall({ id: 'sos', name: 'Сообщение' })}
        aria-label="Написать сообщение взрослому"
        className="min-h-[64px] border-2 border-[#dce9f4] rounded-2xl bg-white flex items-center justify-center gap-3 font-black text-[#376488] text-base hover:bg-bg transition-colors"
      >
        💬 Написать сообщение
      </button>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-teal to-teal-dark text-white text-center py-5 px-4 rounded-2xl font-black text-lg shadow-card animate-fade-in"
        >
          ✓ Мама получила сигнал
          <div className="text-sm font-normal opacity-90 mt-1">
            Событие добавлено в Event Timeline
          </div>
        </div>
      )}
    </div>
  );
};