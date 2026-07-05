import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { useAssetStore } from '@/store/useAssetStore';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { IconRenderer } from '@/components/assets/IconRenderer';
import type { QoldauAsset } from '@/types/assets';
import { BackArrowIcon } from '@/components/icons/child2d';

interface ContactDef {
  id: string;
  builtinKey: string;
  color: QoldauAsset['color'];
  bg: string;
  border: string;
  targetPerson: 'mom' | 'dad' | 'tutor' | 'specialist';
}

const CONTACTS: ContactDef[] = [
  {
    id: 'mom',
    builtinKey: 'Mom',
    color: 'coral',
    bg: 'bg-coral-soft',
    border: 'border-coral/20',
    targetPerson: 'mom',
  },
  {
    id: 'tutor',
    builtinKey: 'Tutor',
    color: 'blue',
    bg: 'bg-blue-soft',
    border: 'border-blue/20',
    targetPerson: 'tutor',
  },
];

/**
 * ChildCall (v1.5+ minimal) — «Позвать маму».
 *
 * v1.5+ bugfix: добавлены боковые отступы (mx-5) к контейнеру
 * кнопок; убраны лишний заголовок «Позвать», скруглённый header —
 * остался только back. Сами кнопки остались большие и заметные.
 */
export const ChildCall: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<{
    message: string;
    sub?: string;
  } | null>(null);
  const { addEvent } = useEventStore();
  const assets = useAssetStore((s) => s.assets);

  const getContactAsset = (builtinKey: string): QoldauAsset | undefined => {
    const customMatch = assets.find(
      (a) => a.isCustom && a.builtinKey === builtinKey && a.category === 'person',
    );
    if (customMatch) return customMatch;
    return assets.find((a) => !a.isCustom && a.builtinKey === builtinKey && a.category === 'person');
  };

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

  const handleCall = (contact: ContactDef) => {
    const asset = getContactAsset(contact.builtinKey);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: `SOS: ${contact.id}`,
      description: `Ребёнок нажал кнопку вызова`,
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
      message: 'Сигнал отправлен',
      sub: 'Событие добавлено в Event Timeline',
    });
    setTimeout(() => setFeedback(null), 1800);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header — только back. */}
      <div className="flex items-center px-3 pt-2 pb-1">
        <button
          onClick={() => navigate('/child/home')}
          className="w-9 h-9 rounded-[12px] border border-line bg-white flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={18} />
        </button>
      </div>

      {/* Контакт-карточки — с боковыми отступами mx-5 (было без). */}
      <div className="flex flex-col gap-3 mx-5 mt-3">
        {CONTACTS.map((contact) => {
          const asset = getContactAsset(contact.builtinKey);
          return (
            <button
              key={contact.id}
              onClick={() => handleCall(contact)}
              aria-label={`Позвать ${contact.id}`}
              className={`${contact.bg} border-2 ${contact.border} rounded-2xl px-4 py-4 flex items-center gap-4 min-h-[96px] transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                <IconRenderer asset={asset} size={48} rounded />
              </div>
              <div className="flex-1" />
              <div className="w-12 h-12 rounded-full bg-green flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white text-2xl" aria-hidden="true">☎</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* SOS — заметный, через coralSoft. С боковыми отступами mx-5. */}
      <button
        onClick={handleSOS}
        aria-label="SOS — экстренный вызов"
        className="mx-5 mt-3 bg-coral-soft border-2 border-coral/30 rounded-2xl px-5 py-5 flex items-center gap-4 min-h-[96px] transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
      >
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-coral/30 flex items-center justify-center flex-shrink-0">
          <span className="text-coral text-3xl font-black" aria-hidden="true">!</span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-2xl font-black text-coral tracking-wider">SOS</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-2xl" aria-hidden="true">☎</span>
        </div>
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