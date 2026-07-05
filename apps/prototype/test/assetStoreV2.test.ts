/**
 * Тесты для useAssetStore v2 (v1.5+ D):
 * - addFavoriteCard (лимит 12, генерирует id, isFavorite: true, mediaKind='app').
 * - removeFavoriteCard (удаляет из cardConfigs).
 * - setCardMediaKind (обновляет поле).
 * - setMessagePresets + дефолтные пресеты.
 * - migrate v1→v2 (добавляет mediaKind для старых карточек + messagePresets).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssetStore, DEFAULT_MESSAGE_PRESETS, MAX_FAVORITES } from '@/store/useAssetStore';

describe('useAssetStore v2 (v1.5+ D)', () => {
  beforeEach(() => {
    // Полный reset стора перед каждым тестом
    useAssetStore.getState().resetAssets();
  });

  it('дефолтные карточки favorite имеют mediaKind по id-маппингу', () => {
    const cards = useAssetStore.getState().cardConfigs;
    const cartoon = cards.find((c) => c.id === 'cartoon');
    const songs = cards.find((c) => c.id === 'songs');
    const animals = cards.find((c) => c.id === 'animals');
    const cars = cards.find((c) => c.id === 'cars');
    const calmVideo = cards.find((c) => c.id === 'calm-video');
    expect(cartoon?.mediaKind).toBe('video');
    expect(songs?.mediaKind).toBe('audio');
    expect(animals?.mediaKind).toBe('video');
    expect(cars?.mediaKind).toBe('photo');
    expect(calmVideo?.mediaKind).toBe('video');
  });

  it('дефолтные messagePresets — 4 фразы из спеки', () => {
    expect(useAssetStore.getState().messagePresets).toEqual(DEFAULT_MESSAGE_PRESETS);
    expect(DEFAULT_MESSAGE_PRESETS).toContain('Скучаю');
    expect(DEFAULT_MESSAGE_PRESETS).toContain('Когда придёшь?');
    expect(DEFAULT_MESSAGE_PRESETS).toContain('Всё хорошо');
    expect(DEFAULT_MESSAGE_PRESETS).toContain('Люблю тебя');
  });

  it('addFavoriteCard создаёт новую favorite-карточку с правильным дефолтом', () => {
    const beforeCount = useAssetStore
      .getState()
      .cardConfigs.filter((c) => c.eventType === 'media_request').length;

    const newId = useAssetStore.getState().addFavoriteCard('child-alikhan');

    expect(newId).toBeTruthy();
    const created = useAssetStore
      .getState()
      .cardConfigs.find((c) => c.id === newId);
    expect(created).toBeDefined();
    expect(created?.eventType).toBe('media_request');
    expect(created?.isFavorite).toBe(true);
    expect(created?.category).toBe('media');
    expect(created?.childId).toBe('child-alikhan');
    expect(created?.mediaKind).toBe('app');

    const afterCount = useAssetStore
      .getState()
      .cardConfigs.filter((c) => c.eventType === 'media_request').length;
    expect(afterCount).toBe(beforeCount + 1);
  });

  it('addFavoriteCard возвращает undefined при превышении лимита MAX_FAVORITES', () => {
    const state = useAssetStore.getState();
    // Заполняем до MAX_FAVORITES favorite-карточек для child-alikhan
    const currentFav = state.cardConfigs.filter(
      (c) => c.childId === 'child-alikhan' && (c.eventType === 'media_request' || c.isFavorite),
    );
    const need = MAX_FAVORITES - currentFav.length;

    let lastId: string | undefined;
    for (let i = 0; i < need; i++) {
      lastId = state.addFavoriteCard('child-alikhan');
    }
    expect(lastId).toBeTruthy();

    // Лимит достигнут — следующий вызов возвращает undefined
    const overflow = useAssetStore.getState().addFavoriteCard('child-alikhan');
    expect(overflow).toBeUndefined();
  });

  it('removeFavoriteCard удаляет карточку из cardConfigs', () => {
    const id = useAssetStore.getState().addFavoriteCard('child-alikhan');
    expect(id).toBeTruthy();
    expect(useAssetStore.getState().cardConfigs.some((c) => c.id === id)).toBe(true);

    useAssetStore.getState().removeFavoriteCard(id!);
    expect(useAssetStore.getState().cardConfigs.some((c) => c.id === id)).toBe(false);
  });

  it('setCardMediaKind обновляет тип медиа для существующей карточки', () => {
    const cards = useAssetStore.getState().cardConfigs;
    const cartoon = cards.find((c) => c.id === 'cartoon');
    expect(cartoon).toBeDefined();
    expect(cartoon?.mediaKind).toBe('video');

    useAssetStore.getState().setCardMediaKind('cartoon', 'audio');
    const updated = useAssetStore.getState().cardConfigs.find((c) => c.id === 'cartoon');
    expect(updated?.mediaKind).toBe('audio');
  });

  it('setMessagePresets обновляет список и ограничивает 12', () => {
    useAssetStore.getState().setMessagePresets(['Привет', 'Пока']);
    expect(useAssetStore.getState().messagePresets).toEqual(['Привет', 'Пока']);

    const tooMany = Array.from({ length: 20 }, (_, i) => `Фраза ${i}`);
    useAssetStore.getState().setMessagePresets(tooMany);
    expect(useAssetStore.getState().messagePresets).toHaveLength(12);
  });

  describe('migrate v1 → v2', () => {
    it('добавляет mediaKind для старых favorite-карточек без него', () => {
      const persistedV1 = {
        assets: [],
        cardConfigs: [
          {
            id: 'cartoon',
            childId: 'child-alikhan',
            label: 'Мультик',
            phrase: 'Хочу мультик',
            assetId: 'a',
            eventType: 'media_request',
            category: 'media',
            order: 0,
            isFavorite: true,
            // mediaKind отсутствует — старая запись v1
          },
          {
            id: 'songs',
            childId: 'child-alikhan',
            label: 'Песенки',
            phrase: 'Хочу песенки',
            assetId: 'b',
            eventType: 'media_request',
            category: 'media',
            order: 1,
            isFavorite: true,
          },
          {
            id: 'card-water',
            childId: 'child-alikhan',
            label: 'Пить',
            phrase: 'Хочу пить',
            assetId: 'c',
            eventType: 'aac_card',
            category: 'need',
            order: 2,
            // не favorite — mediaKind не должен появляться
          },
        ],
        // messagePresets отсутствует — старая запись v1
      };

      // Вызываем migrate напрямую (как в zustand persist)
      const migrated = useAssetStore.persist.getOptions().migrate as any;
      const result = migrated(persistedV1, 1);

      expect(result.cardConfigs.find((c: any) => c.id === 'cartoon').mediaKind).toBe('video');
      expect(result.cardConfigs.find((c: any) => c.id === 'songs').mediaKind).toBe('audio');
      expect(result.cardConfigs.find((c: any) => c.id === 'card-water').mediaKind).toBeUndefined();
      expect(result.messagePresets).toEqual(DEFAULT_MESSAGE_PRESETS);
    });

    it('сохраняет уже-установленный mediaKind (не перезаписывает)', () => {
      const persisted = {
        assets: [],
        cardConfigs: [
          {
            id: 'cartoon',
            childId: 'child-alikhan',
            label: 'Мультик',
            phrase: '',
            assetId: 'a',
            eventType: 'media_request',
            category: 'media',
            order: 0,
            isFavorite: true,
            mediaKind: 'photo', // пользователь сам поставил
          },
        ],
      };

      const migrated = useAssetStore.persist.getOptions().migrate as any;
      const result = migrated(persisted, 1);

      expect(result.cardConfigs[0].mediaKind).toBe('photo');
    });
  });
});