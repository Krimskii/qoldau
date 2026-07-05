import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useAssetStore, MAX_FAVORITES } from '@/store/useAssetStore';
import { useRoleStore } from '@/store/useRoleStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { AssetPicker } from '@/components/assets/AssetPicker';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { IconRenderer } from '@/components/assets/IconRenderer';
import { speak } from '@/lib/tts/speak';
import { triggerHaptic } from '@/lib/feedback/haptics';
import { BackArrowIcon } from '@/components/icons/child2d';
import { Play, Plus, Settings, X } from 'lucide-react';
import { Music2DIcon } from '@/components/icons/child2d';
import type { QoldauAsset, AACCardConfig } from '@/types/assets';

/**
 * ChildFavorites (v1.5+ D) — любимые карточки ребёнка.
 *
 * Фичи:
 * - Плитки рендерятся через `IconRenderer(asset)` — загруженные обложки
 *   видны edge-to-edge (см. §3.1 спеки — раньше был хардкод icon-map).
 * - Сетка `grid-cols-2` для медиа-обложек (крупнее), плитки без картинки
 *   тоже aspect-[4/3].
 * - Play-бейдж (▶) по `mediaKind` (video/audio) — поверх обложки.
 * - Edit-режим (parent/demo): тап → AssetPicker (built-in + ImageUpload).
 * - «＋ Добавить любимое» — пунктирная плитка (лимит 12).
 * - Удаление в edit-режиме — через ConfirmSheet.
 */

interface EditState {
  /** Какая карточка сейчас настраивается (или null если ничего). */
  cardId: string;
  /** Какой аспект правим: asset / label / mediaKind. */
  field: 'asset' | 'label' | 'mediaKind';
}

export const ChildFavorites: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { currentRole } = useRoleStore();
  const assets = useAssetStore((s) => s.assets);
  const cardConfigs = useAssetStore((s) => s.cardConfigs);
  const setCardAsset = useAssetStore((s) => s.setCardAsset);
  const setCardLabel = useAssetStore((s) => s.setCardLabel);
  const setCardMediaKind = useAssetStore((s) => s.setCardMediaKind);
  const addFavoriteCard = useAssetStore((s) => s.addFavoriteCard);
  const removeFavoriteCard = useAssetStore((s) => s.removeFavoriteCard);

  const [selected, setSelected] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [toastLimit, setToastLimit] = useState(false);

  const favoriteCards: AACCardConfig[] = cardConfigs
    .filter(
      (c) =>
        c.childId === DEMO_PRIMARY_CHILD.id &&
        (c.eventType === 'media_request' || c.isFavorite),
    )
    .sort((a, b) => a.order - b.order);

  const getAsset = (config: AACCardConfig): QoldauAsset | undefined =>
    assets.find((a) => a.id === config.assetId);

  const showFeedback = (cardId: string) => {
    setSelected(cardId);
    setTimeout(() => setSelected(null), 1500);
  };

  const handleSelect = (config: AACCardConfig) => {
    if (editMode) return; // в edit-режиме тап = редактирование, не выбор
    const asset = getAsset(config);
    speak(config.label);
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
        assetType: asset?.type,
        source: 'child_favorite',
      },
    });
    showFeedback(config.id);
  };

  const isEditable = currentRole !== 'child';

  const handleAddFavorite = () => {
    triggerHaptic('tap');
    const id = addFavoriteCard(DEMO_PRIMARY_CHILD.id);
    if (!id) {
      // лимит 12 — короткий тост
      setToastLimit(true);
      setTimeout(() => setToastLimit(false), 1500);
      return;
    }
    // Сразу открываем picker для новой карточки
    setEditMode(true);
    setEditState({ cardId: id, field: 'asset' });
  };

  const handleRemove = (cardId: string) => {
    setPendingRemove(null);
    removeFavoriteCard(cardId);
    triggerHaptic('tap');
  };

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
            onClick={() => {
              setEditMode((v) => !v);
              setEditState(null);
            }}
            className={`ml-auto w-[42px] h-[42px] rounded-[14px] border-0 flex items-center justify-center transition-colors ${
              editMode ? 'bg-teal-soft text-teal-dark' : 'bg-white text-ink-soft shadow-card hover:bg-bg'
            }`}
            aria-label="Настроить любимые"
            aria-pressed={editMode}
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {editMode && (
        <QoldauCard variant="tinted-yellow" padding="sm" className="mx-5 mt-3">
          <p className="text-sm text-ink-2 leading-relaxed">
            <strong>Режим настройки.</strong> Нажмите на плитку, чтобы изменить
            обложку, название или тип. <strong>＋</strong> добавит новое любимое.
          </p>
        </QoldauCard>
      )}

      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {favoriteCards.map((config) => {
          const asset = getAsset(config);
          const isSelected = selected === config.id;
          const isEditingThis = editState?.cardId === config.id;
          const hasImage = !!asset?.dataUrl || !!asset?.imageUrl;
          const showPlayBadge =
            config.mediaKind === 'video' || config.mediaKind === 'audio';

          return (
            <div key={config.id} className="relative">
              <button
                onClick={() => {
                  if (editMode) {
                    setEditState({ cardId: config.id, field: 'asset' });
                  } else {
                    handleSelect(config);
                  }
                }}
                className={`relative w-full rounded-[24px] shadow-card overflow-hidden flex flex-col ${
                  hasImage
                    ? 'aspect-[4/3] min-h-[120px]'
                    : 'aspect-[4/3] min-h-[120px] bg-white'
                } transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${
                  isSelected ? 'scale-95 opacity-80' : ''
                } ${isEditingThis ? 'ring-2 ring-teal/50' : ''}`}
                aria-label={`${config.label}${editMode ? ' (нажмите чтобы изменить)' : ''}`}
              >
                {hasImage ? (
                  <>
                    <IconRenderer
                      asset={asset}
                      size={400}
                      rounded={false}
                      className="w-full h-full"
                    />
                    {/* Лейбл-чип поверх картинки */}
                    <span className="absolute bottom-2 left-2 right-2 bg-white/85 backdrop-blur rounded-[14px] px-2.5 py-1.5">
                      <span className="block text-sm font-black text-ink leading-tight text-center truncate">
                        {config.label}
                      </span>
                    </span>
                    {/* Play-бейдж — только video/audio */}
                    {showPlayBadge && (
                      <span
                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/45 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <Play className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
                      </span>
                    )}
                  </>
                ) : (
                  // Плитка без картинки — иконка по центру + лейбл снизу
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3">
                    <div className="w-14 h-14 rounded-[18px] bg-teal-soft flex items-center justify-center">
                      <Music2DIcon size={36} animated={false} />
                    </div>
                    <span className="text-sm font-black text-ink leading-tight text-center">
                      {config.label}
                    </span>
                    {showPlayBadge && (
                      <span
                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/45 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <Play className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Удаление в edit-режиме — кнопка-крестик в углу */}
              {editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRemove(config.id);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-coral text-coral flex items-center justify-center shadow-card hover:bg-coral-soft transition-colors z-10"
                  aria-label={`Убрать «${config.label}» из любимых`}
                >
                  <X className="w-4 h-4" strokeWidth={3} />
                </button>
              )}
            </div>
          );
        })}

        {/* «＋ Добавить любимое» — пунктирная плитка (edit-режим) */}
        {editMode && (
          <button
            onClick={handleAddFavorite}
            disabled={favoriteCards.length >= MAX_FAVORITES}
            className={`aspect-[4/3] min-h-[120px] rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
              favoriteCards.length >= MAX_FAVORITES
                ? 'border-line text-muted opacity-50 cursor-not-allowed'
                : 'border-line text-ink-2 hover:border-teal hover:text-teal-dark hover:bg-teal-tint/30'
            }`}
            aria-label="Добавить любимое"
          >
            <Plus className="w-8 h-8" strokeWidth={2.2} />
            <span className="text-sm font-bold">Добавить любимое</span>
          </button>
        )}

        {favoriteCards.length === 0 && !editMode && (
          <p className="col-span-2 text-center text-sm text-muted py-6">
            Нет любимых карточек.
          </p>
        )}
      </div>

      {/* AssetPicker — выбор обложки (built-in или своё изображение) */}
      {editState?.field === 'asset' && (
        <AssetPicker
          isOpen={editState?.field === 'asset'}
          selectedAssetId={cardConfigs.find((c) => c.id === editState.cardId)?.assetId}
          category="media"
          onSelect={(asset) => {
            setCardAsset(editState.cardId, asset.id);
            setEditState({ cardId: editState.cardId, field: 'label' });
          }}
          onClose={() => setEditState(null)}
          title="Изменить обложку любимого"
        />
      )}

      {/* Редактор названия + тип медиа — мини-sheet */}
      {editState?.field === 'label' && (
        <EditCardSheet
          card={cardConfigs.find((c) => c.id === editState.cardId)!}
          onClose={() => {
            setEditState(null);
            // После редактирования новой карточки — выходим из edit-режима
            setEditMode(false);
          }}
          onSaveLabel={(label) => {
            setCardLabel(editState.cardId, label);
          }}
          onSaveMediaKind={(kind) => {
            setCardMediaKind(editState.cardId, kind);
          }}
        />
      )}

      {/* ConfirmSheet — подтверждение удаления */}
      <ConfirmSheet
        open={!!pendingRemove}
        title="Убрать из любимых?"
        subtitle="Карточка исчезнет с экрана ребёнка"
        confirmTone="coral"
        confirmLabel="Убрать"
        onConfirm={() => pendingRemove && handleRemove(pendingRemove)}
        onCancel={() => setPendingRemove(null)}
      />

      {/* Success feedback */}
      {selected && (
        <div className="fixed bottom-24 inset-x-4 z-50 mx-auto max-w-sm qoldau-success-pop">
          <QoldauCard variant="tinted-teal" padding="md" className="text-center">
            <p className="font-black text-ink">✓ Мама увидит запрос</p>
            <p className="text-sm text-ink-2 opacity-90 mt-1">Событие добавлено в Event Timeline</p>
          </QoldauCard>
        </div>
      )}

      {/* Тост: лимит 12 */}
      {toastLimit && (
        <div className="fixed bottom-24 inset-x-4 z-50 mx-auto max-w-sm qoldau-success-pop">
          <QoldauCard variant="tinted-yellow" padding="sm" className="text-center">
            <p className="text-sm font-bold text-ink">
              Уже {MAX_FAVORITES} любимых — больше не добавить
            </p>
          </QoldauCard>
        </div>
      )}
    </div>
  );
};

// === EditCardSheet — мини-редактор (название + тип медиа) ===
const EditCardSheet: React.FC<{
  card: AACCardConfig;
  onClose: () => void;
  onSaveLabel: (label: string) => void;
  onSaveMediaKind: (kind: AACCardConfig['mediaKind']) => void;
}> = ({ card, onClose, onSaveLabel, onSaveMediaKind }) => {
  const [label, setLabel] = useState(card.label);
  const [kind, setKind] = useState<AACCardConfig['mediaKind']>(card.mediaKind ?? 'app');

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Настройки любимого"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: 'rgba(7, 27, 58, 0.28)' }}
    >
      <div className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-card p-5 mx-3 mb-3 qoldau-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[18px] font-black text-ink">Настройки любимого</p>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bg border border-line text-muted flex items-center justify-center hover:bg-line-soft transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <label className="block text-sm font-bold text-ink-2 mb-1.5">Название</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={24}
          className="w-full bg-bg border border-line rounded-2xl px-4 py-3 text-base font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 mb-4"
          aria-label="Название карточки"
        />

        <p className="block text-sm font-bold text-ink-2 mb-2">Тип медиа</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {(['video', 'audio', 'photo', 'app'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-2xl px-3 py-2 text-sm font-bold border-2 transition-colors ${
                kind === k
                  ? 'bg-teal-soft border-teal text-teal-dark'
                  : 'bg-white border-line text-ink-2 hover:bg-bg'
              }`}
              aria-label={`Тип: ${k}`}
              aria-pressed={kind === k}
            >
              {k === 'video' && 'Видео'}
              {k === 'audio' && 'Аудио'}
              {k === 'photo' && 'Фото'}
              {k === 'app' && 'Приложение'}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onSaveLabel(label.trim() || 'Любимое');
            onSaveMediaKind(kind);
            onClose();
          }}
          className="w-full bg-green text-white rounded-2xl py-3.5 text-base font-black shadow-md transition-transform duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};