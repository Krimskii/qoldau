import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useAssetStore } from '@/store/useAssetStore';
import { useRoleStore } from '@/store/useRoleStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { AssetPicker } from '@/components/assets/AssetPicker';
import { QoldauCard } from '@/components/ui/QoldauCard';
import {
  BackArrowIcon,
  Cartoon2DIcon,
  Music2DIcon,
  Animals2DIcon,
  Car2DIcon,
  CalmVid2DIcon,
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
} from '@/components/icons/child2d';
import { Settings } from 'lucide-react';
import type { QoldauAsset, AACCardConfig } from '@/types/assets';

const FAVORITE_ICON_MAP: Record<string, { Icon: React.FC<{ size?: number; animated?: boolean }>; family: ChildCardFamily }> = {
  cartoon:    { Icon: Cartoon2DIcon,   family: 'fav'  },
  songs:      { Icon: Music2DIcon,     family: 'fav'  },
  animals:    { Icon: Animals2DIcon,   family: 'do'   },
  cars:       { Icon: Car2DIcon,       family: 'need' },
  'calm-video': { Icon: CalmVid2DIcon, family: 'fav'  },
};

/**
 * ChildFavorites — любимые карточки ребёнка (v0.3.15).
 *
 * Берёт media_request + isFavorite из cardConfigs. Сетка 3×N с 2D иконками.
 * Edit mode через Settings для parent/demo.
 */
export const ChildFavorites: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { currentRole } = useRoleStore();
  const assets = useAssetStore((s) => s.assets);
  const cardConfigs = useAssetStore((s) => s.cardConfigs);
  const setCardAsset = useAssetStore((s) => s.setCardAsset);

  const [selected, setSelected] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

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
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex items-center gap-2.5 px-5 pt-1 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Любимые</div>
        {isEditable && (
          <button
            onClick={() => setEditingCardId(editingCardId ? null : favoriteCards[0]?.id ?? null)}
            className={`ml-auto w-[42px] h-[42px] rounded-[14px] border-0 flex items-center justify-center transition-colors ${
              editingCardId ? 'bg-teal-soft text-teal-dark' : 'bg-white text-ink-soft shadow-card hover:bg-bg'
            }`}
            aria-label="Настроить любимые"
            aria-pressed={!!editingCardId}
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {editingCardId && (
        <QoldauCard variant="tinted-yellow" padding="sm" className="mx-5 mt-3">
          <p className="text-sm text-ink-2">
            Нажмите на карточку, чтобы изменить её иконку.
          </p>
        </QoldauCard>
      )}

      <div className="grid grid-cols-3 gap-2.5 px-5 pt-4">
        {favoriteCards.map((config, idx) => {
          const iconData = FAVORITE_ICON_MAP[config.id];
          if (!iconData) return null;
          const { Icon, family } = iconData;
          const familyStyle = CHILD_FAMILY_STYLES[family];
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
              className={`qoldau-icon-pop flex flex-col items-center gap-2.5 px-2 py-4 bg-white rounded-3xl shadow-card cursor-pointer min-h-[120px] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.94] ${
                isSelected ? 'scale-95 opacity-80' : ''
              } ${isEditing ? 'ring-2 ring-teal/50' : ''}`}
              style={{ animationDelay: `${idx * 50}ms` }}
              aria-label={`${config.label}${editingCardId ? ' (нажмите чтобы изменить иконку)' : ''}`}
            >
              <div className={`w-14 h-14 rounded-[18px] ${familyStyle.icoBg} flex items-center justify-center`}>
                <Icon size={46} />
              </div>
              <div className={`text-sm font-black text-center leading-tight ${familyStyle.lbl}`}>
                {config.label}
              </div>
            </button>
          );
        })}
        {favoriteCards.length === 0 && (
          <p className="col-span-3 text-center text-sm text-muted py-6">
            Нет любимых карточек.
          </p>
        )}
      </div>

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

      {selected && (
        <div className="fixed bottom-24 inset-x-4 z-50 mx-auto max-w-sm qoldau-success-pop">
          <QoldauCard variant="tinted-teal" padding="md" className="text-center">
            <p className="font-black text-ink">✓ Мама увидит запрос</p>
            <p className="text-sm text-ink-2 opacity-90 mt-1">Событие добавлено в Event Timeline</p>
          </QoldauCard>
        </div>
      )}
    </div>
  );
};