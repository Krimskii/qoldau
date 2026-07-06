/**
 * E10 child UI tests (v1.6) — регресс-проверки фиксов из тикета.
 *
 * - NeedCard: «Озвучить фразу» + «Очистить» показываются только при
 *   непустой фразе (не disabled-серый мусор).
 * - PhraseBuilderPage: уровни communicationLevel фильтруют пресеты.
 * - CalmMode: плитки имеют visible label (не icon-only).
 * - ConfirmSheet: safe-area-inset-bottom.
 * - CallMom.handleCall: 'communication' (не 'sos' — только ConfirmSheet-Cрочно).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NeedCard } from '@/pages/child/NeedCard';
import { CalmMode } from '@/pages/child/CalmMode';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
// @ts-expect-error — vite raw import
import ConfirmSheetSource from '@/components/ui/ConfirmSheet.tsx?raw';
import { useChildSettingsStore } from '@/store/useChildSettingsStore';
import { useEventStore } from '@/store/useEventStore';
import { useRecordingsStore } from '@/store/useRecordingsStore';

function wrap(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('E10.1 — NeedCard (ChildWater/Food/Toilet)', () => {
  beforeEach(() => {
    useEventStore.setState({ events: [] });
  });

  it('«Озвучить фразу» и «Очистить» СКРЫТЫ когда фраза пустая (E10.2.6)', () => {
    wrap(
      <NeedCard
        config={{
          title: 'Хочу пить',
          HeroIcon: () => null as unknown as React.FC<{ size?: number }>,
          phraseHint: 'Я хочу пить',
          words: [],
          eventType: 'water',
          eventTitle: 'Просьба о воде',
          makeEventDescription: () => '',
        }}
      />,
    );
    // Empty state — нет кнопок «Озвучить» и «Очистить».
    expect(screen.queryByRole('button', { name: /озвучить фразу/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /очистить/i })).toBeNull();
  });
});

describe('E10.1 — ConfirmSheet safe-area', () => {
  it('sheet имеет safe-area padding в JSX (E10.1.1)', () => {
    // Структурная проверка через source: ConfirmSheet.tsx должен содержать
    // inline safeAreaStyle с max(env(safe-area-inset-bottom), 24px).
    // (jsdom-react не всегда экспонирует inline-style через cssText.)
    expect(ConfirmSheetSource).toMatch(/safe-area-inset-bottom/);
    expect(ConfirmSheetSource).toMatch(/max\(env\(safe-area-inset-bottom\)/);
  });
});

describe('E10.2 — CalmMode tiles', () => {
  beforeEach(() => {
    useEventStore.setState({ events: [] });
  });

  it('каждая плитка имеет visible label (не icon-only, E10.2.9)', () => {
    wrap(<CalmMode />);
    // 4 плитки с видимыми текстами.
    expect(screen.getByText('Пауза')).toBeTruthy();
    expect(screen.getByText('Дыхание')).toBeTruthy();
    expect(screen.getByText(/Наушники/i)).toBeTruthy();
    expect(screen.getByText(/Позвать взрослого/i)).toBeTruthy();
  });
});

describe('E10.2 — PhraseBuilderPage levels (E10.2.10)', () => {
  beforeEach(() => {
    useEventStore.setState({ events: [] });
    useChildSettingsStore.setState({ communicationLevel: 'basic' });
  });

  it('beginner: showWordBuilder=false (нет секции «Выбирай слова»)', async () => {
    useChildSettingsStore.setState({ communicationLevel: 'beginner' });
    const { PhraseBuilderPage } = await import('@/pages/child/PhraseBuilderPage');
    wrap(<PhraseBuilderPage />);
    // Beginner: только 4 пресета, нет "Выбирай слова"
    expect(screen.queryByText('Выбирай слова')).toBeNull();
    // 4 базовых пресета видны (Я хочу пить / Мне нужна помощь / Мне громко / Я хочу паузу)
    expect(screen.getByText('Я хочу пить')).toBeTruthy();
    expect(screen.getByText('Мне нужна помощь')).toBeTruthy();
    expect(screen.getByText('Мне громко')).toBeTruthy();
    expect(screen.getByText('Я хочу паузу')).toBeTruthy();
    // Продвинутые пресеты скрыты на beginner.
    expect(screen.queryByText('Позови маму')).toBeNull();
  });

  it('basic (default): все 8 пресетов + words builder', async () => {
    useChildSettingsStore.setState({ communicationLevel: 'basic' });
    const { PhraseBuilderPage } = await import('@/pages/child/PhraseBuilderPage');
    wrap(<PhraseBuilderPage />);
    // 8 пресетов
    expect(screen.getByText('Я хочу пить')).toBeTruthy();
    expect(screen.getByText('Позови маму')).toBeTruthy();
    expect(screen.getByText('Я устал')).toBeTruthy();
    // words builder
    expect(screen.getByText('Выбирай слова')).toBeTruthy();
  });

  it('advanced: пресеты скрыты, words builder виден', async () => {
    useChildSettingsStore.setState({ communicationLevel: 'advanced' });
    const { PhraseBuilderPage } = await import('@/pages/child/PhraseBuilderPage');
    wrap(<PhraseBuilderPage />);
    // Пресеты скрыты
    expect(screen.queryByText('Я хочу пить')).toBeNull();
    // words builder виден
    expect(screen.getByText('Выбирай слова')).toBeTruthy();
  });
});

describe('E10.2 — CallMom event types (E10.2.12)', () => {
  beforeEach(() => {
    useEventStore.setState({ events: [] });
  });

  it('handleCall для контакта создаёт «communication» (НЕ «sos»)', async () => {
    const { ChildCall } = await import('@/pages/child/CallMom');
    wrap(<ChildCall />);
    const momButton = screen.getByRole('button', { name: /позвать мама/i });
    momButton.click();
    const events = useEventStore.getState().events;
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('communication');
  });
});

describe('E10.2 — ChildSpeak history removed (E10.2.7)', () => {
  beforeEach(() => {
    useEventStore.setState({ events: [] });
    useRecordingsStore.setState({ recordings: [] });
  });

  it('нет секции «Недавние записи» с play/pause/delete', async () => {
    const { ChildSpeak } = await import('@/pages/child/ChildSpeak');
    wrap(<ChildSpeak />);
    // Старая секция с «Недавние записи» УДАЛЕНА.
    expect(screen.queryByText('Недавние записи')).toBeNull();
    // Нет play/pause/delete кнопок.
    expect(screen.queryByRole('button', { name: /воспроизвести/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /удалить запись/i })).toBeNull();
    // Вместо неё — простой статус («Нажми и говори» встречается и в status, и в empty card).
    expect(screen.getAllByText('Нажми и говори').length).toBeGreaterThan(0);
  });
});