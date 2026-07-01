import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';

export const TutorReport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Отчёт родителю"
        subtitle="Краткая сводка за день"
        showBack
      />

      <div className="bg-white border border-line rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-3">Сегодняшняя активность</h4>
        <div className="space-y-2 text-xs text-ink-2">
          <p>• 10:00 — Отказ от задания, нервозность</p>
          <p>• 10:10 — Пауза 10 минут, тихое место</p>
          <p>• 10:30 — Еда, каша с сыром</p>
          <p>• 11:00 — Успокоился, продолжил занятие</p>
        </div>
      </div>

      <div className="bg-[#EAF9F6] border border-[#C7ECE5] rounded-2xl p-4">
        <h4 className="text-sm font-bold mb-2 text-teal-dark">Рекомендация</h4>
        <p className="text-xs text-ink-2">
          При переходе к новым заданиям рекомендуется заранее предупреждать и давать время на адаптацию. Это наблюдение, не диагноз.
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <Button>Отправить родителю</Button>
        <Button variant="secondary">Добавить комментарий</Button>
      </div>
    </div>
  );
};
