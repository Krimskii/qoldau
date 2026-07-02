import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { useAssetStore } from '@/store/useAssetStore';
import { SpeakIcon } from '@/components/icons';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { IconRenderer } from '@/components/assets/IconRenderer';
import type { QoldauAsset } from '@/types/assets';

interface ContactDef {
  id: string;
  name: string;
  builtinKey: string;
  color: QoldauAsset['color'];
  bg: string;
  border: string;
  targetPerson: 'mom' | 'dad' | 'tutor' | 'specialist';
}

const CONTACTS: ContactDef[] = [
  {
    id: 'mom',
    name: 'Позвать маму',
    builtinKey: 'Mom',
    color: 'coral',
    bg: 'bg-coral-soft',
    border: 'border-coral/20',
    targetPerson: 'mom',
  },
  {
    id: 'tutor',
    name: 'Позвать тьютора',
    builtinKey: 'Tutor',
    color: 'blue',
    bg: 'bg-blue-soft',
    border: 'border-blue/20',
    targetPerson: 'tutor',
  },
];

export const ChildCall: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<{
    message: string;
    sub?: string;
  } | null>(null);
  const { addEvent } = useEventStore();
  const assets = useAssetStore((s) => s.assets);

  /** Резолвит ассет для контакта: предпочитает custom фото, иначе built-in. */
  const getContactAsset = (builtinKey: string): QoldauAsset | undefined => {
    // Ищем custom ассет с тем же builtinKey+category='person'
    const customMatch = assets.find(
      (a) => a.isCustom && a.builtinKey === builtinKey && a.category === 'person',
    );
    if (customMatch) return customMatch;
    return assets.find((a) => !a.isCustom && a.builtinKey === builtinKey && a.category === 'person');
  };

  /** SOS — реальный экстренный вызов. */
  const handleSOS = () => {
    const asset = getContactAsset('Mom');
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: 'SOS',
      description: 'Ребёнок нажал SOS — срочный вызов помощи',
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        contact: 'sos',
        targetPerson: 'mom',
        assetId: asset?.id,
        assetType: asset?.type,
        source: 'sos_button',
      },
    });
    setFeedback({
      message: 'Мама получила сигнал',
      sub: 'Событие добавлено в Event Timeline',
    });
    setTimeout(() => setFeedback(null), 1800);
  };

  /** Позвать конкретного взрослого (mom/tutor). */
  const handleCall = (contact: ContactDef) => {
    const asset = getContactAsset(contact.builtinKey);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: `SOS: ${contact.name}`,
      description: `Ребёнок нажал кнопку «${contact.name}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        contact: contact.id,
        targetPerson: contact.targetPerson,
        assetId: asset?.id,
        assetType: asset?.type,
        source: 'call_button',
      },
    });
    setFeedback({
      message: `${contact.name} получили сигнал`,
      sub: 'Событие добавлено в Event Timeline',
    });
    setTimeout(() => setFeedback(null), 1800);
  };

  /** Написать сообщение взрослому — НЕ SOS, обычный communication event. */
  const handleMessage = () => {
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'communication',
      title: 'Сообщение взрослому',
      description: 'Ребёнок написал сообщение взрослому',
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        source: 'child_message_button',
        target: 'adult',
        messageType: 'need_help',
      },
    });
    setFeedback({
      message: 'Сообщение отправлено взрослому',
      sub: 'Событие добавлено в Event Timeline',
    });
    setTimeout(() => setFeedback(null), 1800);
  };

  return (
    <div className="flex flex-col gap-4 relative min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-muted">‹</span>
        </button>
        <h2 className="text-lg font-black text-ink">Позвать</h2>
        <div className="w-10" />
      </div>

      {/* Контакт-карточки */}
      <div className="flex flex-col gap-3">
        {CONTACTS.map((contact) => {
          const asset = getContactAsset(contact.builtinKey);
          return (
            <button
              key={contact.id}
              onClick={() => handleCall(contact)}
              aria-label={`Позвать ${contact.name}`}
              className={`${contact.bg} border-2 ${contact.border} rounded-2xl px-4 py-4 grid grid-cols-[64px_1fr_auto] gap-3 items-center min-h-[88px] transition-transform duration-200 ease-out hover:scale-[0.98] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(42,73,108,0.04)]`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                <IconRenderer asset={asset} size={40} rounded />
              </div>
              <div className="font-black text-ink leading-tight text-base text-left">
                {contact.name}
              </div>
              <div className="w-12 h-12 rounded-full bg-green flex items-center justify-center shadow-sm">
                <span className="text-white text-2xl font-black" aria-hidden="true">☎</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* SOS — заметный, но через coralSoft (не пугающий) */}
      <button
        onClick={handleSOS}
        aria-label="SOS — экстренный вызов"
        className="bg-coral-soft border-2 border-coral/30 rounded-2xl px-5 py-5 flex items-center gap-4 min-h-[88px] transition-transform duration-200 ease-out hover:scale-[0.98] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
      >
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-coral/30 flex items-center justify-center flex-shrink-0">
          <span className="text-coral text-3xl font-black" aria-hidden="true">!</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-2xl font-black text-coral tracking-wider">SOS</div>
          <div className="text-xs font-bold text-coral/70 mt-0.5">
            Срочно позвать взрослого
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center shadow-sm">
          <span className="text-white text-2xl" aria-hidden="true">☎</span>
        </div>
      </button>

      {/* Написать сообщение — НЕ SOS, а communication event */}
      <button
        onClick={handleMessage}
        aria-label="Написать сообщение взрослому"
        className="min-h-[64px] border-2 border-line rounded-2xl bg-white flex items-center justify-center gap-2 font-black text-ink-2 text-base hover:bg-bg transition-colors"
      >
        <SpeakIcon size={20} className="text-blue" />
        Написать сообщение
      </button>

      {/* Success feedback */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm qoldau-success-pop"
        >
          <div className="bg-white border-2 border-teal-soft rounded-3xl px-6 py-5 shadow-card text-center">
            <div className="flex justify-center mb-2">
              <SuccessSparkle className="w-16 h-16" />
            </div>
            <p className="text-base font-black text-ink">{feedback.message}</p>
            {feedback.sub && (
              <p className="text-xs text-muted mt-1.5">{feedback.sub}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};