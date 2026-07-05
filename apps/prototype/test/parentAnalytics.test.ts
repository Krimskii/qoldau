/**
 * Тесты фикса donut в ParentAnalytics (B-spec §B1).
 *
 * Контракт: gradientStops использует toneToColor() → hex, не Tailwind-классы.
 */
import { describe, it, expect } from 'vitest';
import { toneToColor } from '@/styles/tokens';

describe('ParentAnalytics — donut gradient (B-spec §B1)', () => {
  it('toneToColor возвращает hex (а НЕ Tailwind-класс)', () => {
    expect(toneToColor('coral')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('blue')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('purple')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('yellow')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('teal')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('green')).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('hex-значения различны (не серый круг)', () => {
    const colors = new Set([
      toneToColor('coral'),
      toneToColor('blue'),
      toneToColor('purple'),
      toneToColor('yellow'),
      toneToColor('teal'),
      toneToColor('green'),
    ]);
    expect(colors.size).toBe(6);
  });

  it('conic-gradient с toneToColor hex-значениями — синтаксически валиден', () => {
    const items = [
      { count: 5, tone: 'coral' as const },
      { count: 3, tone: 'blue' as const },
      { count: 2, tone: 'purple' as const },
    ];
    const total = items.reduce((a, x) => a + x.count, 0);
    let acc = 0;
    const stops = items.map((item) => {
      const start = acc;
      acc += (item.count / total) * 360;
      return `${toneToColor(item.tone)} ${start}deg ${acc}deg`;
    });
    const gradient = `conic-gradient(${stops.join(', ')})`;
    expect(gradient).toMatch(/^conic-gradient\(#[0-9A-Fa-f]{6} \d+deg \d+deg/);
    expect(gradient).not.toContain('bg-');
  });
});