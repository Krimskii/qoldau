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
import type { QoldauAsset, AACCardConfig, AssetColor } from '@/types/assets';
import type { IconProps } from '@/components/icons';
import { QoldauIconCard, type QoldauIconColor } from '@/components/ui/QoldauIconCard';
import { Settings } from 'lucide-react';

/**
 * ChildCards — быстрые карточки AAC, сгруппированные по смыслу.
 *
 * Группы (по category из cardConfigs):
 * - need     — Хочу пить / Туалет / Домой / Еда
 * - feeling  — Больно / Устал / Нет
 * - activity — Играть
 * - calm     — Обниматься
 * - person   — Мама / Тьютор
 * - media    — Мультик / Песенки / Животные / Машинки / Спокойное видео
 *
 * Рендер — QoldauIconCard (через адаптер IconRenderer → IconProps) для
 * единого стиля карточек.
 *
 * В parent/demo mode можно редактировать иконки через AssetPicker.
 * В child mode редактирование скрыто.
 */

const ASSET_COLOR_TO_ICON_COLOR: Record<AssetColor, QoldauIconColor> = {
  blue: 'blue',
  green: 'green',
  teal: 'teal',
  yellow: 'yellow',
  purple: 'purple',
  coral: 'coral',
};

const GROUP_LABELS: Record<string, { title: string; subtitle?: string }> = {
  need: { title: 'Хочу', subtitle: 'Базовые потребности' },
  feeling: { title: 'Чувствую', subtitle: 'Эмоции и состояние' },
  activity: { title: 'Делаю', subtitle: 'Чем заняться' },
  calm: { title: 'Спокойно', subtitle: 'Поддержка и отдых' },
  person: { title: 'Люди', subtitle: 'Кого позвать' },
  media: { title: 'Медиа', subtitle: 'Что посмотреть / послушать' },
};

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

  const isEditable = currentRole !== 'child';
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const childConfigs = useMemo(
    () =>
      cardConfigs
        .filter((c) => c.childId === DEMO_PRIMARY_CHILD.id)
        .sort((a, b) => a.order - b.order),
    [cardConfigs],
  );

  // Группировка по category
  const groupedConfigs = useMemo(() => {
    const groups = new Map<string, AACCardConfig[]>();
    childConfigs.forEach((cfg) => {
      const cat = cfg.category ?? 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(cfg);
    });
    // Фиксированный порядок групп для предсказуемого UI
    const order = ['need', 'feeling', 'activity', 'calm', 'person', 'media'];
    return order
      .map((cat) => ({ key: cat, items: groups.get(cat) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [childConfigs]);

  const getCardAsset = (config: AACCardConfig): QoldauAsset | undefined =>
    assets.find((a) => a.id === config.assetId);

  // Адаптер: QoldauAsset → React.FC<IconProps> для QoldauIconCard.
  const iconForAsset = (asset: QoldauAsset): React.FC<IconProps> => {
    const Adapted: React.FC<IconProps> = (p) => (
      <IconRenderer asset={asset} {...p} />
    );
    Adapted.displayName = `AssetIcon(${asset.id})`;
    return Adapted;
  };

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
    <div className="flex flex-col gap-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dce9f4] flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <span className="text-2xl text-[#53677e]">‹</span>
        </button>
        <h1 className="text-base font-black text-ink">Быстрые карточки</h1>
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
        <div className="bg-yellow-soft border border-yellow/30 rounded-2xl px-4 py-3 text-sm text-ink-2">
          Нажмите на карточку, чтобы изменить её иконку. Выйдите из режима настроек, чтобы снова нажимать.
        </div>
      )}

      {/* Группы AAC карточек */}
      <div className="flex flex-col gap-6">
        {groupedConfigs.map(({ key, items }) => {
          const meta = GROUP_LABELS[key] ?? { title: key };
          return (
            <section key={key} aria-labelledby={`group-${key}`} className="flex flex-col gap-3">
              <header>
                <h2 id={`group-${key}`} className="text-sm font-black text-ink-2">
                  {meta.title}
                </h2>
                {meta.subtitle && (
                  <p className="text-xs text-muted mt-0.5">{meta.subtitle}</p>
                )}
              </header>
              <div className="grid grid-cols-4 gap-2.5">
                {items.map((config) => {
                  const asset = getCardAsset(config);
                  if (!asset) return null;

                  const iconColor: QoldauIconColor = asset.color
                    ? ASSET_COLOR_TO_ICON_COLOR[asset.color] ?? 'blue'
                    : 'blue';

                  return (
                    <QoldauIconCard
                      key={config.id}
                      icon={iconForAsset(asset)}
                      label={config.label}
                      color={iconColor}
                      size="md"
                      state={selected === config.id ? 'pressed' : 'default'}
                      onClick={() => {
                        if (editingCardId) {
                          if (editingCardId === config.id) {
                            setEditingCardId(null);
                          }
                          return;
                        }
                        handleSelect(config);
                      }}
                      ariaLabel={`${config.label}${editingCardId ? ' (нажмите чтобы изменить иконку)' : ''}`}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Asset picker */}
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
          <div className="bg-white border-2 border-teal-soft rounded-3xl px-6 py-5 shadow-card text-center">
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