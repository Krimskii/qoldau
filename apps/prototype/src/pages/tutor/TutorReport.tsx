import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Send, Calendar, CheckCircle, Lightbulb, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { QoldauEvent } from '@/types/qoldau';
import { formatDate, formatTime } from '@/utils/dateFormat';

export const TutorReport: React.FC = () => {
  const { t } = useTranslation();
  const { events } = useEventStore();
  const { showToast } = useToastStore();

  const tutorEvents = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return events
      .filter(
        (e) =>
          e.childId === DEMO_PRIMARY_CHILD.id &&
          (e.sourceRole === 'tutor' || e.sourceRole === 'specialist') &&
          new Date(e.timestamp).getTime() >= sevenDaysAgo
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [events]);

  const summary = useMemo(() => {
    const total = tutorEvents.length;
    const positive = tutorEvents.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card' || e.type === 'state'
    ).length;
    const attention = tutorEvents.filter(
      (e) => e.type === 'sensory' || e.type === 'behavior' || e.type === 'sos'
    ).length;
    return { total, positive, attention };
  }, [tutorEvents]);

  // Group by date
  const grouped: Record<string, QoldauEvent[]> = {};
  tutorEvents.slice(0, 8).forEach((e) => {
    const day = formatDate(e.timestamp);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  const handleCopy = () => {
    const text = generateReportText();
    navigator.clipboard?.writeText(text).then(
      () => showToast(t('tutor.report.copied'), 'success'),
      () => showToast(t('tutor.report.copyFailed'), 'error')
    );
  };

  /**
   * v1.5+ E2 honest state: «Отправить родителю» НЕ отправляет ничего.
   * Реальная отправка появится в следующей версии (требует backend).
   * Сейчас показываем toast с подсказкой «скопируйте и отправьте вручную».
   */
  const handleSend = () => {
    showToast(t('tutor.report.sendInDevelopment'), 'info');
  };

  const generateReportText = () => {
    const today = formatDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' });
    let text = t('tutor.report.reportHeader', { date: today });
    text += t('tutor.report.reportTotal', { count: summary.total });
    text += t('tutor.report.reportPositive', { count: summary.positive });
    text += t('tutor.report.reportAttention', { count: summary.attention });
    if (tutorEvents.length > 0) {
      text += t('tutor.report.reportEventsHeader');
      tutorEvents.slice(0, 5).forEach((e) => {
        const time = formatTime(e.timestamp);
        text += t('tutor.report.reportEventLine', { time, title: e.title });
      });
    }
    text += t('tutor.report.reportFooter');
    return text;
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t('tutor.report.title')} subtitle={t('tutor.report.subtitle')} showBack />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2.5">
        <QoldauCard variant="default" className="text-center">
          <p className="text-2xl font-black text-teal">{summary.total}</p>
          <p className="text-[11px] text-muted">{t('tutor.report.total')}</p>
        </QoldauCard>
        <QoldauCard variant="tinted-green" className="text-center">
          <p className="text-2xl font-black text-green">{summary.positive}</p>
          <p className="text-[11px] text-muted">{t('tutor.report.positive')}</p>
        </QoldauCard>
        <QoldauCard variant="tinted-yellow" className="text-center">
          <p className="text-2xl font-black text-yellow">{summary.attention}</p>
          <p className="text-[11px] text-muted">{t('tutor.report.attention')}</p>
        </QoldauCard>
      </div>

      {/* What happened */}
      <QoldauCard variant="default">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-teal" />
          <h4 className="text-sm font-black text-ink">{t('tutor.report.eventsTitle')}</h4>
        </div>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-muted text-center py-3">{t('tutor.report.empty')}</p>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <p className="text-xs font-black text-muted uppercase tracking-wide mb-2 px-1 mt-2">
                {day}
              </p>
              <div className="space-y-2">
                {items.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-3 bg-bg rounded-2xl"
                  >
                    <Clock className="w-4 h-4 text-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{e.title}</p>
                      <p className="text-xs text-muted truncate">{e.description}</p>
                    </div>
                    <span className="text-xs text-muted tabular-nums">
                      {formatTime(e.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </QoldauCard>

      {/* What helped — hardcoded demo (помечено явно) */}
      <QoldauCard variant="tinted-green">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green" />
          <h4 className="text-sm font-black text-ink">{t('tutor.report.whatHelped')}</h4>
          <span className="text-[10px] text-muted italic ml-auto">
            {t('tutor.report.whatHelpedDemo')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-white text-green text-xs font-bold border border-green/30">
            {t('tutor.report.pause')}
          </span>
          <span className="px-3 py-1 rounded-full bg-white text-green text-xs font-bold border border-green/30">
            {t('tutor.report.quietPlace')}
          </span>
          <span className="px-3 py-1 rounded-full bg-white text-green text-xs font-bold border border-green/30">
            {t('tutor.report.visualSchedule')}
          </span>
        </div>
      </QoldauCard>

      {/* To clarify */}
      <QoldauCard variant="tinted-yellow">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-yellow" />
          <h4 className="text-sm font-black text-ink">{t('tutor.report.toClarify')}</h4>
        </div>
        <ul className="space-y-1.5 text-sm text-ink-2">
          <li className="leading-relaxed">• {t('tutor.report.toClarifyNoise')}</li>
          <li className="leading-relaxed">• {t('tutor.report.toClarifySchedule')}</li>
          <li className="leading-relaxed">• {t('tutor.report.toClarifyAac')}</li>
        </ul>
      </QoldauCard>

      <p className="text-[11px] text-muted text-center italic px-4">
        {t('tutor.report.disclaimer')}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleCopy}
          className="w-full h-13 rounded-2xl bg-teal text-white font-bold text-base flex items-center justify-center gap-2 shadow-card hover:bg-teal-dark transition-colors"
        >
          <Copy className="w-4 h-4" />
          {t('tutor.report.copy')}
        </button>
        <button
          onClick={handleSend}
          className="w-full h-13 rounded-2xl bg-white border-2 border-teal/30 text-teal-dark font-bold text-base flex items-center justify-center gap-2 hover:bg-teal-soft transition-colors"
        >
          <Send className="w-4 h-4" />
          {t('tutor.report.send')}
        </button>
      </div>
    </div>
  );
};