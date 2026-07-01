import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { BackArrowIcon } from '@/components/icons/child2d';
import { ChevronRight } from 'lucide-react';
import { QUICK_NEEDS, CATEGORIES } from '@/data/categories';

/**
 * ChildCards (v0.3.25) — «Быстрые карточки».
 *
 * 2 секции:
 * - **«Потребности»** (3 карточки) → открывает NeedCard (вода/еда/туалет).
 * - **«Мир вокруг»** (5 категорий) → открывает /child/category/:id с grid items.
 *
 * Каждая карточка имеет:
 * - белую подложку с цветной плиткой-иконкой (AAC color coding);
 * - иконку из child2d.tsx;
 * - большой label + small description;
 * - ChevronRight для affordance;
 * - active:scale-95 + лёгкий hover-эффект.
 */
export const ChildCards: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();

  // Featured card — топовая категория (первая в списке)
  const featured = CATEGORIES[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-[100px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
        <button
          onClick={() => navigate('/child/home')}
          className="w-10 h-10 rounded-[13px] border border-line bg-white flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Назад"
        >
          <BackArrowIcon size={20} />
        </button>
        <div className="text-xl font-black text-ink">Быстрые карточки</div>
      </div>

      {/* Featured — top card (slightly larger) */}
      <button
        onClick={() => {
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
        className="mx-5 mt-3 rounded-[24px] p-4 shadow-card flex items-center gap-4 active:scale-[0.97] transition-transform text-left"
        style={{
          background: `linear-gradient(135deg, ${featured.coverFrom} 0%, ${featured.coverTo} 100%)`,
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-card-soft flex-shrink-0">
          <featured.Icon size={56} animated={false} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wide text-ink-2/70 bg-white/50 px-2 py-0.5 rounded-full">
              Любимое
            </span>
          </div>
          <h2 className="text-xl font-black text-ink leading-tight">
            {featured.title}
          </h2>
          <p className="text-sm font-bold text-ink-2 mt-0.5">{featured.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-ink-2 flex-shrink-0" />
      </button>

      {/* Section: Потребности */}
      <Section title="Потребности" subtitle="Базовые сигналы">
        <div className="grid grid-cols-3 gap-3">
          {QUICK_NEEDS.map((need) => (
            <button
              key={need.id}
              onClick={() => navigate(need.go)}
              className="bg-white border border-line rounded-[20px] p-3 flex flex-col items-center gap-2 shadow-card-soft active:scale-[0.95] transition-transform"
              aria-label={need.title}
            >
              <div
                className={`w-12 h-12 rounded-[14px] ${need.bg} flex items-center justify-center`}
              >
                <need.Icon size={32} animated={false} />
              </div>
              <div className={`text-xs font-black text-center leading-tight ${need.text}`}>
                {need.title}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Section: Мир вокруг (категории) */}
      <Section title="Мир вокруг" subtitle="Открой и выбери">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
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
              className="bg-white border border-line rounded-[20px] p-3 flex items-center gap-3 shadow-card-soft active:scale-[0.95] transition-transform text-left"
              aria-label={cat.title}
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${cat.coverFrom} 0%, ${cat.coverTo} 100%)`,
                }}
              >
                <cat.Icon size={32} animated={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-black leading-tight truncate"
                  style={{ color: cat.accent }}
                >
                  {cat.title}
                </div>
                <div className="text-[11px] text-muted truncate">{cat.description}</div>
                <div className="text-[10px] text-muted mt-0.5">
                  {cat.items.length} элементов
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <p className="px-5 mt-2 text-[11px] text-muted text-center italic">
        Это наблюдения, не диагноз. Можно обсудить со специалистом.
      </p>
    </div>
  );
};

/** Section header + content wrapper. */
const Section: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <section className="mt-5">
    <div className="px-5 mb-2 flex items-baseline justify-between">
      <h3 className="text-sm font-black text-ink-2 uppercase tracking-wide">
        {title}
      </h3>
      {subtitle && (
        <span className="text-[11px] text-muted font-bold">{subtitle}</span>
      )}
    </div>
    <div className="px-5">{children}</div>
  </section>
);