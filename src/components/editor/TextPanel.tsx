import { useState, useCallback } from "react";
import FontSection, { type FontSettings } from "./FontSection";
import { Switch } from "@/components/ui/switch";
import type { Slide } from "./SlideCarousel";

interface TextPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onApplyTextToAll: () => void;
  onClose: () => void;
}

const TextPanel = ({ currentSlide, onSave, onApplyTextToAll, onClose }: TextPanelProps) => {
  const [applyAll, setApplyAll] = useState(false);

  const titleSettings: FontSettings = {
    font: currentSlide.titleFont || "'Coolvetica', sans-serif",
    size: currentSlide.titleSize ?? 28,
    case: (currentSlide.titleCase || "none") as FontSettings["case"],
    lineHeight: currentSlide.titleLineHeight ?? 1.1,
    letterSpacing: currentSlide.titleLetterSpacing ?? 0,
  };

  const bodySettings: FontSettings = {
    font: currentSlide.bodyFont || "'Inter', sans-serif",
    size: currentSlide.bodySize ?? 16,
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

  const handleSave = () => {
    if (applyAll) onApplyTextToAll();
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[30vh] scrollbar-hide">
      <FontSection label="Шрифт заголовка" settings={titleSettings} onChange={handleTitleChange} />
      <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
      <FontSection label="Шрифт основного текста" settings={bodySettings} onChange={handleBodyChange} />
      <div className="h-px" style={{ background: 'rgba(26,26,46,0.08)' }} />
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'rgba(26,26,46,0.6)' }}>Применить ко всем слайдам</span>
        <Switch checked={applyAll} onCheckedChange={setApplyAll} />
      </div>
      <button onClick={handleSave} className="w-full py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.97]" style={{ background: 'rgba(26,26,46,0.9)', color: '#ffffff' }}>
        Сохранить
      </button>
    </div>
  );
};

export default TextPanel;
