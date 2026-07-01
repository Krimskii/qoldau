import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bell, Sparkles, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';

const periods = ['7', '14', '30'];

export const SpecialistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Панель специалиста"
        subtitle="Обзор за период"
        rightAction={<Bell className="w-5 h-5 text-muted" />}
      />

      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              period === p
                ? 'bg-teal text-white'
                : 'bg-white border border-line text-muted'
            }`}
          >
            {p} дней
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-2xl font-black text-teal">24</div>
          <p className="text-xs text-muted">Событий</p>
        </Card>
        <Card>
          <div className="text-2xl font-black text-purple">5</div>
          <p className="text-xs text-muted">Новых сигналов</p>
        </Card>
        <Card>
          <div className="text-2xl font-black text-blue">3</div>
          <p className="text-xs text-muted">Коммуникаций</p>
        </Card>
        <Card>
          <div className="text-2xl font-black text-green">+12%</div>
          <p className="text-xs text-muted">Динамика</p>
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsightCard
        text="Замечена связь между шумом и нервозностью. Рекомендуется усилить сенсорную поддержку в групповых занятиях. Это наблюдение, не диагноз."
        variant="warning"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/specialist/abc')}
          className="bg-white border border-line rounded-2xl p-4 text-left"
        >
          <div className="text-sm font-bold mb-1">ABC-анализ</div>
          <p className="text-xs text-muted">Триггеры и последствия</p>
        </button>
        <button
          onClick={() => navigate('/specialist/reports')}
          className="bg-gradient-to-br from-teal to-[#037A76] text-white rounded-2xl p-4 flex items-center gap-3"
        >
          <FileText className="w-5 h-5" />
          <div>
            <div className="text-sm font-bold">Сформировать отчёт</div>
          </div>
        </button>
      </div>

      {/* New Signals */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Новые сигналы</h4>
        {[
          { signal: '"ва"', meaning: 'возможно вода', date: '01.07' },
          { signal: 'тянет за руку', meaning: 'хочет показать', date: '30.06' },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
            <div>
              <span className="text-sm font-bold">{s.signal}</span>
              <p className="text-xs text-muted">{s.meaning}</p>
            </div>
            <span className="text-xs text-muted">{s.date}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};
