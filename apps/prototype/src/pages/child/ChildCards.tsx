import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import { QUICK_NEEDS, CATEGORIES } from '@/data/categories';
import { speak } from '@/lib/tts/speak';

/**
 * ChildCards (v1.5+ minimal) — «Быстрые карточки».
 *
 * v1.5+ bugfix: убраны «хлебные крошки» (шапка с заголовком и кнопкой
 * «назад»), описания категорий, группировка на секции и подзаголовки,
 * бэйджи «Любимое». Карточки — большие квадратные кнопки с одной иконкой
 * (как на главной ChildHome). Сетка 4 колонки для потребностей,
 * 4 колонки для категорий — без надписей.
 *
 * Каждая карточка:
 * - белая подложка, цветная плитка-иконка;
 * - touch-friendly ≥110×110px;
 * - aria-label сохранён (a11y).
 */
export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();

  // Featured card — первая категория.
  const featured = CATEGORIES[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-[100px]">
      {/* Back — единственный элемент шапки (без заголовка). */}
      <div className="flex items-center gap-2.5 px-3 pt-2 pb-1">
        <button
          onClick={() => navigate('/child/home')}
          className="w-9 h-9 rounded-[12px] border border-line bg-white flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={18} />
        </button>
      </div>

      {/* Featured — большая верхняя карточка с иконкой (без надписей). */}
      <button
        onClick={() => {
          speak(featured.title);
          addEvent({
            childId: DEMO_PRIMARY_CHILD.id,
            type: 'phrase',
            title: `Любимое: ${featured.title}`,
            description: `Ребёнок открыл «${featured.title}». Это наблюдение, не диагноз.`,
            timestamp: new Date().toISOString(),
            sourceRole: 'child',
            status: 'confirmed',
            payload: { source: 'featured_card', category: featured.id },
          });
          navigate(`/child/category/${featured.id}`);
        }}
        className="mx-5 mt-2 mb-3 rounded-[24px] shadow-card flex items-center justify-center aspect-[2/1] min-h-[120px] active:scale-[0.97] transition-transform"
        style={{
          background: `linear-gradient(135deg, ${featured.coverFrom} 0%, ${featured.coverTo} 100%)`,
        }}
        aria-label={featured.title}
      >
        <div className="w-[88px] h-[88px] rounded-[22px] bg-white flex items-center justify-center shadow-card-soft">
          <featured.Icon size={68} animated={false} />
        </div>
      </button>

      {/* Потребности — 4 колонки, без надписей, без шапки секции. */}
      <div className="grid grid-cols-4 gap-3 px-5 pb-2">
        {QUICK_NEEDS.map((need) => (
          <button
            key={need.id}
            onClick={() => {
              speak(need.title);
              navigate(need.go);
            }}
            className="flex items-center justify-center bg-white rounded-[22px] shadow-card-soft aspect-square w-full min-h-[88px] transition-transform active:scale-[0.94]"
            aria-label={need.title}
          >
            <div
              className={`w-[64px] h-[64px] rounded-[16px] ${need.bg} flex items-center justify-center`}
            >
              <need.Icon size={48} animated={false} />
            </div>
          </button>
        ))}
      </div>

      {/* Категории — 4 колонки, без надписей, без шапки секции. */}
      <div className="grid grid-cols-4 gap-3 px-5 pt-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              speak(cat.title);
              addEvent({
                childId: DEMO_PRIMARY_CHILD.id,
                type: 'phrase',
                title: `Открыл: ${cat.title}`,
                description: `Ребёнок открыл «${cat.title}». Это наблюдение, не диагноз.`,
                timestamp: new Date().toISOString(),
                sourceRole: 'child',
                status: 'confirmed',
                payload: { source: 'category_open', category: cat.id },
              });
              navigate(`/child/category/${cat.id}`);
            }}
            className="flex items-center justify-center bg-white rounded-[22px] shadow-card-soft aspect-square w-full min-h-[88px] transition-transform active:scale-[0.94]"
            aria-label={cat.title}
          >
            <div
              className="w-[64px] h-[64px] rounded-[16px] flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${cat.coverFrom} 0%, ${cat.coverTo} 100%)`,
              }}
            >
              <cat.Icon size={48} animated={false} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};