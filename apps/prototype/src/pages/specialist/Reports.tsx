import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText } from 'lucide-react';
import { mockChild } from '@/data/mockChild';

export const Reports: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Отчёты"
        subtitle="Формирование документов"
        showBack
      />

      {/* Weekly Report Preview */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-teal" />
          <div>
            <h4 className="text-sm font-bold">Недельный отчёт</h4>
            <p className="text-xs text-muted">24–30 июня 2026</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <p className="font-bold mb-1">Итоги недели</p>
            <p className="text-ink-2">
              Алихан хорошо адаптировался к новому расписанию. Замечено 12 эпизодов нервозности, 
              преимущественно связанных с шумом и переходами.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">Ключевые наблюдения</p>
            <ul className="text-ink-2 space-y-1 ml-2">
              <li>• Увеличилось использование AAC карточек (+15%)</li>
              <li>• Пауза помогает в 80% случаев</li>
              <li>• Новый сигнал "ва" для воды</li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-1">Рекомендации</p>
            <p className="text-ink-2 italic">
              Похоже, шум является основным триггером. Рекомендуется усилить сенсорную поддержку 
              в групповых занятиях. Это наблюдение, не диагноз.
            </p>
          </div>
        </div>
      </Card>

      {/* Download */}
      <Button className="flex items-center justify-center gap-2">
        <FileText className="w-4 h-4" />
        Скачать PDF
      </Button>

      {/* Report Types */}
      <div className="grid grid-cols-2 gap-3">
        {['Месячный', 'Индивидуальный', 'Для специалиста', 'Для родителя'].map((type) => (
          <button
            key={type}
            className="bg-white border border-line rounded-xl p-3 text-xs font-bold"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};
