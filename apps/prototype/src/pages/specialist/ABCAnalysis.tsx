import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { mockSpecialistData } from '@/data/mockSpecialist';

export const ABCAnalysis: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="ABC-анализ"
        subtitle="Триггеры и последствия"
        showBack
      />

      {/* ABC Columns */}
      <div className="grid grid-cols-3 gap-3">
        {/* Antecedent */}
        <div className="bg-[#EAF6FF] border border-[#CAE7FF] rounded-2xl p-3">
          <h4 className="text-center font-bold text-sm mb-3 text-blue">A — До</h4>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-2 text-xs">
              <p className="font-bold">Шум</p>
              <p className="text-muted">Группа, переход</p>
            </div>
            <div className="bg-white rounded-xl p-2 text-xs">
              <p className="font-bold">Смена задания</p>
              <p className="text-muted">Переход к новому</p>
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="bg-[#F5F0FF] border border-[#DDD1FF] rounded-2xl p-3">
          <h4 className="text-center font-bold text-sm mb-3 text-purple">B — Что</h4>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-2 text-xs">
              <p className="font-bold">Нервозность</p>
              <p className="text-muted">Закрывает уши</p>
            </div>
            <div className="bg-white rounded-xl p-2 text-xs">
              <p className="font-bold">Отказ</p>
              <p className="text-muted">Не хочет задание</p>
            </div>
          </div>
        </div>

        {/* Consequence */}
        <div className="bg-[#EAF9F6] border border-[#C7ECE5] rounded-2xl p-3">
          <h4 className="text-center font-bold text-sm mb-3 text-teal">C — После</h4>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-2 text-xs">
              <p className="font-bold">Пауза</p>
              <p className="text-muted">Тихая комната</p>
            </div>
            <div className="bg-white rounded-xl p-2 text-xs">
              <p className="font-bold">Успокоение</p>
              <p className="text-muted">Продолжает занятие</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns */}
      <Card>
        <h4 className="text-sm font-bold mb-3">Замеченные паттерны</h4>
        {mockSpecialistData.patterns.map((p, i) => (
          <div key={i} className="py-2 border-b border-line last:border-0">
            <p className="text-xs"><span className="font-bold">Триггер:</span> {p.trigger}</p>
            <p className="text-xs"><span className="font-bold">Поведение:</span> {p.behavior}</p>
            <p className="text-xs"><span className="font-bold">Результат:</span> {p.consequence}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};
