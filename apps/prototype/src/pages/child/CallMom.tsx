import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, MessageCircle, Lock, X } from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { useAssetStore } from '@/store/useAssetStore';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { IconRenderer } from '@/components/assets/IconRenderer';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import type { QoldauAsset } from '@/types/assets';
import { speak } from '@/lib/tts/speak';
import { triggerHaptic } from '@/lib/feedback/haptics';
import {
  BackArrowIcon,
  Mom2DIcon,
  Dad2DIcon,
  Tutor2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';

type ContactChannel = 'call' | 'video';

interface ContactDef {
  id: 'mom' | 'dad' | 'tutor';
  builtinKey: string;
  label: string;
  color: QoldauAsset['color'];
  /** bg/border тон карточки контакта */
  bg: string;
  border: string;
  channel: ContactChannel;
  family: ChildCardFamily;
  /** targetPerson в payload sos event */
  targetPerson: 'mom' | 'dad' | 'tutor';
}

const CONTACTS: ContactDef[] = [
  {
    id: 'mom',
    builtinKey: 'Mom',
    label: 'Мама',
    color: 'coral',
    bg: 'bg-coral-soft',
    border: 'border-coral/20',
    channel: 'call',
    family: 'help',
    targetPerson: 'mom',
  },
  {
    id: 'dad',
    builtinKey: 'Dad',
    label: 'Папа',
    color: 'blue',
    bg: 'bg-blue-soft',
    border: 'border-blue/20',
    channel: 'call',
    family: 'need',
    targetPerson: 'dad',
  },
  {
    id: 'tutor',
    builtinKey: 'Tutor',
    label: 'Тьютор',
    color: 'purple',
    bg: 'bg-purple-soft',
    border: 'border-purple/20',
    channel: 'video',
    family: 'do',
    targetPerson: 'tutor',
  },
];

/**
 * ChildCall (v1.5+ D) — позвать взрослого.
 *
 * Фичи:
 * - 3 контакта: Мама / Папа / Тьютор (фикс-порядок) с канал-бейджем (☎/▶).
 * - «Написать сообщение» — bottom-sheet композер с пресет-фразами (родитель
 *   редактирует через messagePresets в сторе).
 * - «Срочно» — coral карточка с замком (Lock), вызывает ConfirmSheet
 *   (coral tone) перед отправкой sos event. Замок = защита от случайного
 *   тапа, а НЕ разрешение взрослого (трактовка по спеке §1.3).
 */
export const ChildCall: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<{
    message: string;
    sub?: string;
  } | null>(null);
  const [sosConfirmOpen, setSosConfirmOpen] = useState(false);
  const [messageSheetOpen, setMessageSheetOpen] = useState(false);

  const { addEvent } = useEventStore();
  const assets = useAssetStore((s) => s.assets);
  const messagePresets = useAssetStore((s) => s.messagePresets);

  const getContactAsset = (builtinKey: string): QoldauAsset | undefined => {
    const customMatch = assets.find(
      (a) => a.isCustom && a.builtinKey === builtinKey && a.category === 'person',
    );
    if (customMatch) return customMatch;
    return assets.find((a) => !a.isCustom && a.builtinKey === builtinKey && a.category === 'person');
  };

  const showFeedback = (message: string, sub?: string) => {
    setFeedback({ message, sub });
    setTimeout(() => setFeedback(null), 1800);
  };

  const handleCall = (contact: ContactDef) => {
    triggerHaptic('tap');
    const asset = getContactAsset(contact.builtinKey);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: `SOS: ${contact.label}`,
      description: `Ребёнок позвал ${contact.label}`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        contact: contact.id,
        targetPerson: contact.targetPerson,
        channel: contact.channel,
        assetId: asset?.id,
        assetType: asset?.type,
        source: 'call_button',
      },
    });
    speak(`Зову ${contact.label}`);
    showFeedback('Сигнал отправлен', 'Событие добавлено в Event Timeline');
  };

  const handleSOSConfirm = () => {
    triggerHaptic('cue');
    setSosConfirmOpen(false);
    const asset = getContactAsset('Mom');
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'sos',
      title: 'SOS — срочно',
      description: 'Ребёнок подтвердил срочный вызов',
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
    speak('Мама получила сигнал');
    showFeedback('Мама получила сигнал', 'Событие добавлено в Event Timeline');
  };

  const handleMessagePreset = (text: string) => {
    triggerHaptic('tap');
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'communication',
      title: `Сообщение: ${text}`,
      description: `Ребёнок отправил сообщение: «${text}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        source: 'child_message',
        text,
      },
    });
    speak(text);
    setMessageSheetOpen(false);
    showFeedback('Сообщение отправлено', text);
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

      {/* Контакт-карточки — фикс-порядок Мама/Папа/Тьютор, канал-бейдж справа. */}
      <div className="flex flex-col gap-3 mx-5 mt-3">
        {CONTACTS.map((contact) => {
          const asset = getContactAsset(contact.builtinKey);
          const familyStyle = CHILD_FAMILY_STYLES[contact.family];
          const ChannelIcon = contact.channel === 'video' ? Video : Phone;
          const channelBg = contact.channel === 'video' ? 'bg-blue' : 'bg-green';
          return (
            <button
              key={contact.id}
              onClick={() => handleCall(contact)}
              aria-label={`Позвать ${contact.label}`}
              className={`${contact.bg} border-2 ${contact.border} rounded-2xl px-4 py-4 flex items-center gap-4 min-h-[96px] transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40`}
            >
              <div className={`w-16 h-16 rounded-2xl ${familyStyle.icoBg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                <IconRenderer
                  asset={asset}
                  size={48}
                  rounded
                  fallbackIcon={
                    contact.id === 'mom'
                      ? Mom2DIcon
                      : contact.id === 'dad'
                      ? Dad2DIcon
                      : Tutor2DIcon
                  }
                />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[17px] font-black text-ink">{contact.label}</div>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${channelBg} flex items-center justify-center shadow-sm flex-shrink-0`}
                aria-hidden="true"
              >
                <ChannelIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </button>
          );
        })}

        {/* «Написать сообщение» — строка-кнопка под контактами */}
        <button
          onClick={() => setMessageSheetOpen(true)}
          aria-label="Написать сообщение"
          className="bg-white border border-line rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[64px] transition-transform duration-200 ease-out active:scale-[0.96] hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-soft flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-teal-dark" strokeWidth={2.2} />
          </div>
          <div className="flex-1 text-left text-[15px] font-bold text-ink">
            Написать сообщение
          </div>
        </button>

        {/* «Срочно» — coral с замком, открывает ConfirmSheet (coral tone). */}
        <button
          onClick={() => {
            triggerHaptic('cue');
            setSosConfirmOpen(true);
          }}
          aria-label="Срочно — нужно подтверждение"
          className="bg-coral-soft border-2 border-coral/30 rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[96px] transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
        >
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-coral/30 flex items-center justify-center flex-shrink-0">
            <span className="text-coral text-3xl font-black" aria-hidden="true">!</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-2xl font-black text-coral tracking-wider leading-tight">
              Срочно
            </div>
            <div className="text-[11px] text-muted mt-0.5">
              Нужно подтверждение
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center shadow-sm flex-shrink-0">
            <Lock className="w-6 h-6 text-white" strokeWidth={2.4} />
          </div>
        </button>
      </div>

      {/* ConfirmSheet — подтверждение «Срочно» */}
      <ConfirmSheet
        open={sosConfirmOpen}
        title="Позвать срочно?"
        subtitle="Взрослый получит сигнал сразу"
        confirmTone="coral"
        onConfirm={handleSOSConfirm}
        onCancel={() => setSosConfirmOpen(false)}
      />

      {/* Bottom-sheet композер пресет-сообщений */}
      {messageSheetOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Написать сообщение"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMessageSheetOpen(false);
          }}
          style={{ background: 'rgba(7, 27, 58, 0.28)' }}
        >
          <div className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-card p-5 mx-3 mb-3 qoldau-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[18px] font-black text-ink">Написать сообщение</p>
              <button
                type="button"
                onClick={() => setMessageSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-bg border border-line text-muted flex items-center justify-center hover:bg-line-soft transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              Выбери фразу — она сразу отправится маме или папе.
            </p>
            <div className="flex flex-wrap gap-2">
              {messagePresets.map((text) => (
                <button
                  key={text}
                  onClick={() => handleMessagePreset(text)}
                  className="bg-teal-soft text-teal-dark rounded-2xl px-4 py-2.5 text-sm font-bold transition-transform duration-200 ease-out active:scale-[0.94] hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
                  aria-label={`Отправить: ${text}`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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