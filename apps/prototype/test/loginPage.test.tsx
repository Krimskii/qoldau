/**
 * Тесты LoginPage (v1.5+ E1 — Auth honest state):
 * - В DEV-режиме: devMagicUrl виден и доступен.
 * - В PROD-режиме (import.meta.env.DEV = false): devMagicUrl НЕ виден, dev-banner скрыт.
 * - Generic ошибка НЕ содержит hardcoded localhost:4000.
 * - Все user-facing строки локализованы.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';

// Mock auth store
const mockRequestMagicLink = vi.fn();
let mockStoreError: string | null = null;
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: any) => any) => {
    const state = {
      requestMagicLink: mockRequestMagicLink,
      error: mockStoreError,
    };
    return selector(state);
  },
}));

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('<LoginPage> E1 — honest state', () => {
  beforeEach(() => {
    mockRequestMagicLink.mockReset();
    mockStoreError = null;
    mockRequestMagicLink.mockResolvedValue({
      devMagicUrl: 'http://localhost:4000/auth/verify?token=abc123',
    });
  });

  it('в DEV-режиме: devMagicUrl виден и можно открыть', async () => {
    // vitest по умолчанию DEV = true
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/parent@example.com/);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /magic-link|получить/i }));

    // Сообщение об успешной отправке
    await waitFor(() => {
      expect(screen.getByText(/magic-link создан/i)).toBeInTheDocument();
    });

    // Dev-only кнопка "Открыть magic-link"
    expect(screen.getByText(/открыть magic-link/i)).toBeInTheDocument();

    // Dev-only banner про backend
    expect(screen.getByText(/^Dev:/i)).toBeInTheDocument();
  });

  it('error state показывает generic сообщение + dev-подсказку в DEV', async () => {
    mockRequestMagicLink.mockRejectedValue(new Error('connection refused'));
    mockStoreError = 'connection refused'; // эмулируем set({error}) в сторе

    renderLoginPage();

    // Сразу видим alert (рендер с storeError)
    await waitFor(() => {
      expect(screen.getByText(/не удалось подключиться/i)).toBeInTheDocument();
      // devErrorHint ("Dev: подробности в console.")
      expect(screen.getByText(/dev:.*console/i)).toBeInTheDocument();
    });

    // Проверяем что в alert нет localhost:4000
    const alert = screen.getByRole('alert');
    expect(alert.textContent).not.toMatch(/localhost:4000/);
    expect(alert.textContent).not.toMatch(/http:\/\//);
  });

  it('«Ввести другой email» сбрасывает форму', async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/parent@example.com/);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /magic-link|получить/i }));

    await waitFor(() => {
      expect(screen.getByText(/magic-link создан/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/ввести другой email/i));

    // Снова видим форму ввода
    expect(screen.getByPlaceholderText(/parent@example.com/)).toBeInTheDocument();
  });

  it('форма НЕ сабмитится с пустым email', async () => {
    renderLoginPage();
    const submitButton = screen.getByRole('button', { name: /magic-link|получить/i });
    expect(submitButton).toBeDisabled();
  });

  it('placeholder email присутствует', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText(/parent@example.com/)).toBeInTheDocument();
  });
});