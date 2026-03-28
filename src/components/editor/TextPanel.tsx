import { useState, useCallback } from "react";
import FontSection, { type FontSettings } from "./FontSection";
import { Switch } from "@/components/ui/switch";
import type { Slide } from "./SlideCarousel";

interface TextPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onApplyTextToAll: (updates: Partial<Slide>) => void;
  onClose: () => void;
}

const TextPanel = ({ currentSlide, onSave, onApplyTextToAll, onClose }: TextPanelProps) => {
  const [applyAll, setApplyAll] = useState(false);

  // Local draft state
  const [draft, setDraft] = useState({
    titleFont: currentSlide.titleFont || "'Inter', sans-serif",
    titleSize: currentSlide.titleSize ?? 28,
    titleCase: currentSlide.titleCase || "none",
    titleLineHeight: currentSlide.titleLineHeight ?? 1.1,
    titleLetterSpacing: currentSlide.titleLetterSpacing ?? 0,
    bodyFont: currentSlide.bodyFont || "'Inter', sans-serif",
    bodySize: currentSlide.bodySize ?? 16,
    bodyCase: currentSlide.bodyCase || "none",
    bodyLineHeight: currentSlide.bodyLineHeight ?? 1.5,
    bodyLetterSpacing: currentSlide.bodyLetterSpacing ?? 0,
  });

  const titleSettings: FontSettings = {
    font: draft.titleFont,
    size: draft.titleSize,
    case: draft.titleCase as FontSettings["case"],
    lineHeight: draft.titleLineHeight,
    letterSpacing: draft.titleLetterSpacing,
  };

  const bodySettings: FontSettings = {
    font: draft.bodyFont,
    size: draft.bodySize,
    case: draft.bodyCase as FontSettings["case"],
    lineHeight: draft.bodyLineHeight,
    letterSpacing: draft.bodyLetterSpacing,
  };

  const handleTitleChange = useCallback((updates: Partial<FontSettings>) => {
    setDraft(prev => {
      const next = { ...prev };
      if (updates.font !== undefined) next.titleFont = updates.font;
      if (updates.size !== undefined) next.titleSize = updates.size;
      if (updates.case !== undefined) next.titleCase = updates.case;
      if (updates.lineHeight !== undefined) next.titleLineHeight = updates.lineHeight;
      if (updates.letterSpacing !== undefined) next.titleLetterSpacing = updates.letterSpacing;
      return next;
    });
  }, []);

  const handleBodyChange = useCallback((updates: Partial<FontSettings>) => {
    setDraft(prev => {
      const next = { ...prev };
      if (updates.font !== undefined) next.bodyFont = updates.font;
      if (updates.size !== undefined) next.bodySize = updates.size;
      if (updates.case !== undefined) next.bodyCase = updates.case;
      if (updates.lineHeight !== undefined) next.bodyLineHeight = updates.lineHeight;
      if (updates.letterSpacing !== undefined) next.bodyLetterSpacing = updates.letterSpacing;
      return next;
    });
  }, []);

  const handleSave = () => {
    onSave(draft);
    if (applyAll) onApplyTextToAll(draft);
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
