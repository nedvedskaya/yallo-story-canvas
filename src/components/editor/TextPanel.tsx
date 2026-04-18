import { useState, useCallback, useRef } from "react";
import FontSection, { type FontSettings, type CustomFont } from "./FontSection";
import type { Slide } from "./SlideCarousel";
import GlassTabBar from "./GlassTabBar";
import ApplyToAllButton from "./ApplyToAllButton";
import { rgbaToHex } from "@/lib/utils";
import { FORMAT_DESIGN } from "./shared-styles";
import type { SlideFormat } from "./SizePanel";
import InlineTextEditor from "./InlineTextEditor";

interface TextPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onSaveLive?: (updates: Partial<Slide>) => void;
  onApplyTextToAll: () => void;
  slideFormat?: SlideFormat;
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

/** Map FontSettings updates to Slide fields for a given prefix */
function mapFontSettings(prefix: "title" | "body", updates: Partial<FontSettings>): Partial<Slide> {
  const mapped: Partial<Slide> = {};
  if (updates.font !== undefined) (mapped as any)[`${prefix}Font`] = updates.font;
  if (updates.size !== undefined) (mapped as any)[`${prefix}Size`] = updates.size;
  if (updates.case !== undefined) (mapped as any)[`${prefix}Case`] = updates.case;
  if (updates.lineHeight !== undefined) (mapped as any)[`${prefix}LineHeight`] = updates.lineHeight;
  if (updates.letterSpacing !== undefined) (mapped as any)[`${prefix}LetterSpacing`] = updates.letterSpacing;
  return mapped;
}

const TextPanel = ({ currentSlide, onSave, onSaveLive, onApplyTextToAll, slideFormat = "carousel" }: TextPanelProps) => {
  const [activeSection, setActiveSection] = useState<"title" | "body">("title");
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  const handleAddCustomFont = useCallback((font: CustomFont) => {
    setCustomFonts(prev => [...prev, font]);
  }, []);

  const design = FORMAT_DESIGN[slideFormat] || FORMAT_DESIGN.carousel;

  const titleSettings: FontSettings = {
    font: currentSlide.titleFont || "'Coolvetica', sans-serif",
    size: currentSlide.titleSize ?? design.titleSize,
    case: (currentSlide.titleCase || "none") as FontSettings["case"],
    lineHeight: currentSlide.titleLineHeight ?? design.titleLineHeight,
    letterSpacing: currentSlide.titleLetterSpacing ?? 0,
  };

  const bodySettings: FontSettings = {
    font: currentSlide.bodyFont || "'Inter', sans-serif",
    size: currentSlide.bodySize ?? design.bodySize,
    case: (currentSlide.bodyCase || "none") as FontSettings["case"],
    lineHeight: currentSlide.bodyLineHeight ?? design.bodyLineHeight,
    letterSpacing: currentSlide.bodyLetterSpacing ?? 0,
  };

  const handleChange = useCallback((prefix: "title" | "body") => (updates: Partial<FontSettings>) => {
    const mapped = mapFontSettings(prefix, updates);
    if (onSaveLive) onSaveLive(mapped); else onSave(mapped);
  }, [onSave, onSaveLive]);

  const handleCommit = useCallback((prefix: "title" | "body") => (updates: Partial<FontSettings>) => {
    onSave(mapFontSettings(prefix, updates));
  }, [onSave]);

  const tabs = [
    { id: "title", label: "Заголовок" },
    { id: "body", label: "Основной текст" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <GlassTabBar tabs={tabs} activeId={activeSection} onChange={(id) => setActiveSection(id as "title" | "body")} />

      {activeSection === "title" ? (
        <>
          <FontSection label="Шрифт заголовка" settings={titleSettings} onChange={handleChange("title")} onCommit={handleCommit("title")} customFonts={customFonts} onAddCustomFont={handleAddCustomFont} />
          <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
          <ColorPicker
            label="Цвет заголовка"
            value={currentSlide.titleColor || '#ffffff'}
            onChange={(c) => onSave({ titleColor: c })}
          />
        </>
      ) : (
        <>
          <FontSection label="Шрифт основного текста" settings={bodySettings} onChange={handleChange("body")} onCommit={handleCommit("body")} customFonts={customFonts} onAddCustomFont={handleAddCustomFont} />
          <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
          <ColorPicker
            label="Цвет текста"
            value={currentSlide.bodyColor || 'rgba(255,255,255,0.85)'}
            onChange={(c) => onSave({ bodyColor: c })}
          />
        </>
      )}

      <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
      <ApplyToAllButton onClick={onApplyTextToAll} />
    </div>
  );
};

export default TextPanel;
