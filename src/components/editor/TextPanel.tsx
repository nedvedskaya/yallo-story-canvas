import { useState, useCallback, useRef } from "react";
import FontSection, { type FontSettings, type CustomFont } from "./FontSection";
import type { Slide } from "./SlideCarousel";

interface TextPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onSaveLive?: (updates: Partial<Slide>) => void;
  onApplyTextToAll: () => void;
}

const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#ffffff';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };
  const normalizedValue = /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : value.startsWith('rgb')
      ? rgbaToHex(value)
      : '#ffffff';

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'rgba(26,26,46,0.6)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <div
          className="relative w-7 h-7 rounded-full cursor-pointer border"
          style={{ backgroundColor: normalizedValue, borderColor: 'rgba(200,200,220,0.5)' }}
          onClick={() => ref.current?.click()}
        >
          <input
            ref={ref}
            type="color"
            value={normalizedValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={normalizedValue}
          onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value); }}
          className="w-[72px] rounded-lg px-2 py-1 text-[11px] font-mono text-center"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(200,200,220,0.5)',
            color: '#1a1a2e',
          }}
        />
      </div>
    </div>
  );
};

const TextPanel = ({ currentSlide, onSave, onSaveLive, onApplyTextToAll }: TextPanelProps) => {
  const [activeSection, setActiveSection] = useState<"title" | "body">("title");
  
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  const handleAddCustomFont = useCallback((font: CustomFont) => {
    setCustomFonts(prev => [...prev, font]);
  }, []);

  const titleSettings: FontSettings = {
    font: currentSlide.titleFont || "'Coolvetica', sans-serif",
    size: currentSlide.titleSize ?? 24,
    case: (currentSlide.titleCase || "none") as FontSettings["case"],
    lineHeight: currentSlide.titleLineHeight ?? 1.1,
    letterSpacing: currentSlide.titleLetterSpacing ?? 0,
  };

  const bodySettings: FontSettings = {
    font: currentSlide.bodyFont || "'Inter', sans-serif",
    size: currentSlide.bodySize ?? 14,
    case: (currentSlide.bodyCase || "none") as FontSettings["case"],
    lineHeight: currentSlide.bodyLineHeight ?? 1.4,
    letterSpacing: currentSlide.bodyLetterSpacing ?? 0,
  };

  const mapTitle = (updates: Partial<FontSettings>): Partial<Slide> => {
    const mapped: Partial<Slide> = {};
    if (updates.font !== undefined) mapped.titleFont = updates.font;
    if (updates.size !== undefined) mapped.titleSize = updates.size;
    if (updates.case !== undefined) mapped.titleCase = updates.case;
    if (updates.lineHeight !== undefined) mapped.titleLineHeight = updates.lineHeight;
    if (updates.letterSpacing !== undefined) mapped.titleLetterSpacing = updates.letterSpacing;
    return mapped;
  };

  const handleTitleChange = useCallback((updates: Partial<FontSettings>) => {
    const mapped = mapTitle(updates);
    if (onSaveLive) onSaveLive(mapped); else onSave(mapped);
  }, [onSave, onSaveLive]);

  const handleTitleCommit = useCallback((updates: Partial<FontSettings>) => {
    onSave(mapTitle(updates));
  }, [onSave]);

  const mapBody = (updates: Partial<FontSettings>): Partial<Slide> => {
    const mapped: Partial<Slide> = {};
    if (updates.font !== undefined) mapped.bodyFont = updates.font;
    if (updates.size !== undefined) mapped.bodySize = updates.size;
    if (updates.case !== undefined) mapped.bodyCase = updates.case;
    if (updates.lineHeight !== undefined) mapped.bodyLineHeight = updates.lineHeight;
    if (updates.letterSpacing !== undefined) mapped.bodyLetterSpacing = updates.letterSpacing;
    return mapped;
  };

  const handleBodyChange = useCallback((updates: Partial<FontSettings>) => {
    const mapped = mapBody(updates);
    if (onSaveLive) onSaveLive(mapped); else onSave(mapped);
  }, [onSave, onSaveLive]);

  const handleBodyCommit = useCallback((updates: Partial<FontSettings>) => {
    onSave(mapBody(updates));
  }, [onSave]);

  const tabs = [
    { id: "title" as const, label: "Заголовок" },
    { id: "body" as const, label: "Основной текст" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id)}
            className="flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all"
            style={{
              background: activeSection === t.id ? "rgba(255,255,255,0.7)" : "transparent",
              color: activeSection === t.id ? "#1a1a2e" : "rgba(26,26,46,0.45)",
              boxShadow: activeSection === t.id ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active section content */}
      {activeSection === "title" ? (
        <>
          <FontSection label="Шрифт заголовка" settings={titleSettings} onChange={handleTitleChange} onCommit={handleTitleCommit} customFonts={customFonts} onAddCustomFont={handleAddCustomFont} />
          <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
          <ColorPicker
            label="Цвет заголовка"
            value={currentSlide.titleColor || '#ffffff'}
            onChange={(c) => onSave({ titleColor: c })}
          />
        </>
      ) : (
        <>
          <FontSection label="Шрифт основного текста" settings={bodySettings} onChange={handleBodyChange} onCommit={handleBodyCommit} customFonts={customFonts} onAddCustomFont={handleAddCustomFont} />
          <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
          <ColorPicker
            label="Цвет текста"
            value={currentSlide.bodyColor || 'rgba(255,255,255,0.85)'}
            onChange={(c) => onSave({ bodyColor: c })}
          />
        </>
      )}

      <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
      <div className="flex items-center justify-end">
        <button
          onClick={onApplyTextToAll}
          className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{
            background: 'rgba(26,26,46,0.08)',
            border: '1px solid rgba(26,26,46,0.15)',
            color: '#1a1a2e',
          }}
        >
          Применить ко всем
        </button>
      </div>
    </div>
  );
};

export default TextPanel;
