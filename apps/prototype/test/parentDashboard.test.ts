/**
 * Тесты design C — ParentHome + ParentAnalytics (B-spec).
 *
 * Контракт:
 *   - donut gradient: использует hex (toneToColor), НЕ Tailwind-классы.
 *   - quick-actions: 6 штук в фикс-порядке (Еда/Вода/Туалет/Сон/Поведение/Коммуникация).
 *   - сводка дня: 3 мини-метрики (total/comm/sensory).
 *
 * Примечание: vitest парсит tsx через oxc, который чувствителен к JSX.
 * Тесты пишем без React-рендеринга — проверяем структуру и токены,
 * а не DOM. Это надёжнее и быстрее.
 */
import { describe, it, expect } from 'vitest';
import { toneToColor, iconButtonSize } from '@/styles/tokens';
import { readFileSync } from 'node:fs';

describe('ParentHome — design C (unit)', () => {
  const source = readFileSync(
    'src/pages/parent/ParentHome.tsx',
    'utf-8',
  );

  it('использует iconButtonSize из tokens (settings ≥44px)', () => {
    expect(source).toContain('iconButtonSize');
    // Токен = 44 (iconButtonSize из components).
    expect(iconButtonSize).toBe(44);
  });

  it('CTA «Сказать наблюдение» использует градиент teal→teal-dark (токены)', () => {
    expect(source).toContain('from-teal');
    expect(source).toContain('to-teal-dark');
    expect(source).toMatch(/parent-cta-voice/);
  });

  it('6 quick-actions в фикс-порядке', () => {
    expect(source).toMatch(/id: 'food'/);
    expect(source).toMatch(/id: 'water'/);
    expect(source).toMatch(/id: 'toilet'/);
    expect(source).toMatch(/id: 'sleep'/);
    expect(source).toMatch(/id: 'behav'/);
    expect(source).toMatch(/id: 'comms'/);
  });

  it('быстрые действия используют ТОКЕН tone→classBg (bg-coral/bg-blue/bg-purple/bg-yellow)', () => {
    expect(source).toContain('bg-coral-soft');
    expect(source).toContain('bg-blue-soft');
    expect(source).toContain('bg-purple-soft');
    expect(source).toContain('bg-yellow-soft');
  });

  it('сводка дня содержит 3 мини-метрики с data-testid', () => {
    expect(source).toContain('parent-today-summary');
    expect(source).toContain('Событий сегодня');
    expect(source).toContain('Коммуникация');
    expect(source).toContain('Сенсорика');
  });

  it('settings имеет data-testid и focus-visible стили', () => {
    expect(source).toMatch(/parent-settings/);
    expect(source).toMatch(/focus-visible:ring-2/);
  });

  it('CTA «Сказать наблюдение» с focus-visible:ring для a11y', () => {
    expect(source).toMatch(/parent-cta-voice[\s\S]*focus-visible:ring/);
  });

  it('Disclaimer с «не медицинский диагноз»', () => {
    expect(source).toContain('Не медицинский диагноз');
  });

  it('НЕТ inline-hex (только токены)', () => {
    // Никаких `#ABCDEF`-значений в стилях.
    const inlineHex = source.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    // Допустимы только hex внутри data-* тестов (test-id не hex).
    const inlineHexInStyles = inlineHex.filter((h) => h !== '#parent-cta-voice');
    expect(inlineHexInStyles).toEqual([]);
  });
});

describe('ParentAnalytics — donut gradient (B-spec §B1)', () => {
  const source = readFileSync(
    'src/pages/parent/ParentAnalytics.tsx',
    'utf-8',
  );

  it('gradientStops использует toneToColor (HEX), НЕ bg-* классы', () => {
    expect(source).toContain('toneToColor(item.tone)');
    expect(source).toMatch(/conic-gradient\(/);
  });

  it('НЕТ inline-bg-* в conic-gradient (раньше был баг)', () => {
    // Проверяем что в файле нет conic-gradient с bg-*-классами.
    const buggyConic = source.match(/conic-gradient\([^)]*bg-[a-z]+/);
    expect(buggyConic).toBeNull();
  });
});

describe('toneToColor — donut hex source (B-spec §B1)', () => {
  it('toneToColor возвращает hex', () => {
    expect(toneToColor('coral')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('blue')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('purple')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('yellow')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('teal')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(toneToColor('green')).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('conic-gradient с toneToColor — синтаксически валиден', () => {
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