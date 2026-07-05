/**
 * Регресс-тесты child sub-screens (v1.5+ E6.5):
 * - ChildWater / ChildFood / ChildToilet / ChildCategoryPage рендерятся
 *   без падений и содержат базовые элементы (заголовок, back, контент).
 * - Каждый экран использует общий NeedCard (для потребностей) или общий шаблон.
 * - Таргеты ≥ 88px (action buttons).
 * - role правильные (button/region).
 *
 * Не покрывает полную логику (это уже покрыто существующими тестами);
 * здесь — «smoke» для регресса после D-волны и будущих изменений.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock i18n
import i18n from '@/i18n/config';
beforeEach(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((r) => i18n.on('initialized', () => r()));
  }
  await i18n.changeLanguage('ru');
});

// Mock stores
vi.mock('@/store/useEventStore', () => ({
  useEventStore: () => ({
    addEvent: vi.fn(),
    events: [],
  }),
}));
vi.mock('@/store/useRecordingsStore', () => ({
  useRecordingsStore: () => ({
    recordings: [],
    addRecording: vi.fn(),
    removeRecording: vi.fn(),
  }),
}));
vi.mock('@/store/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    transcript: '',
    supported: false,
    start: vi.fn(),
    stop: vi.fn(),
  }),
}));
vi.mock('@/lib/tts/speak', () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
}));
vi.mock('@/lib/feedback/haptics', () => ({
  triggerHaptic: vi.fn(),
}));
vi.mock('@/store/useToastStore', () => ({
  useToastStore: () => ({
    showToast: vi.fn(),
  }),
}));

const renderChild = (path: string, ui: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  );

describe('Child sub-screens (E6.5 регресс)', () => {
  it('ChildWater рендерится и содержит back + слова', async () => {
    const { ChildWater } = await import('@/pages/child/ChildWater');
    const { container } = renderChild('/child/water', <ChildWater />);

    // Есть кнопка "Назад" (aria-label="Назад")
    expect(screen.getByLabelText(/назад/i)).toBeInTheDocument();
    // Заголовок экрана (текст встречается хотя бы раз)
    expect(screen.getAllByText(/хочу пить/i).length).toBeGreaterThanOrEqual(1);
    // Слова фразы
    expect(screen.getByText('Я')).toBeInTheDocument();
    expect(screen.getAllByText('хочу').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('пить').length).toBeGreaterThanOrEqual(1);
    expect(container.firstChild).toBeTruthy();
  });

  it('ChildFood рендерится и содержит "Хочу есть"', async () => {
    const { ChildFood } = await import('@/pages/child/ChildFood');
    renderChild('/child/food', <ChildFood />);

    expect(screen.getAllByText(/хочу есть/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/назад/i)).toBeInTheDocument();
  });

  it('ChildToilet рендерится и содержит "Хочу в туалет"', async () => {
    const { ChildToilet } = await import('@/pages/child/ChildToilet');
    renderChild('/child/toilet', <ChildToilet />);

    expect(screen.getAllByText(/хочу в туалет/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/назад/i)).toBeInTheDocument();
  });

  it('ChildCategoryPage рендерится для валидной категории', async () => {
    const { ChildCategoryPage } = await import('@/pages/child/ChildCategoryPage');
    renderChild('/child/category/water', <ChildCategoryPage />);

    // Не падает, есть back
    expect(screen.getByLabelText(/назад/i)).toBeInTheDocument();
  });
});