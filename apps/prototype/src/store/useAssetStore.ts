import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QoldauAsset, AACCardConfig, AssetCategory } from '@/types/assets';
import { BUILTIN_ASSETS, BUILTIN_IDS, toQoldauAsset, getBuiltinId } from '@/data/assetRegistry';

/**
 * useAssetStore — единое хранилище ассетов и AAC-карточек.
 *
 * - Built-in ассеты инициализируются из assetRegistry (id стабильные).
 * - Custom (user-uploaded) ассеты и cardConfigs persist в localStorage.
 * - dataUrl для загруженных изображений хранится в localStorage как есть
 *   (но ImageUpload ограничивает размер 2 MB).
 */

interface AssetState {
  /** Все ассеты (built-in + custom). */
  assets: QoldauAsset[];
  /** Конфиги AAC-карточек (label + assetId). */
  cardConfigs: AACCardConfig[];

  // Asset actions
  addCustomAsset: (asset: Omit<QoldauAsset, 'id' | 'createdAt' | 'isCustom'>) => QoldauAsset;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<QoldauAsset>) => void;
  getAsset: (assetId: string) => QoldauAsset | undefined;
  getAssetsByCategory: (category: AssetCategory) => QoldauAsset[];
  getCustomAssets: () => QoldauAsset[];

  // Card config actions
  setCardAsset: (cardId: string, assetId: string) => void;
  setCardLabel: (cardId: string, label: string) => void;
  setCardFavorite: (cardId: string, isFavorite: boolean) => void;
  getCardConfig: (cardId: string) => AACCardConfig | undefined;
  getCardConfigsByChild: (childId: string) => AACCardConfig[];

  // Reset
  resetAssets: () => void;
  resetCustomAssets: () => void;
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Инициализация built-in ассетов. */
function buildInitialAssets(): QoldauAsset[] {
  return BUILTIN_ASSETS.map((builtin) =>
    toQoldauAsset(builtin, getBuiltinId(builtin.builtinKey, builtin.category)),
  );
}

/** Default card configs — для нового ребёнка. */
function buildDefaultCardConfigs(childId: string): AACCardConfig[] {
  const cards: Array<{
    id: string;
    label: string;
    phrase: string;
    builtinKey: string;
    category: AssetCategory;
    eventType: AACCardConfig['eventType'];
  }> = [
    { id: 'card-food', label: 'Еда', phrase: 'Хочу есть', builtinKey: 'Food', category: 'need', eventType: 'aac_card' },
    { id: 'card-pain', label: 'Больно', phrase: 'Мне больно', builtinKey: 'Sad', category: 'feeling', eventType: 'aac_card' },
    { id: 'card-tired', label: 'Устал', phrase: 'Я устал', builtinKey: 'Sleep', category: 'feeling', eventType: 'aac_card' },
    { id: 'card-home', label: 'Домой', phrase: 'Хочу домой', builtinKey: 'Home', category: 'need', eventType: 'aac_card' },
    { id: 'card-play', label: 'Играть', phrase: 'Хочу играть', builtinKey: 'Play', category: 'activity', eventType: 'aac_card' },
    { id: 'card-hug', label: 'Обниматься', phrase: 'Обнимите меня', builtinKey: 'Hug', category: 'calm', eventType: 'aac_card' },
    { id: 'card-no', label: 'Нет', phrase: 'Нет', builtinKey: 'No', category: 'feeling', eventType: 'aac_card' },
    { id: 'card-mom', label: 'Позвать маму', phrase: 'Позовите маму', builtinKey: 'Mom', category: 'person', eventType: 'sos' },
    { id: 'card-tutor', label: 'Позвать тьютора', phrase: 'Позовите тьютора', builtinKey: 'Tutor', category: 'person', eventType: 'sos' },
    { id: 'cartoon', label: 'Мультик', phrase: 'Хочу мультик', builtinKey: 'Cartoon', category: 'media', eventType: 'media_request', isFavorite: true } as any,
    { id: 'songs', label: 'Песенки', phrase: 'Хочу песенки', builtinKey: 'Music', category: 'media', eventType: 'media_request', isFavorite: true } as any,
    { id: 'animals', label: 'Животные', phrase: 'Хочу про животных', builtinKey: 'Animals', category: 'media', eventType: 'media_request', isFavorite: true } as any,
    { id: 'cars', label: 'Машинки', phrase: 'Хочу машинки', builtinKey: 'Cars', category: 'media', eventType: 'media_request', isFavorite: true } as any,
    { id: 'calm-video', label: 'Спокойное видео', phrase: 'Спокойное видео', builtinKey: 'Video', category: 'media', eventType: 'media_request', isFavorite: true } as any,
  ];

  return cards.map((c, i) => ({
    id: c.id,
    childId,
    label: c.label,
    phrase: c.phrase,
    assetId: BUILTIN_IDS[`${c.category}/${c.builtinKey}`] ?? `builtin-${c.builtinKey}`,
    eventType: c.eventType,
    category: c.category,
    order: i,
    isFavorite: c.eventType === 'media_request',
  }));
}

const DEFAULT_CHILD_ID = 'child-alikhan';

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: buildInitialAssets(),
      cardConfigs: buildDefaultCardConfigs(DEFAULT_CHILD_ID),

      addCustomAsset: (assetData) => {
        const asset: QoldauAsset = {
          ...assetData,
          id: newId('asset'),
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ assets: [...state.assets, asset] }));
        return asset;
      },

      removeAsset: (assetId) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== assetId || !a.isCustom),
        })),

      updateAsset: (assetId, updates) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId ? { ...a, ...updates } : a,
          ),
        })),

      getAsset: (assetId) => get().assets.find((a) => a.id === assetId),
      getAssetsByCategory: (category) =>
        get().assets.filter((a) => a.category === category),
      getCustomAssets: () => get().assets.filter((a) => a.isCustom),

      setCardAsset: (cardId, assetId) =>
        set((state) => ({
          cardConfigs: state.cardConfigs.map((c) =>
            c.id === cardId ? { ...c, assetId } : c,
          ),
        })),

      setCardLabel: (cardId, label) =>
        set((state) => ({
          cardConfigs: state.cardConfigs.map((c) =>
            c.id === cardId ? { ...c, label } : c,
          ),
        })),

      setCardFavorite: (cardId, isFavorite) =>
        set((state) => ({
          cardConfigs: state.cardConfigs.map((c) =>
            c.id === cardId ? { ...c, isFavorite } : c,
          ),
        })),

      getCardConfig: (cardId) =>
        get().cardConfigs.find((c) => c.id === cardId),
      getCardConfigsByChild: (childId) =>
        get().cardConfigs.filter((c) => c.childId === childId),

      resetAssets: () =>
        set({
          assets: buildInitialAssets(),
          cardConfigs: buildDefaultCardConfigs(DEFAULT_CHILD_ID),
        }),

      resetCustomAssets: () =>
        set((state) => ({
          assets: state.assets.filter((a) => !a.isCustom),
        })),
    }),
    {
      name: 'qoldau-assets-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assets: state.assets.filter((a) => a.isCustom), // persist только custom
        cardConfigs: state.cardConfigs,
      }),
      // При rehydrate — built-ins пересоздаются, persisted custom добавляются.
      // partialize сохраняет только custom assets, поэтому в state.assets сейчас
      // лежат ТОЛЬКО custom. Built-ins ре-сидим из registry.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const builtins = buildInitialAssets();
        const customPersisted = state.assets ?? [];

        // Dedupe built-ins vs custom: если у custom такой же builtinKey+category,
        // пропускаем built-in (custom побеждает).
        const builtinsToAdd = builtins.filter(
          (b) =>
            !customPersisted.some(
              (c) => c.builtinKey === b.builtinKey && c.category === b.category,
            ),
        );

        // Все custom assets из persist добавляются как есть (id уникальны по построению).
        state.assets = [...builtinsToAdd, ...customPersisted];

        if (!state.cardConfigs || state.cardConfigs.length === 0) {
          state.cardConfigs = buildDefaultCardConfigs(DEFAULT_CHILD_ID);
        }
      },
      version: 1,
    },
  ),
);