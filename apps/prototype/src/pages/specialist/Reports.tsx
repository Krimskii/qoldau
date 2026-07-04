import React from 'react';
import { FileText, Download, Mail, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/useToastStore';

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

export const Reports: React.FC = () => {
  const { showToast } = useToastStore();

  const handleShareReport = async () => {
    const shareData = {
      title: 'Qoldau — отчёт наблюдений',
      text: 'Отчёт наблюдений Qoldau (профиль наблюдений, не диагноз).',
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
        subtitle="Пример отчёта (демо)"
        showBack
      />

      {/* Полноценный preview отчёта */}
      <QoldauCard variant="default" padding="none" className="overflow-hidden">
        {/* Header отчёта */}
        <div className="bg-gradient-to-br from-teal to-teal-dark text-white p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide opacity-80">Qoldau AI · Отчёт</p>
              <h2 className="text-2xl font-black mt-1 leading-tight">Алихан, 4 года</h2>
              <p className="text-sm opacity-90 mt-1">24–30 июня 2026 · Недельный</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-black flex-shrink-0">
              MVP
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Итоги недели */}
          <section>
            <SectionHeader number="1" title="Итоги недели" />
            <p className="text-sm text-ink-2 leading-relaxed">
              Зафиксировано 32 события от родителя, тьютора и ребёнка. Алихан хорошо
              адаптировался к новому расписанию. Замечено 12 эпизодов нервозности,
              преимущественно связанных с шумом и переходами.
            </p>
          </section>

          {/* KPI grid */}
          <section>
            <SectionHeader number="2" title="Ключевые показатели" />
            <div className="grid grid-cols-3 gap-2.5">
              <KpiCard label="AAC карточек" value="+15%" sub="за неделю" color="teal" />
              <KpiCard label="Спокойный режим" value="5 раз" sub="помог в 80%" color="green" />
              <KpiCard label="Новых сигналов" value="+3" sub="звуки и слова" color="blue" />
            </div>
          </section>

          {/* Ключевые наблюдения */}
          <section>
            <SectionHeader number="3" title="Ключевые наблюдения" />
            <ul className="space-y-2 text-sm text-ink-2">
              <Observation
                label="Увеличилось использование AAC"
                detail="Карточки «Вода», «Туалет», «Помощь» — без напоминания"
              />
              <Observation
                label="Пауза помогает"
                detail="В 4 из 5 эпизодов нервозности ребёнок успокоился после 2-3 мин"
              />
              <Observation
                label="Новый звук «ва»"
                detail="Подтверждён 4 раза в разных контекстах — связан с водой"
              />
            </ul>
          </section>

          {/* Рекомендации */}
          <section>
            <SectionHeader number="4" title="Рекомендации" />
            <div className="bg-yellow-soft border border-yellow/20 rounded-2xl p-3">
              <p className="text-sm text-ink-2 leading-relaxed italic">
                Похоже, шум является основным триггером. Рекомендуется усилить сенсорную
                поддержку в групповых занятиях и предупреждать за 1-2 минуты до смены
                активности. <strong className="not-italic">Это наблюдение, не диагноз.</strong>
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

const KpiCard: React.FC<{ label: string; value: string; sub: string; color: 'teal' | 'blue' | 'green' }> = ({
  label,
  value,
  sub,
  color,
}) => {
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

const Observation: React.FC<{ label: string; detail: string }> = ({ label, detail }) => (
  <li className="flex items-start gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 flex-shrink-0" />
    <div>
      <p className="font-black text-ink">{label}</p>
      <p className="text-muted leading-relaxed">{detail}</p>
    </div>
  </li>
);