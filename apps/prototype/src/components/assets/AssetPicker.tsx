import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import type { QoldauAsset, AssetCategory } from '@/types/assets';
import { useAssetStore } from '@/store/useAssetStore';
import { IconRenderer } from './IconRenderer';
import { ImageUpload } from './ImageUpload';
import { COLOR_MAP, type QoldauIconColor } from '@/components/ui/QoldauIconCard';

interface AssetPickerProps {
  /** Если true — открыто как inline-панель. */
  isOpen: boolean;
  selectedAssetId?: string;
  /** Фильтр по категории (опц.). */
  category?: AssetCategory;
  onSelect: (asset: QoldauAsset) => void;
  onClose: () => void;
  /** Заголовок панели. */
  title?: string;
}

const ALL_CATEGORIES: AssetCategory[] = [
  'need',
  'feeling',
  'activity',
  'person',
  'calm',
  'media',
  'navigation',
  'achievement',
];

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  need: 'Основные',
  feeling: 'Состояния',
  person: 'Люди',
  activity: 'Активности',
  calm: 'Спокойствие',
  media: 'Любимые',
  navigation: 'Навигация',
  achievement: 'Достижения',
};

/**
 * AssetPicker — выбор ассета для AAC-карточки / favorite / контакта.
 *
 * Поддерживает:
 * - Табы по категориям (built-in).
 * - Поиск по label.
 * - Вкладка "Загруженные" для custom (user-uploaded) ассетов.
 * - Загрузка нового изображения через ImageUpload.
 *
 * Mobile-first, 3-колонная сетка, без перегруза.
 */
export const AssetPicker: React.FC<AssetPickerProps> = ({
  isOpen,
  selectedAssetId,
  category,
  onSelect,
  onClose,
  title = 'Выбрать иконку',
}) => {
  const assets = useAssetStore((s) => s.assets);
  const [activeTab, setActiveTab] = useState<AssetCategory>(
    category ?? 'need',
  );
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets
      .filter((a) => a.category === activeTab)
      .filter((a) => !q || a.label.toLowerCase().includes(q));
  }, [assets, activeTab, query]);

  if (!isOpen) return null;

  return (
    <div
      className="bg-white border-2 border-line rounded-2xl shadow-card overflow-hidden flex flex-col"
      role="dialog"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-soft">
        <h3 className="text-base font-black text-ink">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-bg flex items-center justify-center"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-line-soft">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск иконки..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-line focus:border-teal/60 focus:outline-none text-sm bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-line-soft">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === cat
                ? 'bg-teal text-white shadow-card-soft'
                : 'bg-bg text-muted hover:text-ink hover:bg-line-soft'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {!showUpload ? (
        <div className="p-4 grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
          {filtered.map((asset) => {
            const isSelected = asset.id === selectedAssetId;
            const isCustom = asset.isCustom;
            const palette = asset.color ? COLOR_MAP[asset.color as QoldauIconColor] : null;
            return (
              <button
                key={asset.id}
                onClick={() => onSelect(asset)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${
                  palette
                    ? `${palette.bg} ${palette.border}`
                    : 'bg-white border-line'
                } ${isSelected ? 'ring-2 ring-offset-2 ring-teal/50' : ''}`}
                aria-label={asset.label}
                aria-pressed={isSelected}
              >
                <IconRenderer asset={asset} size={48} />
                <span className="text-xs font-bold text-ink leading-tight text-center line-clamp-2">
                  {asset.label}
                </span>
                {isCustom && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral" aria-label="Загружено" />
                )}
                {isSelected && (
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-teal flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-3 text-center text-sm text-muted py-6">
              Ничего не найдено
            </p>
          )}
        </div>
      ) : (
        <div className="p-4">
          <ImageUpload
            defaultCategory={activeTab}
            defaultLabel={query}
            onAssetCreated={(asset) => {
              setShowUpload(false);
              onSelect(asset);
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Footer — переключатель на upload */}
      <div className="px-4 py-3 border-t border-line-soft bg-bg">
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="text-sm font-bold text-teal-dark hover:underline"
        >
          {showUpload ? '← Назад к выбору' : '+ Загрузить своё изображение'}
        </button>
      </div>
    </div>
  );
};