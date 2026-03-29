import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { Slide } from "./SlideCarousel";
import { labelStyle } from "./shared-styles";

interface InfoPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onApplyInfoToAll: () => void;
}

const InfoPanel = ({ currentSlide, onSave, onApplyInfoToAll }: InfoPanelProps) => {
  const [applyAll, setApplyAll] = useState(false);

  const showUsername = currentSlide.showUsername !== false;
  const showSlideCount = currentSlide.showSlideCount !== false;
  const showArrow = currentSlide.showArrow !== false;
  const showFooter = currentSlide.showFooter ?? false;
  const footerText = currentSlide.footerText ?? "";
  const username = currentSlide.username ?? "@username";

  


  return (
    <div className="flex flex-col gap-3">
      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium" style={labelStyle}>Имя пользователя</span>
          <Switch checked={showUsername} onCheckedChange={(v) => onSave({ showUsername: v })} />
        </div>
        {showUsername && (
          <input
            type="text"
            value={username}
            onChange={(e) => onSave({ username: e.target.value })}
            className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
            placeholder="@username"
          />
        )}
      </div>

      <div className="h-px" style={{ background: "rgba(26,26,46,0.06)" }} />

      {/* Slide count */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={labelStyle}>Нумерация слайдов</span>
        <Switch checked={showSlideCount} onCheckedChange={(v) => onSave({ showSlideCount: v })} />
      </div>

      <div className="h-px" style={{ background: "rgba(26,26,46,0.06)" }} />

      {/* Swipe arrow */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={labelStyle}>Стрелка «листать»</span>
        <Switch checked={showArrow} onCheckedChange={(v) => onSave({ showArrow: v })} />
      </div>

      <div className="h-px" style={{ background: "rgba(26,26,46,0.06)" }} />

      {/* Footer */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium" style={labelStyle}>Подвал</span>
          <Switch checked={showFooter} onCheckedChange={(v) => onSave({ showFooter: v })} />
        </div>
        {showFooter && (
          <input
            type="text"
            value={footerText}
            onChange={(e) => onSave({ footerText: e.target.value })}
            className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
            placeholder="Текст подвала"
          />
        )}
      </div>

      <div className="h-px" style={{ background: "rgba(26,26,46,0.06)" }} />

      {/* Apply to all */}
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={labelStyle}>Применить ко всем слайдам</span>
        <Switch checked={applyAll} onCheckedChange={(v) => { setApplyAll(v); if (v) onApplyInfoToAll(); }} />
      </div>
    </div>
  );
};

export default InfoPanel;
