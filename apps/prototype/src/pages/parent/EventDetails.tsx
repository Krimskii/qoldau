import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { useEventStore } from '@/store/useEventStore';

export const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEventStore();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Событие не найдено" showBack />
      </div>
    );
  }

  const linkedEvents = event.linkedEventIds?.map((id) => events.find((e) => e.id === id)).filter(Boolean) || [];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Детали события"
        subtitle={`${event.title} · ${new Date(event.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
        showBack
      />

      <Card variant="behavior">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center text-ink">
            <span className="text-lg">{event.title[0]}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold">{event.description}</h4>
            <p className="text-xs text-muted">Источник: голосовое наблюдение мамы</p>
          </div>
        </div>
      </Card>

      <div className="bg-white border border-line rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-2">Расшифровка фрагмента</h4>
        <p className="text-xs text-ink-2 mb-3">"...начал нервничать, закрывал уши, ходил по комнате..."</p>
        <VoiceWave bars={8} />
      </div>

      {linkedEvents.length > 0 && (
        <div>
          <p className="text-xs font-bold text-ink-2 mb-2">Связанные события</p>
          <div className="flex gap-2">
            {linkedEvents.map((linked) => linked && (
              <Badge key={linked.id}>
                {new Date(linked.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} {linked.title}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <AIInsightCard
        text="Нервозность могла быть связана с переходом активности или сенсорной перегрузкой. Это наблюдение, не диагноз."
        variant="warning"
      />

      <div className="grid grid-cols-2 gap-2">
        <button className="border border-teal rounded-xl bg-white text-teal-dark font-bold py-3 text-sm">
          Редактировать
        </button>
        <button className="border border-teal rounded-xl bg-white text-teal-dark font-bold py-3 text-sm">
          Похожие случаи
        </button>
      </div>
    </div>
  );
};
