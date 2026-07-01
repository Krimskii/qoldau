import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { EventType } from '@/types/qoldau';
import { SuccessSparkle } from '@/components/illustrations/SuccessSparkle';
import { useAssetStore } from '@/store/useAssetStore';
import { useRoleStore } from '@/store/useRoleStore';
import { IconRenderer } from '@/components/assets/IconRenderer';
import { AssetPicker } from '@/components/assets/AssetPicker';
import type { QoldauAsset, AACCardConfig } from '@/types/assets';
import { COLOR_MAP } from '@/components/ui/QoldauIconCard';
import { Settings } from 'lucide-react';

/**
 * ChildCards — AAC-карточки через asset system.
 *
 * Карточки берутся из useAssetStore.cardConfigs (создаются в buildDefaultCardConfigs).
 * Рендер — через IconRenderer (универсальный: builtin SVG, emoji, uploaded image).
 *
 * В parent/demo mode можно редактировать иконки через AssetPicker.
 * В child mode редактирование скрыто.
 */
export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { currentRole } = useRoleStore();
  const assets = useAssetStore((s) => s.assets);
  const cardConfigs = useAssetStore((s) => s.cardConfigs);
  const setCardAsset = useAssetStore((s) => s.setCardAsset);

  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    label: string;
    asset: QoldauAsset;
  } | null>(null);

  // Edit mode показывается только вне child mode.
  const isEditable = currentRole !== 'child';
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const childConfigs = useMemo(
    () =>
      cardConfigs
        .filter((c) => c.childId === DEMO_PRIMARY_CHILD.id)
        .sort((a, b) => a.order - b.order),
    [cardConfigs],
  );

  const getCardAsset = (config: AACCardConfig): QoldauAsset | undefined =>
    assets.find((a) => a.id === config.assetId);

  const handleSelect = (config: AACCardConfig) => {
    if (editingCardId === config.id) return;

    const asset = getCardAsset(config);
    if (!asset) return;

    setSelected(config.id);

    addEvent({
      childId: config.childId,
      type: config.eventType as EventType,
      title: config.label,
      description: config.phrase,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        cardId: config.id,
        cardLabel: config.label,
        assetId: config.assetId,
        assetType: asset.type,
        source: 'aac_card',
      },
    });

    setFeedback({ label: config.label, asset });

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
    }, 1600);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <h2 className="text-lg font-black text-[#143259]">Быстрые карточки</h2>
        {isEditable ? (
          <button
            onClick={() => setEditingCardId(editingCardId ? null : childConfigs[0]?.id ?? null)}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors ${
              editingCardId
                ? 'bg-teal-soft border-teal/40 text-teal-dark'
                : 'bg-white border-[#dce9f4] text-[#53677e] hover:bg-bg'
            }`}
            aria-label="Настроить карточки"
            aria-pressed={!!editingCardId}
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Edit mode banner */}
      {editingCardId && (
        <div className="bg-[#FFFCEC] border border-[#f7e5a3] rounded-xl px-4 py-3 text-sm text-ink-2">
          Нажмите на карточку, чтобы изменить её иконку. Выйдите из режима настроек, чтобы снова нажимать.
        </div>
      )}

      {/* AAC cards через QoldauIconCard + IconRenderer */}
      <div className="grid grid-cols-4 gap-2.5">
        {childConfigs.map((config) => {
          const asset = getCardAsset(config);
          if (!asset) return null;

          const palette = asset.color ? COLOR_MAP[asset.color] : null;
          const isSelected = selected === config.id;
          const isEditing = editingCardId === config.id;

          return (
            <button
              key={config.id}
              onClick={() => {
                if (editingCardId) {
                  // В edit mode — открываем picker для этой карточки
                  if (editingCardId === config.id) {
                    setEditingCardId(null);
                  }
                } else {
                  handleSelect(config);
                }
              }}
              className={`relative min-h-[110px] rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 p-2 text-base font-black transition-all duration-200 ease-out active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${
                palette
                  ? `${palette.bg} ${palette.border}`
                  : 'bg-white border-line'
              } ${isSelected ? 'scale-[0.96] opacity-80' : ''} ${
                isEditing ? 'ring-2 ring-offset-2 ring-teal/50' : ''
              }`}
              aria-label={`${config.label}${editingCardId ? ' (нажмите чтобы изменить иконку)' : ''}`}
            >
              <IconRenderer asset={asset} size={40} />
              <span className={`text-sm leading-tight text-center ${palette?.text ?? 'text-ink'}`}>
                {config.label}
              </span>
              {isEditing && (
                <span className="absolute top-1 right-1 text-[10px] font-black uppercase text-teal-dark">
                  edit
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Asset picker — открывается когда есть editingCardId */}
      {editingCardId && (
        <AssetPicker
          isOpen={!!editingCardId}
          selectedAssetId={cardConfigs.find((c) => c.id === editingCardId)?.assetId}
          onSelect={(asset) => {
            setCardAsset(editingCardId, asset.id);
            setEditingCardId(null);
          }}
          onClose={() => setEditingCardId(null)}
          title="Изменить иконку карточки"
        />
      )}

      {/* Success feedback */}
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
            <div className="flex items-center justify-center gap-2 text-base font-black text-ink">
              <IconRenderer asset={feedback.asset} size={24} />
              Я сказал: {feedback.label}
            </div>
            <p className="text-xs text-muted mt-1.5 leading-snug">
              Мама увидит запрос · Событие сохранено
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Импорт для query param (если в URL есть edit=1 — показывать edit mode)
export const useEditModeFromUrl = () => {
  const location = window.location;
  return new URLSearchParams(location.search).get('edit') === '1';
};