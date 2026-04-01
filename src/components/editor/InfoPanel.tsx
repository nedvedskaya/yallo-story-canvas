import type { Slide } from "./SlideCarousel";
import type { Slide } from "./SlideCarousel";
import { labelStyle } from "./shared-styles";

interface InfoPanelProps {
  currentSlide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onApplyInfoToAll: () => void;
}

const InfoPanel = ({ currentSlide, onSave, onApplyInfoToAll }: InfoPanelProps) => {
  

  const showUsername = currentSlide.showUsername !== false;
  const showSlideCount = currentSlide.showSlideCount !== false;
  const showArrow = currentSlide.showArrow !== false;
  const showFooter = currentSlide.showFooter ?? false;
  const footerText = currentSlide.footerText ?? "";
  const username = currentSlide.username ?? "@username";

  const rowStyle = "flex items-center justify-between py-0.5";
  const lblStyle = { ...labelStyle, fontSize: "10px" };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Username */}
      <div className="flex flex-col gap-1">
        <div className={rowStyle}>
          <span className="font-medium" style={lblStyle}>Имя пользователя</span>
          <Switch checked={showUsername} onCheckedChange={(v) => onSave({ showUsername: v })} />
        </div>
        {showUsername && (
          <input
            type="text"
            value={username}
            onChange={(e) => onSave({ username: e.target.value })}
            className="w-full rounded-lg px-3 py-1 text-[11px] outline-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
            placeholder="@username"
          />
        )}
      </div>

      <div className={rowStyle}>
        <span className="font-medium" style={lblStyle}>Нумерация слайдов</span>
        <Switch checked={showSlideCount} onCheckedChange={(v) => onSave({ showSlideCount: v })} />
      </div>

      <div className={rowStyle}>
        <span className="font-medium" style={lblStyle}>Стрелка «листать»</span>
        <Switch checked={showArrow} onCheckedChange={(v) => onSave({ showArrow: v })} />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1">
        <div className={rowStyle}>
          <span className="font-medium" style={lblStyle}>Подвал</span>
          <Switch checked={showFooter} onCheckedChange={(v) => onSave({ showFooter: v })} />
        </div>
        {showFooter && (
          <input
            type="text"
            value={footerText}
            onChange={(e) => onSave({ footerText: e.target.value })}
            className="w-full rounded-lg px-3 py-1 text-[11px] outline-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
            placeholder="Текст подвала"
          />
        )}
      </div>

      <div className="flex items-center justify-end py-0.5">
        <button
          onClick={onApplyInfoToAll}
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

export default InfoPanel;
