import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Utensils, Droplet, Smile, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { EventType } from '@/types/qoldau';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface CareEntry {
  time: string;
  title: string;
  detail: string;
  type: EventType;
}

const TABS: { key: string; label: string; types: EventType[] }[] = [
  { key: 'all', label: 'Всё', types: ['food', 'water', 'toilet', 'sleep'] },
  { key: 'food', label: 'Питание', types: ['food'] },
  { key: 'water', label: 'Вода', types: ['water'] },
  { key: 'toilet', label: 'Туалет', types: ['toilet'] },
  { key: 'sleep', label: 'Сон', types: ['sleep'] },
];

const getTypeIcon = (type: EventType) => {
  switch (type) {
    case 'food': return <Utensils className="w-4 h-4 text-green" />;
    case 'water': return <Droplet className="w-4 h-4 text-blue" />;
    case 'toilet': return <Droplet className="w-4 h-4 text-blue" />;
    case 'sleep': return <Smile className="w-4 h-4 text-purple" />;
    default: return <MessageCircle className="w-4 h-4 text-muted" />;
  }
};

export const CareDiary: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { events } = useEventStore();
  const { showToast } = useToastStore();

  const activeTypes = TABS.find((t) => t.key === activeTab)?.types ?? [];
  const childEvents = events
    .filter((e) => e.childId === DEMO_PRIMARY_CHILD.id && activeTypes.includes(e.type))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 12);

  // Группировка по дням
  const grouped = childEvents.reduce<Record<string, CareEntry[]>>((acc, e) => {
    const day = new Date(e.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    if (!acc[day]) acc[day] = [];
    acc[day].push({
      time: new Date(e.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      title: e.title,
      detail: e.description,
      type: e.type,
    });
    return acc;
  }, {});

  const handleVoiceAdd = () => {
    navigate('/parent/voice');
  };

  const handleQuickAdd = (_type: EventType, label: string) => {
    showToast(`Создайте наблюдение через голос: "${label}"`, 'info');
    navigate('/parent/voice');
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Питание и уход"
        subtitle="События из Event Timeline"
      />

      {/* Tabs */}
      <div className="flex bg-bg border border-line rounded-xl p-1 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg py-2 px-3 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-teal-dark shadow-card-soft'
                : 'text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick add */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleQuickAdd('food', 'Поел кашу с сыром')}
          className="min-h-[60px] border border-line bg-white rounded-xl p-3 flex items-center gap-2 hover:shadow-card-soft transition-shadow"
        >
          <Utensils className="w-5 h-5 text-green" />
          <span className="text-sm font-bold">+ Еда</span>
        </button>
        <button
          onClick={() => handleQuickAdd('water', 'Выпил воды')}
          className="min-h-[60px] border border-line bg-white rounded-xl p-3 flex items-center gap-2 hover:shadow-card-soft transition-shadow"
        >
          <Droplet className="w-5 h-5 text-blue" />
          <span className="text-sm font-bold">+ Вода</span>
        </button>
      </div>

      {/* Data from EventStore */}
      {Object.keys(grouped).length === 0 ? (
        <Card variant="default">
          <div className="text-center py-6">
            <p className="text-sm font-bold mb-1">Пока нет событий этого типа</p>
            <p className="text-xs text-muted">
              Нажмите «Добавить голосом» ниже или используйте кнопки выше
            </p>
          </div>
        </Card>
      ) : (
        Object.entries(grouped).map(([day, entries]) => (
          <div key={day}>
            <p className="text-xs font-bold text-muted mb-2 uppercase tracking-wide">{day}</p>
            <Card variant="default">
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-line last:border-0"
                >
                  {getTypeIcon(entry.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">{entry.title}</div>
                    <div className="text-xs text-muted truncate">{entry.detail}</div>
                  </div>
                  <span className="text-xs font-bold text-muted">{entry.time}</span>
                </div>
              ))}
            </Card>
          </div>
        ))
      )}

      <AIInsightCard
        text="Похоже, в этом периоде ребёнок регулярно использует звук «ва» для воды и карточку «Туалет». Это наблюдение, не диагноз. Можно обсудить со специалистом."
        variant="default"
      />

      <button
        onClick={handleVoiceAdd}
        className="w-full border border-teal rounded-xl bg-teal-soft text-teal-dark font-bold py-3 flex items-center justify-center gap-2 hover:bg-teal hover:text-white transition-colors"
      >
        <Mic className="w-4 h-4" />
        Добавить голосом
      </button>
    </div>
  );
};