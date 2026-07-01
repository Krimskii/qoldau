import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AIInsightCard } from '@/components/ui/AIInsightCard';

export const ParentAnalytics: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Аналитика"
        subtitle="1–7 июля"
      />

      {/* Donut chart placeholder */}
      <div className="bg-white border border-line rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-full flex-shrink-0" style={{
            background: 'conic-gradient(var(--teal) 0 45%, var(--purple) 45% 66%, var(--blue) 66% 81%, var(--yellow) 81% 91%, #DCEAE7 91%)',
          }}>
            <div className="w-10 h-10 rounded-full bg-white m-2" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {[
              { name: 'Вода', percent: 32, color: 'bg-teal' },
              { name: 'Туалет', percent: 21, color: 'bg-purple' },
              { name: 'Пауза', percent: 14, color: 'bg-blue' },
              { name: 'Еда', percent: 12, color: 'bg-yellow' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-[70px]">{item.name}</span>
                <div className="flex-1 h-1.5 bg-[#EEF4F3] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent * 2.5}%` }} />
                </div>
                <strong className="w-8">{item.percent}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Triggers */}
      <div className="bg-white border border-line rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-3">Триггеры</h4>
        {[
          { name: 'Шум', percent: 45 },
          { name: 'Переход', percent: 30 },
        ].map((t) => (
          <div key={t.name} className="flex items-center justify-between gap-3 border-b border-[#EEF4F3] py-2.5 last:border-0">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple" />
              <span className="text-xs font-bold">{t.name}</span>
              <span className="text-xs text-muted">{t.percent}%</span>
            </div>
            <div className="w-14 h-1.5 bg-[#EAEFF2] rounded-full overflow-hidden">
              <div className="h-full bg-coral rounded-full" style={{ width: `${t.percent * 2.2}%` }} />
            </div>
          </div>
        ))}
      </div>

      <AIInsightCard
        text="AI-вывод недели: чаще всего влияли шум и переходы. Продолжайте использовать паузы и тихое место."
        variant="warning"
      />
    </div>
  );
};
