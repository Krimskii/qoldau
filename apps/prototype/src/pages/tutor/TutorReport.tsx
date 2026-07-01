import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useEventStore } from '@/store/useEventStore';

export const TutorReport: React.FC = () => {
  const { events } = useEventStore();

  // Get tutor events from today
  const today = new Date().toISOString().split('T')[0];
  const tutorEvents = events.filter(
    (e) => e.sourceRole === 'tutor' && e.timestamp.startsWith(today)
  );

  const reportContent = tutorEvents.length > 0
    ? tutorEvents.map((e) => {
        const time = new Date(e.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return `• ${time} — ${e.title}: ${e.description}`;
      }).join('\n')
    : '• 10:00 — Отказ от задания, нервозность\n• 10:10 — Пауза 10 минут, тихое место\n• 10:30 — Еда, каша с сыром\n• 11:00 — Успокоился, продолжил занятие';

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Отчёт родителю"
        subtitle="Краткая сводка за день"
        showBack
      />

      <div className="bg-white border border-line rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-3">Сегодняшняя активность</h4>
        <div className="space-y-1.5 text-xs text-ink-2 whitespace-pre-line">
          {reportContent}
        </div>
      </div>

      <div className="bg-[#EAF9F6] border border-[#C7ECE5] rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-2 text-teal-dark">Рекомендация</h4>
        <p className="text-xs text-ink-2">
          Похоже, при переходе к новым заданиям рекомендуется заранее предупреждать и давать время на адаптацию. Это наблюдение, не диагноз. Можно обсудить со специалистом.
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <Button>Отправить родителю</Button>
        <Button variant="secondary">Добавить комментарий</Button>
      </div>
    </div>
  );
};
