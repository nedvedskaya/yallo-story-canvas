import { useState, useRef, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";

export type OverlayType = "none" | "dots" | "lines" | "grid" | "cells" | "blobs" | "noise";
type BgTab = "color" | "photo" | "video";


const overlayOptions: { id: OverlayType; label: string }[] = [
  { id: "none", label: "Без элементов" },
  { id: "dots", label: "Точки" },
  { id: "lines", label: "Линии" },
  { id: "grid", label: "Сетка" },
  { id: "cells", label: "Ячейки" },
  { id: "blobs", label: "Блики" },
  { id: "noise", label: "Шум" },
];

interface BackgroundPanelProps {
  bgColor: string;
  overlayType: OverlayType;
  overlayOpacity: number;
  onBgColorChange: (color: string) => void;
  onOverlayTypeChange: (type: OverlayType) => void;
  onOverlayOpacityChange: (opacity: number) => void;
  onApplyToAll: () => void;
  onClose?: () => void;
}

const BackgroundPanel = ({
  bgColor,
  overlayType,
  overlayOpacity,
  onBgColorChange,
  onOverlayTypeChange,
  onOverlayOpacityChange,
  onApplyToAll,
}: BackgroundPanelProps) => {
  const [bgTab, setBgTab] = useState<BgTab>("color");
  const [applyToAll, setApplyToAll] = useState(false);
  const [hexInput, setHexInput] = useState(bgColor.startsWith("#") ? bgColor : "#667eea");
  const colorRef = useRef<HTMLInputElement>(null);

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setHexInput(color);
    onBgColorChange(color);
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onBgColorChange(val);
    }
  };

  const handleApplyToggle = (checked: boolean) => {
    setApplyToAll(checked);
    if (checked) onApplyToAll();
  };

  const tabItems: { id: BgTab; label: string }[] = [
    { id: "color", label: "Цвет" },
    { id: "photo", label: "Фото" },
    { id: "video", label: "Видео" },
  ];

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[28vh] scrollbar-hide">
      {/* Section 1: Bg type tabs */}
      <div>
        <div className="flex gap-1 mb-2">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setBgTab(t.id)}
              className="flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all"
              style={{
                background: bgTab === t.id ? "rgba(255,255,255,0.7)" : "transparent",
                color: bgTab === t.id ? "#1a1a2e" : "rgba(26,26,46,0.45)",
                boxShadow: bgTab === t.id ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {bgTab === "color" && null}

        {bgTab === "photo" && (
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
          >
            <Upload size={14} />
            Загрузить фото
          </button>
        )}

        {bgTab === "video" && (
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
          >
            <Upload size={14} />
            Загрузить видео (до 1 мин)
          </button>
        )}
      </div>

      {/* Section 2: Accent color */}
      <div>
        <p className="text-[11px] font-medium mb-1.5" style={{ color: "rgba(26,26,46,0.5)" }}>
          Акцентный цвет
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => colorRef.current?.click()}
            className="w-7 h-7 rounded-full flex-shrink-0 transition-all active:scale-90"
            style={{
              background: hexInput,
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <input
            ref={colorRef}
            type="color"
            value={hexInput}
            onChange={handleColorPickerChange}
            className="sr-only"
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            maxLength={7}
            className="w-20 rounded-lg px-2 py-1 text-xs font-mono outline-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,200,220,0.5)",
              color: "#1a1a2e",
            }}
          />
        </div>
      </div>

      {/* Section 3: Elements */}
      <div>
        <p className="text-[11px] font-medium mb-1.5" style={{ color: "rgba(26,26,46,0.5)" }}>
          Элементы
        </p>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {overlayOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onOverlayTypeChange(opt.id)}
              className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all active:scale-95"
              style={{
                background: overlayType === opt.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                color: overlayType === opt.id ? "#1a1a2e" : "rgba(26,26,46,0.5)",
                border: overlayType === opt.id ? "1px solid rgba(200,200,220,0.6)" : "1px solid transparent",
                boxShadow: overlayType === opt.id ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Opacity slider */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(26,26,46,0.45)" }}>
            Прозрачность
          </span>
          <Slider
            value={[overlayOpacity]}
            onValueChange={([v]) => onOverlayOpacityChange(v)}
            max={100}
            min={0}
            step={1}
            className="flex-1"
          />
          <span className="text-[10px] w-6 text-right" style={{ color: "rgba(26,26,46,0.6)" }}>
            {overlayOpacity}
          </span>
        </div>

        {/* Apply to all */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "rgba(26,26,46,0.6)" }}>
            Применить ко всем слайдам
          </span>
          <Switch checked={applyToAll} onCheckedChange={handleApplyToggle} />
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;
