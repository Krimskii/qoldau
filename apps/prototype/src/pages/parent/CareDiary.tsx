import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Utensils, Droplet } from 'lucide-react';

const tabs = ['Питание', 'Вода', 'Туалет'];

export const CareDiary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Питание');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Питание и туалет"
        subtitle="Уходовые события дня"
        rightAction={
          <button className="text-teal font-bold text-sm">+ Добавить</button>
        }
      />

      {/* Tabs */}
      <div className="flex bg-[#F3F7F6] border border-line rounded-xl p-1 gap-1">
        {tabs.map((tab) => (
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

      {/* Data */}
      <div className="bg-white border border-line rounded-2xl p-4">
        {activeTab === 'Питание' && (
          <>
            <MetricCard
              icon={<Utensils className="w-4 h-4 text-green" />}
              label="10:10 · Каша с сыром"
              value="Съел почти всё"
              status="normal"
            />
            <MetricCard
              icon={<Droplet className="w-4 h-4 text-blue" />}
              label="13:30 · Вода"
              value="200 мл"
              status="normal"
            />
          </>
        )}
        {activeTab === 'Вода' && (
          <MetricCard
            icon={<Droplet className="w-4 h-4 text-blue" />}
            label="13:30 · Вода"
            value="200 мл"
            status="normal"
          />
        )}
        {activeTab === 'Туалет' && (
          <MetricCard
            icon={<Droplet className="w-4 h-4 text-blue" />}
            label="10:40 · Туалет"
            value="Стул жидкий"
            status="important"
          />
        )}
      </div>

      <AIInsightCard text="Сегодня в рационе мало воды и клетчатки. Это может влиять на самочувствие и стул." />

      <Button onClick={() => {}} className="mt-auto">
        Добавить голосом
      </Button>
    </div>
  );
};
