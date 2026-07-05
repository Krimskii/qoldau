/**
 * Тесты для ConfirmSheet (v1.5+ D):
 * - Рендерит заголовок и подзаголовок.
 * - role="dialog" + aria-label из заголовка.
 * - ✓ вызывает onConfirm.
 * - ✕ вызывает onCancel.
 * - backdrop клик вызывает onCancel.
 * - coral tone ставит bg-coral на ✓, green — bg-green.
 * - ESC вызывает onCancel.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';

// Mock haptic + speak (чтобы тесты не падали в jsdom)
vi.mock('@/lib/feedback/haptics', () => ({
  triggerHaptic: vi.fn(),
}));
vi.mock('@/lib/tts/speak', () => ({
  speak: vi.fn(),
}));

describe('<ConfirmSheet>', () => {
  it('не рендерится когда open=false', () => {
    render(
      <ConfirmSheet
        open={false}
        title="Подтвердить?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('рендерит заголовок, подзаголовок и role="dialog" когда open=true', () => {
    render(
      <ConfirmSheet
        open
        title="Удалить карточку?"
        subtitle="Это действие нельзя отменить"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-label', 'Удалить карточку?');
    expect(screen.getByText('Удалить карточку?')).toBeInTheDocument();
    expect(screen.getByText('Это действие нельзя отменить')).toBeInTheDocument();
  });

  it('✓ вызывает onConfirm (не onCancel)', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmSheet open title="OK?" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByLabelText('Подтвердить'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('✕ вызывает onCancel (не onConfirm)', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmSheet open title="OK?" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByLabelText('Отмена'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('клик по backdrop вызывает onCancel', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmSheet open title="OK?" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const dialog = screen.getByRole('dialog');
    // Кликаем по самому dialog (backdrop), а не по дочерним элементам
    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('ESC вызывает onCancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmSheet open title="OK?" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirmTone=coral ставит bg-coral на ✓; по умолчанию — bg-green', () => {
    const { rerender } = render(
      <ConfirmSheet open title="OK?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    const greenConfirm = screen.getByLabelText('Подтвердить');
    expect(greenConfirm.className).toContain('bg-green');

    rerender(
      <ConfirmSheet
        open
        title="Срочно?"
        confirmTone="coral"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const coralConfirm = screen.getByLabelText('Подтвердить');
    expect(coralConfirm.className).toContain('bg-coral');
    expect(coralConfirm.className).not.toContain('bg-green');
  });
});