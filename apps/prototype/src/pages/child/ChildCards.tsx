import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { EventType } from '@/types/qoldau';
import { useAssetStore } from '@/store/useAssetStore';
import { useRoleStore } from '@/store/useRoleStore';
import { BackArrowIcon } from '@/components/icons/child2d';
import { Settings } from 'lucide-react';
import {
  CHILD_FAMILY_STYLES,
  type ChildCardFamily,
  Food2DIcon,
  Hurt2DIcon,
  Tired2DIcon,
  Home2DIcon,
  Play2DIcon,
  Hug2DIcon,
  No2DIcon,
  Mom2DIcon,
  Tutor2DIcon,
  Cartoon2DIcon,
  Music2DIcon,
  Animals2DIcon,
  Car2DIcon,
  CalmVid2DIcon,
} from '@/components/icons/child2d';

/**
 * ChildCards — быстрые карточки AAC (v0.3.15).
 *
 * Сетка 3×N (как в child_v2.html), иконки 2D inline SVG.
 * Каждая карточка попадает на pop-анимацию со stagger.
 *
 * В parent/demo mode доступен edit mode через Settings.
 * В child mode редактирование скрыто.
 */

const CARD_ICON_MAP: Record<string, { Icon: React.FC<{ size?: number; animated?: boolean }>; family: ChildCardFamily }> = {
  food:      { Icon: Food2DIcon,      family: 'need' },
  pain:      { Icon: Hurt2DIcon,      family: 'help' },
  tired:     { Icon: Tired2DIcon,     family: 'need' },
  home:      { Icon: Home2DIcon,      family: 'feel' },
  play:      { Icon: Play2DIcon,      family: 'do'   },
  hug:       { Icon: Hug2DIcon,       family: 'feel' },
  no:        { Icon: No2DIcon,        family: 'help' },
  mom:       { Icon: Mom2DIcon,       family: 'help' },
  tutor:     { Icon: Tutor2DIcon,     family: 'fav'  },
  cartoon:   { Icon: Cartoon2DIcon,   family: 'fav'  },
  music:     { Icon: Music2DIcon,     family: 'fav'  },
  animals:   { Icon: Animals2DIcon,   family: 'do'   },
  cars:      { Icon: Car2DIcon,       family: 'need' },
  calmvid:   { Icon: CalmVid2DIcon,   family: 'fav'  },
};

export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { currentRole } = useRoleStore();
  const cardConfigs = useAssetStore((s) => s.cardConfigs);
  const assets = useAssetStore((s) => s.assets);

  const isEditable = currentRole !== 'child';
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const childConfigs = useMemo(
    () =>
      cardConfigs
        .filter((c) => c.childId === DEMO_PRIMARY_CHILD.id)
        .sort((a, b) => a.order - b.order),
    [cardConfigs],
  );

  const handleSelect = (config: typeof childConfigs[0]) => {
    if (editingCardId === config.id) return;
    const asset = assets.find((a) => a.id === config.assetId);
    if (!asset) return;

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
  };

  return (
    <div className="flex flex-col gap-1 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-0.5">
        <button
          onClick={() => navigate('/child/home')}
          className="w-[42px] h-[42px] rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={22} />
        </button>
        <div className="text-xl font-black text-ink">Быстрые карточки</div>
        {isEditable ? (
          <button
            onClick={() => setEditingCardId(editingCardId ? null : childConfigs[0]?.id ?? null)}
            className={`ml-auto w-[42px] h-[42px] rounded-[14px] border-0 flex items-center justify-center transition-colors ${
              editingCardId
                ? 'bg-teal-soft text-teal-dark'
                : 'bg-white text-ink-soft shadow-card hover:bg-bg'
            }`}
            aria-label="Настроить карточки"
            aria-pressed={!!editingCardId}
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      {/* 14 cards in 3-col grid (5 rows: 3+3+3+3+2) */}
      <div className="grid grid-cols-3 gap-3.5 px-5 pt-4">
        {childConfigs.map((config, idx) => {
          const iconData = CARD_ICON_MAP[config.id];
          if (!iconData) return null;
          const { Icon, family } = iconData;
          const familyStyle = CHILD_FAMILY_STYLES[family];
          const isEditing = editingCardId === config.id;

          return (
            <button
              key={config.id}
              onClick={() => {
                if (editingCardId) {
                  if (editingCardId === config.id) setEditingCardId(null);
                  return;
                }
                handleSelect(config);
              }}
              className={`qoldau-icon-pop flex flex-col items-center gap-2.5 px-2 py-4 bg-white rounded-3xl shadow-card cursor-pointer min-h-[120px] transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg active:scale-[0.94]`}
              style={{ animationDelay: `${idx * 50}ms` }}
              aria-label={`${config.label}${editingCardId ? ' (нажмите чтобы изменить иконку)' : ''}`}
            >
              <div className={`w-14 h-14 rounded-[18px] ${familyStyle.icoBg} flex items-center justify-center`}>
                <Icon size={46} />
              </div>
              <div className={`text-sm font-black text-center leading-tight ${familyStyle.lbl}`}>
                {config.label}
              </div>
              {isEditing && (
                <span className="absolute top-1 right-1 text-[10px] font-black uppercase text-teal-dark">
                  edit
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};