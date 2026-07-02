import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import { ChevronRight } from 'lucide-react';
import { getCategoryById, CATEGORIES } from '@/data/categories';

/**
 * /child/category/:id — страница категории (v0.3.25).
 *
 * Показывает обложку категории + grid items (карточки с иконкой + лейблом).
 * Tap на item:
 * - addEvent `phrase` (label + source 'category')
 * - success-toast «Мама увидит»
 * - возврат на /child/home
 *
 * Если категория не найдена — показать fallback с ссылками на все категории.
 */
export const ChildCategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { showToast } = useToastStore();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const category = getCategoryById(categoryId ?? '');

  const handleSelect = (itemId: string, label: string) => {
    setActiveItem(itemId);
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'phrase',
      title: `Хочу: ${label}`,
      description: `Ребёнок выбрал «${label}». Это наблюдение, не диагноз.`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
      payload: { source: 'category_card', category: categoryId, item: itemId, label },
    });
    showToast(`Мама увидит: ${label}`, 'success');
    setTimeout(() => {
      setActiveItem(null);
      navigate('/child/home');
    }, 700);
  };

  if (!category) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)]">
        <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-[13px] border border-line bg-white flex items-center justify-center"
            aria-label="Назад"
          >
            <BackArrowIcon size={20} />
          </button>
          <div className="text-xl font-black text-ink">Не нашли</div>
        </div>
        <div className="mx-5 mt-4 bg-white border border-line rounded-2xl p-5">
          <p className="text-sm text-muted">Такой категории нет. Попробуй:</p>
          <div className="flex flex-col gap-2 mt-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/child/category/${c.id}`)}
                className="text-left px-3 py-2 rounded-xl border border-line hover:bg-bg transition-colors text-sm font-bold"
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-[13px] border border-line bg-white flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={20} />
        </button>
        <div className="text-xl font-black text-ink">{category.title}</div>
      </div>

      {/* Cover (hero card) */}
      <div
        className="mx-5 mt-3 mb-4 rounded-[24px] p-5 shadow-card flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${category.coverFrom} 0%, ${category.coverTo} 100%)`,
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-card-soft"
        >
          <category.Icon size={56} animated={false} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-ink leading-tight">{category.title}</h2>
          <p className="text-sm font-bold text-ink-2 mt-0.5">{category.description}</p>
          <p className="text-[11px] font-bold text-ink-2/70 mt-1">
            {category.items.length} элементов · нажми, чтобы выбрать
          </p>
        </div>
      </div>

      {/* Items grid (2-col) */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        {category.items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id, item.label)}
              className={`bg-white border border-line rounded-[20px] p-3 flex flex-col items-center gap-2 shadow-card-soft active:scale-[0.95] transition-all min-h-[100px] ${
                item.wide ? 'col-span-2 flex-row justify-start text-left p-4' : ''
              } ${isActive ? 'ring-2 ring-teal scale-[0.97]' : ''}`}
              aria-label={`Выбрать «${item.label}»`}
            >
              <div
                className={`${item.wide ? 'w-14 h-14' : 'w-12 h-12'} rounded-[14px] flex items-center justify-center flex-shrink-0`}
                style={{ background: item.iconBg }}
              >
                <item.Icon size={item.wide ? 36 : 32} animated={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-base font-black leading-tight truncate"
                  style={{ color: item.iconColor }}
                >
                  {item.label}
                </div>
              </div>
              {!item.wide && (
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};