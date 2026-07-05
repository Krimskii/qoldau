import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { DataState } from '@/components/ui/DataState';
import { useEventQuery } from '@/lib/storage/eventStorage';
import {
  dayHourHeatmap,
  heatmapMax,
  heatmapTotal,
} from '@/lib/insights/weeklyPatterns';
import { useCurrentChild } from '@/store/useCurrentChild';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { toneToColor, type EventTone } from '@/styles/tokens';

/**
 * ParentAnalytics — родительская аналитика (v1.5+ polish per design C).
 *
 * Контракт (spec C):
 * - B1 ФИКС: donut использует toneToColor() → hex-значения, а НЕ Tailwind-классы
 *   ('bg-green' внутри conic-gradient был невалиден — давал серый круг).
 * - B2/B3: heatmap/сенсорика оставлены без изменений (логика корректна).
 * - B4: «Триггеры» / «Динамика» — добавлен демо-маркер.
 * - B5: PageHeader оставлен.
 */

interface SummaryItem {
  type: string;
  count: number;
  label: string;
  /** Tailwind-класс для маленькой точки-легенды (для UI). */
  dotClass: string;
  /** Тон (coral|blue|purple|yellow|teal|green). */
  tone: EventTone;
}

const SUMMARY_TYPES: Array<{ type: string; label: string; tone: EventTone; dotClass: string }> = [
  { type: 'food',          label: 'Еда',           tone: 'coral',  dotClass: 'bg-coral' },
  { type: 'water',         label: 'Вода',          tone: 'blue',   dotClass: 'bg-blue' },
  { type: 'toilet',        label: 'Туалет',        tone: 'purple', dotClass: 'bg-purple' },
  { type: 'communication', label: 'Коммуникация',  tone: 'purple', dotClass: 'bg-purple' },
  { type: 'aac_card',      label: 'AAC',           tone: 'teal',   dotClass: 'bg-teal' },
  { type: 'sensory',       label: 'Сенсорика',     tone: 'yellow', dotClass: 'bg-yellow' },
  { type: 'behavior',      label: 'Поведение',     tone: 'yellow', dotClass: 'bg-yellow' },
  { type: 'phrase',        label: 'Фразы',         tone: 'teal',   dotClass: 'bg-teal' },
];

export const ParentAnalytics: React.FC = () => {
  const { id: childId } = useCurrentChild();
  const events = useEventQuery({ childId });

  const summary: SummaryItem[] = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === childId);
    return SUMMARY_TYPES.map((cfg) => ({
      type: cfg.type,
      count: childEvents.filter((e) => e.type === cfg.type).length,
      label: cfg.label,
      tone: cfg.tone,
      dotClass: cfg.dotClass,
    }));
  }, [events]);

  const total = summary.reduce((acc, x) => acc + x.count, 0) || 1;
  const top3 = [...summary].sort((a, b) => b.count - a.count).slice(0, 3);

  const triggers = [
    { name: 'Шум', percent: 60 },
    { name: 'Смена активности', percent: 35 },
    { name: 'Громкий звук', percent: 25 },
  ];

  const helpers = [
    { name: 'Пауза / отдых', count: 4 },
    { name: 'Тихое место', count: 3 },
    { name: 'Визуальное расписание', count: 3 },
  ];

  const dynamics = [
    { label: 'AAC', value: '+15%', bg: 'bg-teal-soft', text: 'text-teal' },
    { label: 'Коммуникация', value: '+8%', bg: 'bg-green-soft', text: 'text-green' },
    { label: 'Подтверждения', value: '+5%', bg: 'bg-blue-soft', text: 'text-blue' },
  ];

  /**
   * B1 ФИКС: gradientStops использует hex-значения через toneToColor(),
   * а НЕ Tailwind-классы. Раньше в conic-gradient попадал `'bg-green'`,
   * что CSS считал невалидным цветом → серый круг.
   */
  const gradientStops = (() => {
    let acc = 0;
    const stops = top3.map((item) => {
      const start = acc;
      acc += (item.count / total) * 360;
      const hex = toneToColor(item.tone);
      return `${hex} ${start}deg ${acc}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  })();

  // Weekly heatmap (B2).
  const heatmap = useMemo(
    () => dayHourHeatmap(events, childId, new Date()),
    [events, childId],
  );
  const heatMax = heatmapMax(heatmap);
  const heatTotal = heatmapTotal(heatmap);
  const heatmapDayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Sensory (B3).
  const sensoryCounts = useMemo(() => {
    const tags = ['sound', 'light', 'touch', 'smell', 'temperature'] as const;
    const out: Record<string, number> = {};
    for (const t of tags) {
      out[t] = events.filter((e) => {
        if (e.sensoryContext?.some((s) => s.toLowerCase() === t)) return true;
        const mods = (e.payload as { modalities?: string[] } | undefined)
          ?.modalities;
        return mods?.some((m) => m.toLowerCase() === t) ?? false;
      }).length;
    }
    return out;
  }, [events]);
  const sensoryTotal = Object.values(sensoryCounts).reduce((a, b) => a + b, 0);

  const SENSORY_LABELS: Record<string, string> = {
    sound: 'Звук',
    light: 'Свет',
    touch: 'Тактильно',
    smell: 'Запах',
    temperature: 'Температура',
  };

  // Хелпер: top3 должны иметь хотя бы один с count>0, иначе donut пуст.
  const top3WithCount = top3.filter((x) => x.count > 0);
  const displayTop3 = top3WithCount.length > 0 ? top3WithCount : top3;
  const hasData = events.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Аналитика" subtitle="Демо-данные за 7 дней" />
      <ChildSelector />

      {/* E7.1: DataState wrapper для всего контента — loading/empty/error/data */}
      <DataState
        isLoading={false}
        error={null}
        isEmpty={!hasData}
        emptyState={{
          icon: BarChart3,
          title: 'Пока недостаточно данных',
          description: 'Добавьте наблюдения — голосом, AAC-карточкой или через сенсоры. Здесь появятся тепловая карта, динамика и топ-сигналы.',
        }}
      >
        <div className="flex flex-col gap-5">

          {/* B1. Donut + Top signals (ФИКС: tone→hex) */}
          <SectionCard title="Распределение событий" accent="teal" action={<BarChart3 className="w-5 h-5 text-teal" />}>
        <div className="flex items-center gap-4">
          <div
            className="w-24 h-24 rounded-full relative flex-shrink-0"
            style={{ background: gradientStops }}
            aria-hidden="true"
            data-testid="donut"
          >
            <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
              <span className="text-xl font-black text-ink">{total}</span>
              <span className="text-[10px] text-muted">событий</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {displayTop3.map((item) => (
              <div key={item.type} className="flex items-center gap-2 text-xs">
                <span
                  className={`w-3 h-3 rounded-sm ${item.dotClass}`}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
                <span className="font-bold tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* B2. Weekly heatmap */}
      <SectionCard
        title="Тепловая карта недели"
        accent="blue"
        action={<BarChart3 className="w-5 h-5 text-blue" />}
      >
        {heatTotal === 0 ? (
          <p className="text-sm text-muted italic py-2">
            Пока мало наблюдений — добавьте голосом или AAC-карточкой, и здесь появится плотность событий по часам.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto pb-2">
              <table className="border-separate" style={{ borderSpacing: 2 }}>
                <thead>
                  <tr>
                    <th className="w-7" aria-hidden="true" />
                    {Array.from({ length: 24 }, (_, h) => (
                      <th
                        key={h}
                        className="text-[9px] font-normal text-muted w-3.5 text-center"
                      >
                        {h % 6 === 0 ? h : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.map((row: number[], rowIdx: number) => (
                    <tr key={heatmapDayLabels[rowIdx]}>
                      <th
                        scope="row"
                        className="text-[10px] text-muted pr-1.5 text-right"
                      >
                        {heatmapDayLabels[rowIdx]}
                      </th>
                      {row.map((v: number, colIdx: number) => {
                        const intensity = heatMax > 0 ? v / heatMax : 0;
                        const cls =
                          v === 0
                            ? 'bg-bg'
                            : intensity > 0.66
                              ? 'bg-teal'
                              : intensity > 0.33
                                ? 'bg-teal/60'
                                : 'bg-teal/30';
                        return (
                          <td
                            key={colIdx}
                            className={`w-3.5 h-3.5 rounded-sm ${cls}`}
                            title={`${heatmapDayLabels[rowIdx]} ${colIdx}:00 — ${v} событий`}
                            aria-label={`${heatmapDayLabels[rowIdx]} ${colIdx} часов: ${v} событий`}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted mt-2">
              <span>Меньше</span>
              <div className="flex gap-1" aria-hidden="true">
                <span className="w-3.5 h-3.5 rounded-sm bg-bg" />
                <span className="w-3.5 h-3.5 rounded-sm bg-teal/30" />
                <span className="w-3.5 h-3.5 rounded-sm bg-teal/60" />
                <span className="w-3.5 h-3.5 rounded-sm bg-teal" />
              </div>
              <span>Больше</span>
            </div>
            <p className="text-[11px] text-muted mt-3 italic">
              Наблюдение плотности событий по часам. Это не медицинский диагноз — можно продолжить наблюдать, чтобы увидеть динамику.
            </p>
          </>
        )}
      </SectionCard>

      {/* B3. Сенсорный контекст */}
      <SectionCard title="Сенсорный контекст" accent="yellow">
        {sensoryTotal === 0 ? (
          <p className="text-sm text-muted italic py-2">
            Пока нет событий с сенсорными тегами — можно отмечать при записи голосом.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {(['sound', 'light', 'touch', 'smell', 'temperature'] as const).map(
              (tag) => (
                <div
                  key={tag}
                  className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-yellow-soft"
                >
                  <span className="text-xl font-black text-yellow">
                    {sensoryCounts[tag] ?? 0}
                  </span>
                  <span className="text-[10px] text-muted mt-0.5 text-center">
                    {SENSORY_LABELS[tag]}
                  </span>
                </div>
              ),
            )}
          </div>
        )}
        <p className="text-[11px] text-muted mt-3 italic">
          Наблюдение за сенсорными стимулами. Не медицинский диагноз.
        </p>
      </SectionCard>

      {/* B4. Triggers — добавлен демо-маркер */}
      <SectionCard title="Ситуации, которые могли повлиять" accent="yellow">
        {triggers.map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-line-soft last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow" />
              <span className="text-sm font-bold text-ink">{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow rounded-full"
                  style={{ width: `${t.percent}%` }}
                />
              </div>
              <span className="text-xs text-muted w-10 text-right">{t.percent}%</span>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted mt-3 italic">
          Демо-пример. В след. версии — реальные подсчёты. Не является медицинским диагнозом.
        </p>
      </SectionCard>

      {/* What helped — уже имеет демо-маркер */}
      <SectionCard
        title="Что помогало"
        accent="green"
        action={<Sparkles className="w-5 h-5 text-green" />}
      >
        {helpers.map((h) => (
          <div
            key={h.name}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-line-soft last:border-0"
          >
            <span className="text-sm font-bold text-ink">{h.name}</span>
            <span className="text-xs font-bold text-green">{h.count} раз</span>
          </div>
        ))}
        <p className="text-[11px] text-muted mt-3 italic">
          Это демо-данные для примера. В следующей версии — реальные подсчёты.
        </p>
      </SectionCard>

      {/* B4. Dynamics — добавлен демо-маркер */}
      <SectionCard
        title="Динамика"
        accent="purple"
        action={<TrendingUp className="w-5 h-5 text-purple" />}
      >
        <div className="grid grid-cols-3 gap-3">
          {dynamics.map((d) => (
            <QoldauCard key={d.label} variant="default" padding="sm" className={`${d.bg} border-0`}>
              <div className="text-center">
                <p className={`text-2xl font-black ${d.text}`}>{d.value}</p>
                <p className="text-[11px] text-muted">{d.label}</p>
              </div>
            </QoldauCard>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-3 italic">
          Демо-пример. В след. версии — реальные подсчёты.
        </p>
      </SectionCard>

<AIInsightCard
        text="Похоже, ребёнок стал использовать больше AAC-карточек и жестов, чем раньше. Это хороший прогресс! Можно обсудить со специалистом."
      />
        </div>
      </DataState>
    </div>
  );
};