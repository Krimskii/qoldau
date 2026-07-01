import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BarChart3, Volume2, ArrowRightLeft } from 'lucide-react';

const triggers = [
  { name: 'Шум', detail: 'Группа, переход', level: 78 },
  { name: 'Свет', detail: 'Средний', level: 46 },
  { name: 'Переход', detail: 'Смена активности', level: 71 },
];

const helpers = [
  { name: 'Пауза / отдых', status: 'Помогло' },
  { name: 'Тихое место', status: 'Помогло' },
  { name: 'Вода', status: 'Немного' },
];

export const BehaviorSensory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Триггеры');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Поведение и сенсорика"
        subtitle="Триггеры и что помогло"
        rightAction={
          <button className="text-teal font-bold text-sm">+ Добавить</button>
        }
      />

      {/* Tabs */}
      <div className="flex bg-[#F3F7F6] border border-line rounded-xl p-1 gap-1">
        {['Триггеры', 'Что помогло'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-white text-teal-dark shadow-[0_3px_10px_rgba(0,0,0,0.04)]'
                : 'text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Triggers */}
      {activeTab === 'Триггеры' && (
        <div className="bg-white border border-line rounded-2xl p-4">
          <h4 className="text-sm font-bold mb-3">Триггеры сегодня</h4>
          {triggers.map((t) => (
            <div key={t.name} className="flex items-center justify-between gap-3 border-b border-[#EEF4F3] py-2.5 last:border-0">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-purple" />
                <div>
                  <h4 className="text-xs font-bold">{t.name}</h4>
                  <p className="text-xs text-muted">{t.detail}</p>
                </div>
              </div>
              <div className="w-14 h-1.5 bg-[#EAEFF2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-coral rounded-full"
                  style={{ width: `${t.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helpers */}
      {activeTab === 'Что помогло' && (
        <div className="bg-white border border-line rounded-2xl p-4">
          {helpers.map((h, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-b border-[#EEF4F3] py-2.5 last:border-0">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-4 h-4 text-green" />
                <h4 className="text-xs font-bold">{h.name}</h4>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                h.status === 'Помогло' ? 'bg-green-soft text-green' : 'bg-yellow-soft text-yellow'
              }`}>
                {h.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
