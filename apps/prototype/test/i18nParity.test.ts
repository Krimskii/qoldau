/**
 * i18n parity test (v1.5+ E6.3):
 *
 * Гарантирует, что ru/kk/en локали имеют ОДИНАКОВЫЙ набор ключей.
 * - Любой ключ, добавленный в ru, должен быть в kk и en.
 * - Любой ключ, добавленный в kk, должен быть в ru и en.
 * - Любой ключ, добавленный в en, должен быть в ru и kk.
 *
 * Если тест падает — найди diff в списке ниже и добавь недостающие ключи
 * в соответствующие локали.
 */

import { describe, it, expect } from 'vitest';
import ru from '@/i18n/locales/ru.json';
import kk from '@/i18n/locales/kk.json';
import en from '@/i18n/locales/en.json';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

function flatten(obj: JsonValue, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [];
  if (Array.isArray(obj)) {
    // массивы — leaf'ы, ключ включает имя массива; для проверки паритета
    // нам важно только наличие массива, а не его содержимое.
    return prefix ? [prefix] : [];
  }
  const out: string[] = [];
  for (const k of Object.keys(obj as JsonObject)) {
    const next = prefix ? `${prefix}.${k}` : k;
    const v = (obj as JsonObject)[k];
    if (v === null || typeof v !== 'object') {
      out.push(next);
    } else if (Array.isArray(v)) {
      // массив = leaf, проверяем наличие ключа массива
      out.push(next);
    } else {
      out.push(...flatten(v, next));
    }
  }
  return out;
}

function collectStringKeys(obj: JsonValue, prefix = ''): string[] {
  return flatten(obj, prefix);
}

describe('i18n parity (ru/kk/en)', () => {
  const ruKeys = new Set(collectStringKeys(ru as JsonValue));
  const kkKeys = new Set(collectStringKeys(kk as JsonValue));
  const enKeys = new Set(collectStringKeys(en as JsonValue));

  it('ru и kk имеют одинаковые ключи', () => {
    const onlyInRu = [...ruKeys].filter((k) => !kkKeys.has(k));
    const onlyInKk = [...kkKeys].filter((k) => !ruKeys.has(k));
    expect(onlyInRu, `Keys only in ru: ${onlyInRu.join(', ')}`).toEqual([]);
    expect(onlyInKk, `Keys only in kk: ${onlyInKk.join(', ')}`).toEqual([]);
  });

  it('ru и en имеют одинаковые ключи', () => {
    const onlyInRu = [...ruKeys].filter((k) => !enKeys.has(k));
    const onlyInEn = [...enKeys].filter((k) => !ruKeys.has(k));
    expect(onlyInRu, `Keys only in ru: ${onlyInRu.join(', ')}`).toEqual([]);
    expect(onlyInEn, `Keys only in en: ${onlyInEn.join(', ')}`).toEqual([]);
  });

  it('kk и en имеют одинаковые ключи', () => {
    const onlyInKk = [...kkKeys].filter((k) => !enKeys.has(k));
    const onlyInEn = [...enKeys].filter((k) => !kkKeys.has(k));
    expect(onlyInKk, `Keys only in kk: ${onlyInKk.join(', ')}`).toEqual([]);
    expect(onlyInEn, `Keys only in en: ${onlyInEn.join(', ')}`).toEqual([]);
  });

  it('все три локали имеют одинаковое количество ключей', () => {
    expect(ruKeys.size).toBe(kkKeys.size);
    expect(ruKeys.size).toBe(enKeys.size);
  });
});