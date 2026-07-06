/**
 * Тесты для D-фич child-страниц (v1.5+ D):
 *
 * CallMom:
 * - 3 контакта в фикс-порядке: Мама, Папа, Тьютор.
 * - Канал-бейдж: ☎ для Мамы/Папы, ▶ для Тьютора.
 * - «Срочно» открывает ConfirmSheet, НЕ шлёт event до подтверждения.
 * - ✓ в ConfirmSheet создаёт `sos` event.
 * - «Написать сообщение» открывает sheet с пресет-чипами.
 * - Тап пресет-чипа создаёт `communication` event.
 *
 * Speak fallback:
 * - Ряд из 4 карточек: Вода, Мама, Туалет, Домой.
 * - Тап создаёт `aac_card` event с payload.source='speak_fallback'.
 * - Ряд скрыт при isRecording.
 *
 * Favorites:
 * - Плитка с dataUrl рендерит обложку (img, не иконку по id-map).
 * - Play-бейдж появляется для mediaKind=video/audio.
 * - «＋ Добавить любимое» создаёт новую карточку через addFavoriteCard.
 * - Удаление через ConfirmSheet.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mocks: speech + haptics (jsdom)
vi.mock('@/lib/tts/speak', () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
  isSpeechSupported: vi.fn(() => false),
}));
vi.mock('@/lib/feedback/haptics', () => ({
  triggerHaptic: vi.fn(),
}));

// Mock SpeechRecognition (как в test/setup.ts) — на всякий случай для Speak
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  onresult: null,
  onerror: null,
  onend: null,
  continuous: false,
  interimResults: false,
  lang: 'ru-RU',
}));
(globalThis as any).SpeechRecognition = mockSpeechRecognition;
(globalThis as any).webkitSpeechRecognition = mockSpeechRecognition;

import { ChildCall } from '@/pages/child/CallMom';
import { ChildSpeak } from '@/pages/child/ChildSpeak';
import { ChildFavorites } from '@/pages/child/ChildFavorites';
import { useEventStore } from '@/store/useEventStore';
import { useAssetStore } from '@/store/useAssetStore';
import { useRoleStore } from '@/store/useRoleStore';

const renderWithRouter = (path: string, ui: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );

describe('CallMom (v1.5+ D)', () => {
  beforeEach(() => {
    useEventStore.getState().setEvents([]);
    useAssetStore.getState().resetAssets();
    useRoleStore.setState({ currentRole: 'child' });
  });

  it('рендерит 3 контакта в фикс-порядке: Мама, Папа, Тьютор', () => {
    renderWithRouter('/child/call', <ChildCall />);
    const callButtons = screen.getAllByRole('button', { name: /Позвать/ });
    expect(callButtons).toHaveLength(3);
    expect(callButtons[0]).toHaveAccessibleName('Позвать Мама');
    expect(callButtons[1]).toHaveAccessibleName('Позвать Папа');
    expect(callButtons[2]).toHaveAccessibleName('Позвать Тьютор');
  });

  it('«Срочно» открывает ConfirmSheet — НЕ шлёт event до ✓', async () => {
    renderWithRouter('/child/call', <ChildCall />);
    const eventsBefore = useEventStore.getState().events.length;

    const sosBtn = screen.getByLabelText(/Срочно/);
    await userEvent.click(sosBtn);

    // Появился диалог
    expect(screen.getByRole('dialog', { name: /Позвать срочно/ })).toBeInTheDocument();

    // Event ещё не создан
    expect(useEventStore.getState().events.length).toBe(eventsBefore);

    // ✓ создаёт sos
    await userEvent.click(screen.getByLabelText('Подтвердить'));
    const after = useEventStore.getState().events;
    expect(after.length).toBe(eventsBefore + 1);
    const last = after[after.length - 1];
    expect(last.type).toBe('sos');
    expect(last.title).toContain('SOS');
  });

  it('«Срочно» → ✕ закрывает sheet без event', async () => {
    renderWithRouter('/child/call', <ChildCall />);
    const eventsBefore = useEventStore.getState().events.length;

    await userEvent.click(screen.getByLabelText(/Срочно/));
    expect(screen.getByRole('dialog', { name: /Позвать срочно/ })).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Отмена'));
    // dialog исчез
    expect(screen.queryByRole('dialog', { name: /Позвать срочно/ })).not.toBeInTheDocument();
    // event не создан
    expect(useEventStore.getState().events.length).toBe(eventsBefore);
  });

  it('тап контакта «Мама» создаёт sos event с targetPerson=mom и channel=call', async () => {
    renderWithRouter('/child/call', <ChildCall />);
    const eventsBefore = useEventStore.getState().events.length;

    await userEvent.click(screen.getByLabelText('Позвать Мама'));

    const after = useEventStore.getState().events;
    expect(after.length).toBe(eventsBefore + 1);
    const last = after[after.length - 1];
    // v1.6 E10.2.12: канонический тип. Обычное «Позвать» (телефон/видео) →
    // 'communication'. Только ConfirmSheet-подтверждённый «Срочно» → 'sos'.
    expect(last.type).toBe('communication');
    expect((last.payload as any).targetPerson).toBe('mom');
    expect((last.payload as any).channel).toBe('call');
  });

  it('тап контакта «Тьютор» создаёт event с channel=video', async () => {
    renderWithRouter('/child/call', <ChildCall />);

    await userEvent.click(screen.getByLabelText('Позвать Тьютор'));

    const last = useEventStore.getState().events.at(-1);
    expect((last?.payload as any).channel).toBe('video');
  });

  it('«Написать сообщение» открывает sheet с пресет-чипами', async () => {
    renderWithRouter('/child/call', <ChildCall />);

    await userEvent.click(screen.getByLabelText('Написать сообщение'));

    const sheet = screen.getByRole('dialog', { name: /Написать сообщение/ });
    expect(sheet).toBeInTheDocument();
    // Все 4 дефолтных пресета из стора
    expect(within(sheet).getByText('Скучаю')).toBeInTheDocument();
    expect(within(sheet).getByText('Когда придёшь?')).toBeInTheDocument();
    expect(within(sheet).getByText('Всё хорошо')).toBeInTheDocument();
    expect(within(sheet).getByText('Люблю тебя')).toBeInTheDocument();
  });

  it('тап пресет-чипа создаёт communication event с text', async () => {
    renderWithRouter('/child/call', <ChildCall />);
    const eventsBefore = useEventStore.getState().events.length;

    await userEvent.click(screen.getByLabelText('Написать сообщение'));
    await userEvent.click(screen.getByLabelText('Отправить: Скучаю'));

    const after = useEventStore.getState().events;
    expect(after.length).toBe(eventsBefore + 1);
    const last = after[after.length - 1];
    expect(last.type).toBe('communication');
    expect((last.payload as any).source).toBe('child_message');
    expect((last.payload as any).text).toBe('Скучаю');
  });
});

describe('ChildSpeak fallback (v1.5+ D)', () => {
  beforeEach(() => {
    useEventStore.getState().setEvents([]);
    useAssetStore.getState().resetAssets();
  });

  it('рендерит 4 fallback-карточки: Вода, Мама, Туалет, Домой', () => {
    renderWithRouter('/child/speak', <ChildSpeak />);
    expect(screen.getByLabelText('Вода')).toBeInTheDocument();
    expect(screen.getByLabelText('Мама')).toBeInTheDocument();
    expect(screen.getByLabelText('Туалет')).toBeInTheDocument();
    expect(screen.getByLabelText('Домой')).toBeInTheDocument();
  });

  it('тап fallback-карточки создаёт aac_card event с source=speak_fallback', async () => {
    renderWithRouter('/child/speak', <ChildSpeak />);
    const eventsBefore = useEventStore.getState().events.length;

    await userEvent.click(screen.getByLabelText('Вода'));

    const after = useEventStore.getState().events;
    expect(after.length).toBe(eventsBefore + 1);
    const last = after[after.length - 1];
    expect(last.type).toBe('aac_card');
    expect((last.payload as any).source).toBe('speak_fallback');
    expect((last.payload as any).label).toBe('Вода');
  });

  it('fallback-ряд скрыт при isRecording', async () => {
    renderWithRouter('/child/speak', <ChildSpeak />);

    // Изначально ряд виден
    expect(screen.getByLabelText('Вода')).toBeInTheDocument();

    // Кликаем по большой кнопке микрофона чтобы начать запись
    const micButton = screen.getByLabelText('Начать запись');
    await userEvent.click(micButton);

    // Ряд скрыт
    expect(screen.queryByLabelText('Вода')).not.toBeInTheDocument();
  });
});

describe('ChildFavorites (v1.5+ D)', () => {
  beforeEach(() => {
    useEventStore.getState().setEvents([]);
    useAssetStore.getState().resetAssets();
    useRoleStore.setState({ currentRole: 'parent' }); // edit-режим доступен
  });

  it('плитка с dataUrl рендерит обложку через IconRenderer (img)', () => {
    // Создаём custom asset с dataUrl и привязываем к cartoon-карточке
    const asset = useAssetStore.getState().addCustomAsset({
      type: 'media_cover',
      category: 'media',
      label: 'Мой мультик',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      builtinKey: 'Cartoon',
    });
    useAssetStore.getState().setCardAsset('cartoon', asset.id);

    renderWithRouter('/child/favorites', <ChildFavorites />);

    // img с dataUrl отрендерился
    const img = screen.getByAltText('Мой мультик');
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
    expect((img as HTMLImageElement).src).toContain('data:image/png');
  });

  it('play-бейдж появляется для mediaKind=video (cartoon)', () => {
    renderWithRouter('/child/favorites', <ChildFavorites />);
    // cartoon имеет mediaKind='video' по дефолту → ищем плитку с play
    const cartoonTile = screen.getByLabelText(/Мультик/);
    expect(cartoonTile).toBeInTheDocument();
    // Play icon (svg) внутри плитки — ищем по атрибуту aria-hidden (бейдж aria-hidden)
    const playBadge = cartoonTile.querySelector('[aria-hidden="true"] svg');
    expect(playBadge).toBeTruthy();
  });

  it('play-бейдж НЕ появляется для photo (cars)', () => {
    renderWithRouter('/child/favorites', <ChildFavorites />);
    const carsTile = screen.getByLabelText(/Машинки/);
    // Машинки mediaKind='photo' — без play-бейджа
    // Проверяем что в cars нет play icon (но карточка с иконкой имеет aria-hidden на других элементах)
    // cars не имеет dataUrl → рендерится через Music2DIcon fallback → нет play badge
    const playIcon = carsTile.querySelector('svg.lucide-play, svg[class*="lucide-play"]');
    expect(playIcon).toBeNull();
  });

  it('edit-режим: «＋ Добавить любимое» создаёт новую карточку', async () => {
    renderWithRouter('/child/favorites', <ChildFavorites />);

    const beforeCount = useAssetStore
      .getState()
      .cardConfigs.filter((c) => c.eventType === 'media_request').length;

    // Включаем edit-режим
    await userEvent.click(screen.getByLabelText('Настроить любимые'));
    // Кликаем «＋ Добавить любимое»
    await userEvent.click(screen.getByLabelText('Добавить любимое'));

    const afterCount = useAssetStore
      .getState()
      .cardConfigs.filter((c) => c.eventType === 'media_request').length;
    expect(afterCount).toBe(beforeCount + 1);
  });

  it('edit-режим: удаление через ConfirmSheet (✓) удаляет карточку', async () => {
    renderWithRouter('/child/favorites', <ChildFavorites />);

    // Включаем edit-режим
    await userEvent.click(screen.getByLabelText('Настроить любимые'));
    const beforeCount = useAssetStore.getState().cardConfigs.length;

    // Нажимаем ✕ на одной из плиток (первый найденный с aria-label «Убрать»)
    const removeBtn = screen.getAllByLabelText(/Убрать/)[0];
    await userEvent.click(removeBtn);

    // Появился ConfirmSheet
    expect(screen.getByRole('dialog', { name: /Убрать из любимых/ })).toBeInTheDocument();

    // ✓ подтверждаем
    await userEvent.click(screen.getByLabelText('Убрать'));

    expect(useAssetStore.getState().cardConfigs.length).toBe(beforeCount - 1);
  });

  it('edit-режим: удаление через ConfirmSheet (✕) НЕ удаляет', async () => {
    renderWithRouter('/child/favorites', <ChildFavorites />);

    await userEvent.click(screen.getByLabelText('Настроить любимые'));
    const beforeCount = useAssetStore.getState().cardConfigs.length;

    const removeBtn = screen.getAllByLabelText(/Убрать/)[0];
    await userEvent.click(removeBtn);

    // Появился ConfirmSheet — отменяем
    await userEvent.click(screen.getByLabelText('Отмена'));

    expect(useAssetStore.getState().cardConfigs.length).toBe(beforeCount);
  });
});