import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useAssetStore } from '@/store/useAssetStore';
import { useRoleStore } from '@/store/useRoleStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { IconRenderer } from '@/components/assets/IconRenderer';
import { AssetPicker } from '@/components/assets/AssetPicker';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Settings } from 'lucide-react';
import type { QoldauAsset, AACCardConfig } from '@/types/assets';

export const ChildFavorites: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { currentRole } = useRoleStore();
  const assets = useAssetStore((s) => s.assets);
  const cardConfigs = useAssetStore((s) => s.cardConfigs);
  const setCardAsset = useAssetStore((s) => s.setCardAsset);

  const [selected, setSelected] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // В demo — только media_request карточки от текущего ребёнка.
  const favoriteCards: AACCardConfig[] = cardConfigs
    .filter(
      (c) =>
        c.childId === DEMO_PRIMARY_CHILD.id &&
        (c.eventType === 'media_request' || c.isFavorite),
    )
    .sort((a, b) => a.order - b.order);

  const getAsset = (config: AACCardConfig): QoldauAsset | undefined =>
    assets.find((a) => a.id === config.assetId);

  const handleSelect = (config: AACCardConfig) => {
    if (editingCardId === config.id) return;
    const asset = getAsset(config);
    if (!asset) return;

    setSelected(config.id);

    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'media_request',
      title: `Хочу: ${config.label}`,
      description: `Ребёнок выбрал любимое «${config.label}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: {
        cardId: config.id,
        cardLabel: config.label,
        assetId: config.assetId,
        assetType: asset.type,
        source: 'child_favorite',
      },
    });

    setTimeout(() => setSelected(null), 1500);
  };

  const isEditable = currentRole !== 'child';

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="text-3xl font-black text-[#203a60]"
          aria-label="Назад"
        >
          ‹
        </button>
        <h2 className="text-lg font-black text-[#143259]">Любимые</h2>
        {isEditable ? (
          <button
            onClick={() =>
              setEditingCardId(editingCardId ? null : favoriteCards[0]?.id ?? null)
            }
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors ${
              editingCardId
                ? 'bg-teal-soft border-teal/40 text-teal-dark'
                : 'bg-white border-[#dce9f4] text-[#53677e] hover:bg-bg'
            }`}
            aria-label="Настроить любимые"
            aria-pressed={!!editingCardId}
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Edit mode banner — QoldauCard tinted-yellow */}
      {editingCardId && (
        <QoldauCard variant="tinted-yellow" padding="sm">
          <p className="text-sm text-ink-2">
            Нажмите на карточку, чтобы изменить её иконку.
          </p>
        </QoldauCard>
      )}

      {/* Favorites grid */}
      <div className="grid grid-cols-2 gap-3">
        {favoriteCards.map((config) => {
          const asset = getAsset(config);
          if (!asset) return null;

          const palette = asset.color ?? 'yellow';
          const isSelected = selected === config.id;
          const isEditing = editingCardId === config.id;

          return (
            <button
              key={config.id}
              onClick={() => {
                if (editingCardId) {
                  if (editingCardId === config.id) setEditingCardId(null);
                } else {
                  handleSelect(config);
                }
              }}
              className={`relative min-h-[120px] rounded-2xl border-2 overflow-hidden transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 flex flex-col items-center justify-center gap-2 p-4 ${
                palette === 'yellow'
                  ? 'bg-[#FFF6DF] border-[#f0e2a7]'
                  : palette === 'coral'
                    ? 'bg-[#FFEAEA] border-[#ffd9d3]'
                    : palette === 'blue'
                      ? 'bg-[#EAF5FF] border-[#cce6f7]'
                      : palette === 'purple'
                        ? 'bg-[#F1EDFF] border-[#e0d6f7]'
                        : palette === 'green'
                          ? 'bg-[#EAF8F0] border-[#ccebd9]'
                          : 'bg-[#DDF5F0] border-[#bfecdf]'
              } ${isSelected ? 'scale-[0.95] opacity-80' : ''} ${
                isEditing ? 'ring-2 ring-offset-2 ring-teal/50' : ''
              }`}
              aria-label={`${config.label}${editingCardId ? ' (нажмите чтобы изменить иконку)' : ''}`}
            >
              <IconRenderer asset={asset} size={56} />
              <span className="text-base font-black text-ink leading-tight text-center">
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
        {favoriteCards.length === 0 && (
          <p className="col-span-2 text-center text-sm text-muted py-6">
            Нет любимых карточек.
          </p>
        )}
      </div>

      {/* Asset picker для edit mode */}
      {editingCardId && (
        <AssetPicker
          isOpen={!!editingCardId}
          selectedAssetId={cardConfigs.find((c) => c.id === editingCardId)?.assetId}
          category="media"
          onSelect={(asset) => {
            setCardAsset(editingCardId, asset.id);
            setEditingCardId(null);
          }}
          onClose={() => setEditingCardId(null)}
          title="Изменить иконку любимого"
        />
      )}

      {/* Success feedback — QoldauCard tinted-teal */}
      {selected && (
        <QoldauCard
          variant="tinted-teal"
          padding="md"
          className="fixed bottom-24 left-4 right-4 z-40 text-center animate-fade-in shadow-card"
        >
          <p className="font-black text-ink">✓ Мама увидит запрос</p>
          <p className="text-sm font-normal text-ink-2 opacity-90 mt-1">
            Событие добавлено в Event Timeline
          </p>
        </QoldauCard>
      )}
    </div>
  );
};