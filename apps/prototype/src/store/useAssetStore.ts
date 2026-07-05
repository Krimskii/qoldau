import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QoldauAsset, AACCardConfig, AssetCategory } from '@/types/assets';
import { BUILTIN_ASSETS, BUILTIN_IDS, toQoldauAsset, getBuiltinId } from '@/data/assetRegistry';

/**
 * useAssetStore — единое хранилище ассетов и AAC-карточек (v1.5+ D).
 *
 * - Built-in ассеты инициализируются из assetRegistry (id стабильные).
 * - Custom (user-uploaded) ассеты и cardConfigs persist в localStorage.
 * - dataUrl для загруженных изображений хранится в localStorage как есть
 *   (но ImageUpload ограничивает размер 2 MB).
 *
 * v1.5+ D additions:
 * - AACCardConfig.mediaKind (video/audio/photo/app) — play-бейдж в Favorites.
 * - addFavoriteCard / removeFavoriteCard — родитель добавляет/убирает любимые.
 * - setCardMediaKind — меняет тип медиа.
 * - messagePresets (string[]) + setMessagePresets — фразы «Написать сообщение».
 * - version 2 + migrate v1→v2 — добавляет mediaKind для старых карточек и
 *   messagePresets если отсутствуют.
 */

interface AssetState {
  /** Все ассеты (built-in + custom). */
  assets: QoldauAsset[];
  /** Конфиги AAC-карточек (label + assetId). */
  cardConfigs: AACCardConfig[];
  /** Пресет-фразы для «Написать сообщение» (CallMom §1.2). */
  messagePresets: string[];

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
  setCardMediaKind: (cardId: string, mediaKind: AACCardConfig['mediaKind']) => void;
  addFavoriteCard: (childId: string) => string | undefined;
  removeFavoriteCard: (cardId: string) => void;
  getCardConfig: (cardId: string) => AACCardConfig | undefined;
  getCardConfigsByChild: (childId: string) => AACCardConfig[];

  // Message presets
  setMessagePresets: (presets: string[]) => void;

  // Reset
  resetAssets: () => void;
  resetCustomAssets: () => void;
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_MESSAGE_PRESETS = ['Скучаю', 'Когда придёшь?', 'Всё хорошо', 'Люблю тебя'];

/**
 * Маппинг id дефолтной favorite-карточки → mediaKind (v1.5+ D §3.3).
 * Используется только при первичном сидинге (нет persist), чтобы плитки
 * сразу получили play-бейдж по типу контента.
 */
const DEFAULT_FAVORITE_MEDIA_KIND: Record<string, 'video' | 'audio' | 'photo' | 'app'> = {
  cartoon: 'video',
  songs: 'audio',
  animals: 'video',
  cars: 'photo',
  'calm-video': 'video',
};

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
    mediaKind?: AACCardConfig['mediaKind'];
  }> = [
    // Базовые потребности
    { id: 'card-water', label: 'Пить', phrase: 'Хочу пить', builtinKey: 'Water', category: 'need', eventType: 'aac_card' },
    { id: 'card-food', label: 'Еда', phrase: 'Хочу есть', builtinKey: 'Food', category: 'need', eventType: 'aac_card' },
    { id: 'card-toilet', label: 'Туалет', phrase: 'Хочу в туалет', builtinKey: 'Toilet', category: 'need', eventType: 'aac_card' },
    // Самочувствие
    { id: 'card-pain', label: 'Больно', phrase: 'Мне больно', builtinKey: 'Sad', category: 'feeling', eventType: 'aac_card' },
    { id: 'card-tired', label: 'Устал', phrase: 'Я устал', builtinKey: 'Sleep', category: 'feeling', eventType: 'aac_card' },
    // Коммуникация и активности
    { id: 'card-help', label: 'Помоги', phrase: 'Мне нужна помощь', builtinKey: 'Help', category: 'feeling', eventType: 'aac_card' },
    { id: 'card-pause', label: 'Пауза', phrase: 'Я хочу паузу', builtinKey: 'Pause', category: 'calm', eventType: 'aac_card' },
    { id: 'card-loud', label: 'Громко', phrase: 'Мне громко', builtinKey: 'Headphones', category: 'calm', eventType: 'aac_card' },
    { id: 'card-play', label: 'Играть', phrase: 'Хочу играть', builtinKey: 'Play', category: 'activity', eventType: 'aac_card' },
    { id: 'card-home', label: 'Домой', phrase: 'Хочу домой', builtinKey: 'Home', category: 'need', eventType: 'aac_card' },
    { id: 'card-hug', label: 'Обниматься', phrase: 'Обнимите меня', builtinKey: 'Hug', category: 'calm', eventType: 'aac_card' },
    // Ответы
    { id: 'card-yes', label: 'Да', phrase: 'Да', builtinKey: 'Yes', category: 'feeling', eventType: 'aac_card' },
    { id: 'card-no', label: 'Нет', phrase: 'Нет', builtinKey: 'No', category: 'feeling', eventType: 'aac_card' },
    // Люди
    { id: 'card-mom', label: 'Позвать маму', phrase: 'Позовите маму', builtinKey: 'Mom', category: 'person', eventType: 'sos' },
    { id: 'card-tutor', label: 'Позвать тьютора', phrase: 'Позовите тьютора', builtinKey: 'Tutor', category: 'person', eventType: 'sos' },
    // Медиа (любимые) — с mediaKind
    { id: 'cartoon', label: 'Мультик', phrase: 'Хочу мультик', builtinKey: 'Cartoon', category: 'media', eventType: 'media_request', mediaKind: 'video' },
    { id: 'songs', label: 'Песенки', phrase: 'Хочу песенки', builtinKey: 'Music', category: 'media', eventType: 'media_request', mediaKind: 'audio' },
    { id: 'animals', label: 'Животные', phrase: 'Хочу про животных', builtinKey: 'Animals', category: 'media', eventType: 'media_request', mediaKind: 'video' },
    { id: 'cars', label: 'Машинки', phrase: 'Хочу машинки', builtinKey: 'Cars', category: 'media', eventType: 'media_request', mediaKind: 'photo' },
    { id: 'calm-video', label: 'Спокойное видео', phrase: 'Спокойное видео', builtinKey: 'Video', category: 'media', eventType: 'media_request', mediaKind: 'video' },
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
    ...(c.mediaKind ? { mediaKind: c.mediaKind } : {}),
  }));
}

const DEFAULT_CHILD_ID = 'child-alikhan';
const MAX_FAVORITES = 12;

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: buildInitialAssets(),
      cardConfigs: buildDefaultCardConfigs(DEFAULT_CHILD_ID),
      messagePresets: DEFAULT_MESSAGE_PRESETS,

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

      setCardMediaKind: (cardId, mediaKind) =>
        set((state) => ({
          cardConfigs: state.cardConfigs.map((c) =>
            c.id === cardId ? { ...c, mediaKind } : c,
          ),
        })),

      addFavoriteCard: (childId) => {
        const state = get();
        const existing = state.cardConfigs.filter(
          (c) =>
            c.childId === childId &&
            (c.eventType === 'media_request' || c.isFavorite),
        );
        if (existing.length >= MAX_FAVORITES) {
          // Не добавляем — лимит (можно показать toast снаружи)
          return undefined;
        }
        const orderMax = state.cardConfigs.reduce(
          (max, c) => Math.max(max, c.order),
          -1,
        );
        const id = newId('fav');
        const newCard: AACCardConfig = {
          id,
          childId,
          label: 'Новое любимое',
          phrase: 'Хочу любимое',
          // Дефолтная иконка — паззл (Music как универсальный встроенный)
          assetId: BUILTIN_IDS['media/Music'] ?? 'builtin-Music',
          eventType: 'media_request',
          category: 'media',
          order: orderMax + 1,
          isFavorite: true,
          mediaKind: 'app',
        };
        set((s) => ({ cardConfigs: [...s.cardConfigs, newCard] }));
        return id;
      },

      removeFavoriteCard: (cardId) =>
        set((state) => ({
          cardConfigs: state.cardConfigs.filter((c) => c.id !== cardId),
        })),

      getCardConfig: (cardId) =>
        get().cardConfigs.find((c) => c.id === cardId),
      getCardConfigsByChild: (childId) =>
        get().cardConfigs.filter((c) => c.childId === childId),

      setMessagePresets: (presets) =>
        set(() => ({ messagePresets: presets.slice(0, 12) })),

      resetAssets: () =>
        set({
          assets: buildInitialAssets(),
          cardConfigs: buildDefaultCardConfigs(DEFAULT_CHILD_ID),
          messagePresets: DEFAULT_MESSAGE_PRESETS,
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
        messagePresets: state.messagePresets,
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

        // v1→v2: если messagePresets нет — добавим дефолт (v1 persist не сохранял).
        if (!Array.isArray(state.messagePresets)) {
          state.messagePresets = DEFAULT_MESSAGE_PRESETS;
        }
      },
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState) return persistedState;
        // v1 → v2: добавляем mediaKind для старых favorite-карточек по id-маппингу,
        // и обеспечиваем наличие messagePresets.
        if (version < 2) {
          if (Array.isArray(persistedState.cardConfigs)) {
            persistedState.cardConfigs = persistedState.cardConfigs.map(
              (c: AACCardConfig) => {
                if (c.mediaKind) return c;
                const kind = DEFAULT_FAVORITE_MEDIA_KIND[c.id];
                if (kind) return { ...c, mediaKind: kind };
                return c;
              },
            );
          }
          if (!Array.isArray(persistedState.messagePresets)) {
            persistedState.messagePresets = DEFAULT_MESSAGE_PRESETS;
          }
        }
        return persistedState;
      },
    },
  ),
);

export { MAX_FAVORITES, DEFAULT_MESSAGE_PRESETS };