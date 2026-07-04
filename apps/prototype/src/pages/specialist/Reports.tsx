import React, { useMemo } from 'react';
import { FileText, Download, Mail, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/useToastStore';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN, getFamilyChildName } from '@/data/demoDataset';
import { formatDate } from '@/utils/dateFormat';

const REPORT_TYPES = [
  { key: 'weekly', title: 'Недельный отчёт', subtitle: 'Итоги за неделю', icon: Calendar, accent: 'teal' },
  { key: 'monthly', title: 'Месячный отчёт', subtitle: 'Динамика за 30 дней', icon: TrendingUp, accent: 'blue' },
  { key: 'individual', title: 'Индивидуальный', subtitle: 'Глубокий разбор ребёнка', icon: FileText, accent: 'purple' },
  { key: 'specialist', title: 'Для специалиста', subtitle: 'Структура по ABC', icon: CheckCircle2, accent: 'green' },
];

const ACCENT_CLASSES: Record<string, { bg: string; text: string; pill: string }> = {
  teal: { bg: 'bg-teal-soft', text: 'text-teal-dark', pill: 'bg-teal text-white' },
  blue: { bg: 'bg-blue-soft', text: 'text-blue-dark', pill: 'bg-blue text-white' },
  purple: { bg: 'bg-purple-soft', text: 'text-purple', pill: 'bg-purple text-white' },
  green: { bg: 'bg-green-soft', text: 'text-green', pill: 'bg-green text-white' },
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const Reports: React.FC = () => {
  const { showToast } = useToastStore();
  const { events } = useEventStore();
  const { selectedChildId } = useDemoControlsStore();
  const currentChild =
    DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];
  // Реальное имя ребёнка (с учётом семейной настройки через FamilySetupCard).
  const childName = getFamilyChildName() ?? currentChild.name;

  // Все события выбранного ребёнка за последнюю неделю.
  const weekEvents = useMemo(() => {
    const since = Date.now() - WEEK_MS;
    return events.filter(
      (e) =>
        e.childId === currentChild.id &&
        new Date(e.timestamp).getTime() >= since,
    );
  }, [events, currentChild.id]);

  const total = weekEvents.length;
  const aacCount = weekEvents.filter(
    (e) => e.type === 'aac_card' || e.type === 'phrase',
  ).length;
  const calmCount = weekEvents.filter((e) => e.type === 'calm_mode').length;
  // «Новых сигналов» = уникальные title за период (грубая оценка).
  const newSignals = new Set(
    weekEvents.map((e) => `${e.type}:${e.title}`),
  ).size;

  const hasData = total > 0;

  // Период отчёта — от самой ранней до самой поздней записи, либо текущая неделя.
  const periodLabel = (() => {
    if (weekEvents.length === 0) {
      const today = formatDate(new Date());
      return `${today} · Недельный`;
    }
    const timestamps = weekEvents
      .map((e) => new Date(e.timestamp).getTime())
      .sort((a, b) => a - b);
    const from = formatDate(new Date(timestamps[0]));
    const to = formatDate(new Date(timestamps[timestamps.length - 1]));
    return `${from} – ${to} · Недельный`;
  })();

  const handleShareReport = async () => {
    const shareData = {
      title: 'Qoldau — отчёт наблюдений',
      text: `Профиль наблюдений ${childName} (Qoldau). Это наблюдения, не диагноз.`,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Пользователь закрыл системный лист — это не ошибка.
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.text);
        showToast('Текст отчёта скопирован', 'success');
      } catch {
        showToast('Не удалось скопировать', 'info');
      }
    } else {
      showToast('Поделиться недоступно на этом устройстве', 'info');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Отчёты"
        subtitle="По данным Event Timeline"
        showBack
      />

      {/* Полноценный preview отчёта */}
      <QoldauCard variant="default" padding="none" className="overflow-hidden">
        {/* Header отчёта */}
        <div className="bg-gradient-to-br from-teal to-teal-dark text-white p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide opacity-80">Qoldau AI · Отчёт</p>
              <h2 className="text-2xl font-black mt-1 leading-tight">
                {childName}, {currentChild.age} лет
              </h2>
              <p className="text-sm opacity-90 mt-1">{periodLabel}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-black flex-shrink-0">
              MVP
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Итоги недели — реальные данные */}
          <section>
            <SectionHeader number="1" title="Итоги недели" />
            {hasData ? (
              <p className="text-sm text-ink-2 leading-relaxed">
                Зафиксировано {total} событий за неделю
                {total > 0 && ' от родителя, тьютора и ребёнка'}. Это наблюдения,
                не диагноз. Можно продолжить наблюдать, чтобы увидеть динамику.
              </p>
            ) : (
              <p className="text-sm text-ink-2 leading-relaxed">
                Пока мало наблюдений — добавьте голосом или AAC-карточкой, и
                здесь появятся итоги недели. Это наблюдения, не диагноз.
              </p>
            )}
          </section>

          {/* KPI grid — реальные подсчёты */}
          <section>
            <SectionHeader number="2" title="Ключевые показатели" />
            <div className="grid grid-cols-3 gap-2.5">
              <KpiCard
                label="AAC / фраз"
                value={hasData ? String(aacCount) : '—'}
                sub="за неделю"
                color="teal"
              />
              <KpiCard
                label="Спокойный режим"
                value={hasData ? `${calmCount} раз` : '—'}
                sub="за неделю"
                color="green"
              />
              <KpiCard
                label="Новых сигналов"
                value={hasData ? String(newSignals) : '—'}
                sub="за неделю"
                color="blue"
              />
            </div>
          </section>

          {/* Ключевые наблюдения — реальные события или empty state */}
          <section>
            <SectionHeader number="3" title="Ключевые наблюдения" />
            {hasData ? (
              <ul className="space-y-2 text-sm text-ink-2">
                {weekEvents.slice(0, 4).map((e) => (
                  <li key={e.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-black text-ink">{e.title}</p>
                      <p className="text-muted leading-relaxed line-clamp-2">{e.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted leading-relaxed">
                Пока нет наблюдений за неделю. Когда появятся — здесь будет
                краткий обзор.
              </p>
            )}
          </section>

          {/* Рекомендации — осторожные формулировки, без medical claims */}
          <section>
            <SectionHeader number="4" title="Что можно попробовать" />
            <div className="bg-yellow-soft border border-yellow/20 rounded-2xl p-3">
              <p className="text-sm text-ink-2 leading-relaxed italic">
                Похоже, что повторяющиеся сигналы и контексты помогут увидеть
                динамику. Можно продолжить наблюдать и обсудить с семьёй.{' '}
                <strong className="not-italic">Это наблюдение, не диагноз.</strong>
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <p className="text-[11px] text-muted text-center italic pt-2 border-t border-line-soft">
            Qoldau AI — профиль наблюдений, не медицинское устройство.
          </p>
        </div>
      </QoldauCard>

      {/* Действия — реальные: печать/сохранение в PDF и системное «Поделиться». */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          className="flex items-center justify-center gap-2"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4" />
          Скачать PDF
        </Button>
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-2"
          onClick={handleShareReport}
        >
          <Mail className="w-4 h-4" />
          Отправить
        </Button>
      </div>

      {/* Другие типы отчётов — клик показывает toast (в Wave 0 не генерируются) */}
      <section>
        <h3 className="text-sm font-black text-ink mb-3 px-1">Другие отчёты</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {REPORT_TYPES.map((type) => {
            const accent = ACCENT_CLASSES[type.accent];
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => showToast(`«${type.title}» появится в следующей версии`, 'info')}
                className={`${accent.bg} border border-line rounded-2xl p-4 text-left hover:shadow-card-soft active:scale-[0.98] transition-all`}
              >
                <div className={`w-10 h-10 rounded-2xl bg-white flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${accent.text}`} />
                </div>
                <p className="text-sm font-black text-ink leading-tight">{type.title}</p>
                <p className="text-xs text-muted mt-0.5">{type.subtitle}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const SectionHeader: React.FC<{ number: string; title: string }> = ({ number, title }) => (
  <div className="flex items-center gap-2 mb-2.5">
    <span className="w-6 h-6 rounded-full bg-teal text-white text-xs font-black flex items-center justify-center flex-shrink-0">
      {number}
    </span>
    <h4 className="text-sm font-black text-ink uppercase tracking-wide">{title}</h4>
  </div>
);

const KpiCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  color: 'teal' | 'blue' | 'green';
}> = ({ label, value, sub, color }) => {
  const valueClass = {
    teal: 'text-teal-dark',
    blue: 'text-blue-dark',
    green: 'text-green',
  }[color];
  return (
    <div className="bg-bg rounded-2xl p-3 text-center">
      <p className={`text-xl font-black ${valueClass}`}>{value}</p>
      <p className="text-xs font-black text-ink mt-0.5">{label}</p>
      <p className="text-[10px] text-muted mt-0.5">{sub}</p>
    </div>
  );
};