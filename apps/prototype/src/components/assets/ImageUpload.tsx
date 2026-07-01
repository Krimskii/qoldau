import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';
import type { QoldauAsset, AssetCategory, AssetType } from '@/types/assets';
import { useAssetStore } from '@/store/useAssetStore';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml';

interface ImageUploadProps {
  defaultCategory?: AssetCategory;
  defaultType?: AssetType;
  defaultLabel?: string;
  /** Где применить созданный ассет (callback). */
  onAssetCreated: (asset: QoldauAsset) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * ImageUpload — локальная загрузка изображений.
 *
 * ВАЖНО: файлы НЕ отправляются на сервер. Они читаются через FileReader
 * в dataUrl и сохраняются в useAssetStore → localStorage.
 *
 * Лимит: 2 MB. Превышение → warning, файл не принимается.
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  defaultCategory = 'need',
  defaultType = 'uploaded_image',
  defaultLabel = '',
  onAssetCreated,
  onCancel,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const addCustomAsset = useAssetStore((s) => s.addCustomAsset);

  const [preview, setPreview] = useState<string | null>(null);
  const [label, setLabel] = useState(defaultLabel);
  const [category, setCategory] = useState<AssetCategory>(defaultCategory);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const reset = () => {
    setPreview(null);
    setLabel(defaultLabel);
    setCategory(defaultCategory);
    setError(null);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (file: File) => {
    setError(null);

    if (file.size > MAX_SIZE_BYTES) {
      setError(
        `Файл слишком большой (${Math.round(file.size / 1024)} КБ). Максимум 2 МБ.`,
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      if (!label) {
        // автогенерация имени из filename
        const baseName = file.name.replace(/\.[^.]+$/, '').slice(0, 30);
        setLabel(baseName || 'Моё изображение');
      }
      setPendingFile(file);
    };
    reader.onerror = () => {
      setError('Не удалось прочитать файл. Попробуйте другой.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSave = () => {
    if (!preview) return;

    const finalLabel = label.trim() || 'Моё изображение';

    const asset = addCustomAsset({
      type: defaultType,
      category,
      label: finalLabel,
      description: pendingFile ? `Загружено из ${pendingFile.name}` : undefined,
      dataUrl: preview,
    });

    onAssetCreated(asset);
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <div
      className={`bg-white border-2 border-line rounded-2xl p-4 flex flex-col gap-4 ${className}`}
    >
      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-[#FFFCEC] border border-[#f7e5a3] rounded-xl">
        <AlertTriangle className="w-4 h-4 text-[#9a7820] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-2 leading-snug">
          В demo-режиме изображение сохраняется только в этом браузере и не отправляется на сервер.
          Не используйте личные фото в публичной демонстрации без согласия.
        </p>
      </div>

      {/* File input + preview */}
      {!preview ? (
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center gap-2 min-h-[140px] border-2 border-dashed border-line rounded-2xl cursor-pointer hover:border-teal/40 hover:bg-teal-soft/30 transition-colors"
        >
          <Upload className="w-8 h-8 text-muted" />
          <span className="text-sm font-bold text-ink">Выберите изображение</span>
          <span className="text-xs text-muted">PNG, JPEG, WebP, SVG · до 2 МБ</span>
          <input
            ref={inputRef}
            id="image-upload-input"
            type="file"
            accept={ACCEPT}
            onChange={handleInputChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <img
            src={preview}
            alt="Предпросмотр"
            className="w-32 h-32 rounded-2xl object-cover border-2 border-line shadow-card-soft"
          />
          <button
            onClick={() => {
              setPreview(null);
              setPendingFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="text-xs text-muted hover:text-coral underline"
          >
            Заменить
          </button>
        </div>
      )}

      {/* Label + category */}
      {preview && (
        <>
          <div>
            <label className="block text-xs font-bold text-muted mb-1">Название</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Например: Мама, Мой пёс"
              className="w-full h-11 px-3 rounded-xl border-2 border-line focus:border-teal/60 focus:outline-none text-sm"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted mb-1">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full h-11 px-3 rounded-xl border-2 border-line focus:border-teal/60 focus:outline-none text-sm bg-white"
            >
              <option value="need">Потребность</option>
              <option value="feeling">Состояние</option>
              <option value="person">Человек</option>
              <option value="activity">Активность</option>
              <option value="calm">Спокойствие</option>
              <option value="media">Медиа</option>
              <option value="navigation">Навигация</option>
              <option value="achievement">Достижение</option>
            </select>
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-[#FFEAEA] border border-[#FFC2BE] rounded-xl text-sm text-[#cc251d]">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:bg-bg transition-colors"
          >
            Отмена
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!preview}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-teal to-teal-dark text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-card-hover transition-shadow"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};