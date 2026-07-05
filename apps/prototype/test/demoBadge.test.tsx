/**
 * Тесты DemoBadge (v1.5+ E4 — honest mock layer):
 * - Рендерит «Демо» текст и иконку Sparkles.
 * - Кастомный label работает.
 * - aria-label для accessibility.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DemoBadge } from '@/components/ui/DemoBadge';

describe('<DemoBadge>', () => {
  it('рендерит дефолтный «Демо» текст', () => {
    render(<DemoBadge />);
    expect(screen.getByText(/Демо/i)).toBeInTheDocument();
  });

  it('рендерит кастомный label', () => {
    render(<DemoBadge label="AI — демо" />);
    expect(screen.getByText(/AI — демо/i)).toBeInTheDocument();
  });

  it('aria-label включает label', () => {
    render(<DemoBadge label="Аудио — демо" />);
    expect(screen.getByLabelText(/Демо.*Аудио/i)).toBeInTheDocument();
  });
});