import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { HugIcon, SpeakIcon } from '@/components/icons';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import type { IconProps } from '@/components/icons';

interface Contact {
  id: string;
  name: string;
  Icon: React.FC<IconProps>;
  iconColor: string;
  bg: string;
  border: string;
}

const CONTACTS: Contact[] = [
  { id: 'mom', name: 'Позвать маму', Icon: HugIcon, iconColor: 'text-[#cc251d]', bg: 'bg-[#FFEAEA]', border: 'border-[#ffd9d3]' },
  { id: 'tutor', name: 'Позвать тьютора', Icon: SpeakIcon, iconColor: 'text-[#1c6cb8]', bg: 'bg-[#EAF5FF]', border: 'border-[#cce6f7]' },
];

type SosContact = { id: 'sos'; name: 'SOS' };

export const ChildCall: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<{ name: string; sos?: boolean } | null>(null);
  const { addEvent } = useEventStore();

  const handleCall = (contact: Contact | SosContact) => {
    const isSos = contact.id === 'sos';
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: isSos ? 'SOS' : `SOS: ${contact.name}`,
      description: isSos
        ? 'Ребёнок нажал SOS — срочный вызов помощи'
        : `Ребёнок нажал кнопку «${contact.name}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { contact: contact.id, source: 'call_button' },
    });
    setFeedback({ name: contact.name, sos: isSos });
    setTimeout(() => setFeedback(null), 1800);
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

      {/* Контакт-карточки */}
      <div className="flex flex-col gap-3">
        {CONTACTS.map((contact) => (
          <button
            key={contact.id}
            onClick={() => handleCall(contact)}
            aria-label={`Позвать ${contact.name}`}
            className={`${contact.bg} border-2 ${contact.border} rounded-2xl px-4 py-4 grid grid-cols-[64px_1fr_auto] gap-3 items-center min-h-[88px] transition-transform duration-200 ease-out hover:scale-[0.98] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
              <contact.Icon size={36} className={contact.iconColor} />
            </div>
            <div className="font-black text-ink leading-tight text-base text-left">
              {contact.name}
            </div>
            <div className="w-12 h-12 rounded-full bg-[#39bb72] flex items-center justify-center shadow-sm">
              <span className="text-white text-2xl font-black" aria-hidden="true">☎</span>
            </div>
          </button>
        ))}
      </div>

      {/* SOS — заметный, но через coralSoft (пастельный, не пугающий) */}
      <button
        onClick={() => handleCall({ id: 'sos', name: 'SOS' })}
        aria-label="SOS — экстренный вызов"
        className="bg-[#FFEAEA] border-2 border-[#FFC2BE] rounded-2xl px-5 py-5 flex items-center gap-4 min-h-[88px] transition-transform duration-200 ease-out hover:scale-[0.98] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E56F5D]/40"
      >
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#FFC2BE] flex items-center justify-center flex-shrink-0">
          <span className="text-[#cc251d] text-3xl font-black" aria-hidden="true">!</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-2xl font-black text-[#cc251d] tracking-wider">SOS</div>
          <div className="text-xs font-bold text-[#cc251d]/70 mt-0.5">
            Срочно позвать взрослого
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#cc251d] flex items-center justify-center shadow-sm">
          <span className="text-white text-2xl" aria-hidden="true">☎</span>
        </div>
      </button>

      {/* Написать сообщение */}
      <button
        onClick={() => handleCall({ id: 'sos', name: 'SOS' })}
        aria-label="Написать сообщение взрослому"
        className="min-h-[64px] border-2 border-[#dce9f4] rounded-2xl bg-white flex items-center justify-center gap-2 font-black text-[#376488] text-base hover:bg-bg transition-colors"
      >
        <SpeakIcon size={20} className="text-[#1c6cb8]" />
        Написать сообщение
      </button>

      {/* Success feedback — мягкая карточка с SuccessSparkle */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm qoldau-success-pop"
        >
          <div className="bg-white border-2 border-[#DDF5F0] rounded-3xl px-6 py-5 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <SuccessSparkle className="w-16 h-16" />
            </div>
            <p className="text-base font-black text-ink">
              {feedback.sos ? 'Мама получила сигнал' : `${feedback.name} получили сигнал`}
            </p>
            <p className="text-xs text-muted mt-1.5">
              Событие добавлено в Event Timeline
            </p>
          </div>
        </div>
      )}
    </div>
  );
};