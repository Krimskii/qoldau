import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/useToastStore';
import { useEventQuery } from '@/lib/storage/eventStorage';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN, getFamilyChildName } from '@/data/demoDataset';
import { formatDate } from '@/utils/dateFormat';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToastStore();
  const { selectedChildId } = useDemoControlsStore();
  const currentChild =
    DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];
  const childName = getFamilyChildName() ?? currentChild.name;

  const since = new Date(Date.now() - WEEK_MS).toISOString();
  const weekEvents = useEventQuery({
    childId: currentChild.id,
    since,
  });

  const total = weekEvents.length;
  const aacCount = weekEvents.filter(
    (e) => e.type === 'aac_card' || e.type === 'phrase',
  ).length;
  const calmCount = weekEvents.filter((e) => e.type === 'calm_mode').length;
  const newSignals = new Set(
    weekEvents.map((e) => `${e.type}:${e.title}`),
  ).size;

  const hasData = total > 0;

  const periodLabel = (() => {
    if (weekEvents.length === 0) {
      const today = formatDate(new Date());
      return t('specialist.reports.periodLabelEmpty', { today });
    }
    const timestamps = weekEvents
      .map((e) => new Date(e.timestamp).getTime())
      .sort((a, b) => a - b);
    const from = formatDate(new Date(timestamps[0]));
    const to = formatDate(new Date(timestamps[timestamps.length - 1]));
    return t('specialist.reports.periodLabel', { from, to });
  })();

  const handleShareReport = async () => {
    const shareData = {
      title: t('specialist.reports.shareTitle'),
      text: t('specialist.reports.shareText', { name: childName }),
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — not an error
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.text);
        showToast(t('specialist.reports.shareCopied'), 'success');
      } catch {
        showToast(t('specialist.reports.shareFailed'), 'info');
      }
    } else {
      showToast(t('specialist.reports.shareUnavailable'), 'info');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('specialist.reports.title')}
        subtitle={t('specialist.reports.subtitle')}
        showBack
      />

      {/* Полноценный preview отчёта */}
      <QoldauCard variant="default" padding="none" className="overflow-hidden">
        {/* Header отчёта */}
        <div className="bg-gradient-to-br from-teal to-teal-dark text-white p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide opacity-80">
                {t('specialist.reports.header')}
              </p>
              <h2 className="text-2xl font-black mt-1 leading-tight">
                {childName}, {t('specialist.reports.ageLabel', { age: currentChild.age })}
              </h2>
              <p className="text-sm opacity-90 mt-1">{periodLabel}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-black flex-shrink-0">
              MVP
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Итоги недели */}
          <section>
            <SectionHeader number="1" title={t('specialist.reports.section1Title')} />
            {hasData ? (
              <p className="text-sm text-ink-2 leading-relaxed">
                {t('specialist.reports.withDataHint', { total })}
              </p>
            ) : (
              <p className="text-sm text-ink-2 leading-relaxed">
                {t('specialist.reports.noDataHint')}
              </p>
            )}
          </section>

          {/* KPI grid */}
          <section>
            <SectionHeader number="2" title={t('specialist.reports.section2Title')} />
            <div className="grid grid-cols-3 gap-2.5">
              <KpiCard
                label={t('specialist.reports.kpiAac')}
                value={hasData ? String(aacCount) : '—'}
                sub={t('specialist.reports.kpiAacPer')}
                color="teal"
              />
              <KpiCard
                label={t('specialist.reports.kpiCalm')}
                value={hasData ? `${calmCount} ${t('specialist.reports.kpiAacPer')}` : '—'}
                sub={t('specialist.reports.perWeek')}
                color="green"
              />
              <KpiCard
                label={t('specialist.reports.kpiNew')}
                value={hasData ? String(newSignals) : '—'}
                sub={t('specialist.reports.perWeek')}
                color="blue"
              />
            </div>
          </section>

          {/* Ключевые наблюдения */}
          <section>
            <SectionHeader number="3" title={t('specialist.reports.section3Title')} />
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
                {t('specialist.reports.noObservations')}
              </p>
            )}
          </section>

          {/* Рекомендации */}
          <section>
            <SectionHeader number="4" title={t('specialist.reports.section4Title')} />
            <div className="bg-yellow-soft border border-yellow/20 rounded-2xl p-3">
              <p className="text-sm text-ink-2 leading-relaxed italic">
                {t('specialist.reports.recommendation')}{' '}
                <strong className="not-italic">{t('specialist.reports.recommendationStrong')}</strong>
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <p className="text-[11px] text-muted text-center italic pt-2 border-t border-line-soft">
            {t('specialist.reports.disclaimer')}
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
          {t('specialist.reports.downloadPdf')}
        </Button>
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-2"
          onClick={handleShareReport}
        >
          <Mail className="w-4 h-4" />
          {t('specialist.reports.send')}
        </Button>
      </div>
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
  color: 'teal' | 'green' | 'blue';
}> = ({ label, value, sub, color }) => (
  <QoldauCard variant="default" padding="sm" className="text-center">
    <p
      className={`text-2xl font-black ${
        color === 'teal' ? 'text-teal' : color === 'green' ? 'text-green' : 'text-blue'
      }`}
    >
      {value}
    </p>
    <p className="text-[11px] font-black text-ink mt-0.5">{label}</p>
    <p className="text-[10px] text-muted">{sub}</p>
  </QoldauCard>
);