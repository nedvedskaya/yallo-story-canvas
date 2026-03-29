import { useState, useCallback } from "react";
import FontSection, { type FontSettings, type CustomFont } from "./FontSection";
import { Switch } from "@/components/ui/switch";
import type { Slide } from "./SlideCarousel";

interface TextPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onApplyTextToAll: () => void;
}

const TextPanel = ({ currentSlide, onSave, onApplyTextToAll }: TextPanelProps) => {
  const [activeSection, setActiveSection] = useState<"title" | "body">("title");
  const [applyAll, setApplyAll] = useState(false);
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
    lineHeight: currentSlide.bodyLineHeight ?? 1.5,
    letterSpacing: currentSlide.bodyLetterSpacing ?? 0,
  };

  const handleTitleChange = useCallback((updates: Partial<FontSettings>) => {
    const mapped: Partial<Slide> = {};
    if (updates.font !== undefined) mapped.titleFont = updates.font;
    if (updates.size !== undefined) mapped.titleSize = updates.size;
    if (updates.case !== undefined) mapped.titleCase = updates.case;
    if (updates.lineHeight !== undefined) mapped.titleLineHeight = updates.lineHeight;
    if (updates.letterSpacing !== undefined) mapped.titleLetterSpacing = updates.letterSpacing;
    onSave(mapped);
  }, [onSave]);

  const handleBodyChange = useCallback((updates: Partial<FontSettings>) => {
    const mapped: Partial<Slide> = {};
    if (updates.font !== undefined) mapped.bodyFont = updates.font;
    if (updates.size !== undefined) mapped.bodySize = updates.size;
    if (updates.case !== undefined) mapped.bodyCase = updates.case;
    if (updates.lineHeight !== undefined) mapped.bodyLineHeight = updates.lineHeight;
    if (updates.letterSpacing !== undefined) mapped.bodyLetterSpacing = updates.letterSpacing;
    onSave(mapped);
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
        <FontSection label="Шрифт заголовка" settings={titleSettings} onChange={handleTitleChange} customFonts={customFonts} onAddCustomFont={handleAddCustomFont} />
      ) : (
        <FontSection label="Шрифт основного текста" settings={bodySettings} onChange={handleBodyChange} customFonts={customFonts} onAddCustomFont={handleAddCustomFont} />
      )}

      <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'rgba(26,26,46,0.6)' }}>Применить ко всем слайдам</span>
        <Switch checked={applyAll} onCheckedChange={(v) => { setApplyAll(v); if (v) onApplyTextToAll(); }} />
      </div>
    </div>
  );
};

export default TextPanel;
