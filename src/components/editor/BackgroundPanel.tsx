import { useState, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Upload, Volume2, VolumeX } from "lucide-react";
import MediaControls from "./MediaControls";
import { labelStyle, valStyle } from "./shared-styles";
import GlassTabBar from "./GlassTabBar";
import ApplyToAllButton from "./ApplyToAllButton";
import { rgbaToHex } from "@/lib/utils";

export type OverlayType = "none" | "dots" | "lines" | "grid" | "cells" | "blobs";
type BgTab = "color" | "photo" | "video";

const overlayOptions: { id: OverlayType; label: string }[] = [
  { id: "none", label: "Без элементов" },
  { id: "dots", label: "Точки" },
  { id: "lines", label: "Линии" },
  { id: "grid", label: "Сетка" },
  { id: "cells", label: "Ячейки" },
  { id: "blobs", label: "Блики" },
];

export interface BgDraft {
  bgColor: string;
  overlayType: OverlayType;
  overlayOpacity: number;
  overlayColor?: string;
  bgImage?: string;
  bgVideo?: string;
  bgScale: number;
  bgPosX: number;
  bgPosY: number;
  bgDarken: number;
  bgMuted?: boolean;
  bgVideoFile?: File;
}

interface BackgroundPanelProps {
  bgColor: string;
  overlayType: OverlayType;
  overlayOpacity: number;
  overlayColor?: string;
  bgImage?: string;
  bgVideo?: string;
  bgScale: number;
  bgPosX: number;
  bgPosY: number;
  bgDarken: number;
  bgMuted?: boolean;
  onSave: (draft: Partial<BgDraft>) => void;
  onApplyToAll: () => void;
}

const BackgroundPanel = ({
  bgColor, overlayType, overlayOpacity, overlayColor,
  bgImage, bgVideo, bgScale, bgPosX, bgPosY, bgDarken, bgMuted,
  onSave, onApplyToAll,
}: BackgroundPanelProps) => {
  const [bgTab, setBgTab] = useState<BgTab>(bgVideo ? "video" : bgImage ? "photo" : "color");
  const [hexInput, setHexInput] = useState(bgColor.startsWith("#") ? bgColor : "#667eea");

  const overlayColorHex = (() => {
    const c = overlayColor || "rgba(255,255,255,1)";
    if (c.startsWith("#")) return c.slice(0, 7);
    return rgbaToHex(c);
  })();
  const colorRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const update = useCallback((partial: Partial<BgDraft>) => {
    onSave(partial);
  }, [onSave]);

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setHexInput(color);
    update({ bgColor: color });
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) update({ bgColor: val });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (bgImage && bgImage.startsWith('blob:')) URL.revokeObjectURL(bgImage);
      if (bgVideo && bgVideo.startsWith('blob:')) URL.revokeObjectURL(bgVideo);
      const url = URL.createObjectURL(file);
      update({ bgVideo: undefined, bgImage: url, bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0 });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (bgImage && bgImage.startsWith('blob:')) URL.revokeObjectURL(bgImage);
      if (bgVideo && bgVideo.startsWith('blob:')) URL.revokeObjectURL(bgVideo);
      const url = URL.createObjectURL(file);
      update({ bgImage: undefined, bgVideo: url, bgVideoFile: file, bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0, bgMuted: false });
    }
  };

  const tabItems = [
    { id: "color", label: "Цвет" },
    { id: "photo", label: "Фото" },
    { id: "video", label: "Видео" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-2">
          <GlassTabBar tabs={tabItems} activeId={bgTab} onChange={(id) => setBgTab(id as BgTab)} />
        </div>

        {bgTab === "photo" && (
          <>
            <input ref={photoRef} type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
            <button onClick={() => photoRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)", color: "#1a1a2e" }}
            >
              <Upload size={14} /> {bgImage ? "Заменить фото" : "Загрузить фото"}
            </button>

            {bgImage && (
              <>
                <MediaControls scale={bgScale} posX={bgPosX} posY={bgPosY} darken={bgDarken} onChange={update} />
                <button onClick={() => update({ bgImage: undefined })}
                  className="w-full rounded-xl py-1.5 text-[10px] font-medium active:scale-[0.98] mt-2"
                  style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,200,220,0.4)", color: "rgba(26,26,46,0.5)" }}
                >Удалить фото</button>
              </>
            )}
          </>
        )}

        {bgTab === "video" && (
          <>
            <input ref={videoRef} type="file" accept="video/*" className="sr-only" onChange={handleVideoUpload} />
            <button onClick={() => videoRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)", color: "#1a1a2e" }}
            >
              <Upload size={14} /> {bgVideo ? "Заменить видео" : "Загрузить видео (до 1 мин)"}
            </button>

            {bgVideo && (
              <>
                <MediaControls scale={bgScale} posX={bgPosX} posY={bgPosY} darken={bgDarken} onChange={update} />
                <div className="flex items-center gap-2 mt-2">
                  {bgMuted !== false ? <VolumeX size={12} style={labelStyle} /> : <Volume2 size={12} style={labelStyle} />}
                  <span className="text-[10px] flex-shrink-0" style={labelStyle}>Звук</span>
                  <button
                    onClick={() => update({ bgMuted: bgMuted !== false ? false : true })}
                    className="flex-1 rounded-lg py-1 text-[10px] font-medium active:scale-[0.97]"
                    style={{
                      background: bgMuted === false ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                      border: "1px solid rgba(200,200,220,0.5)",
                      color: "#1a1a2e",
                    }}
                  >
                    {bgMuted === false ? "Вкл" : "Выкл"}
                  </button>
                </div>
                <button onClick={() => update({ bgVideo: undefined })}
                  className="w-full rounded-xl py-1.5 text-[10px] font-medium active:scale-[0.98] mt-2"
                  style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,200,220,0.4)", color: "rgba(26,26,46,0.5)" }}
                >Удалить видео</button>
              </>
            )}
          </>
        )}
      </div>

      {bgTab === "color" && (
        <>
          <div>
            <p className="text-[11px] font-medium mb-1.5" style={labelStyle}>Акцентный цвет</p>
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 flex-shrink-0">
                <div className="w-7 h-7 rounded-full" style={{ background: hexInput, border: "2px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                <input ref={colorRef} type="color" value={hexInput} onChange={handleColorPickerChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <input type="text" value={hexInput} onChange={(e) => handleHexInput(e.target.value)} maxLength={7}
                className="w-20 rounded-lg px-2 py-1 text-xs font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)", color: "#1a1a2e" }} />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium mb-1.5" style={labelStyle}>Элементы</p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {overlayOptions.map((opt) => (
                <button key={opt.id} onClick={() => update({ overlayType: opt.id })}
                  className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-medium active:scale-95"
                  style={{
                    background: overlayType === opt.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                    color: overlayType === opt.id ? "#1a1a2e" : "rgba(26,26,46,0.5)",
                    border: overlayType === opt.id ? "1px solid rgba(200,200,220,0.6)" : "1px solid transparent",
                    boxShadow: overlayType === opt.id ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  }}
                >{opt.label}</button>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(26,26,46,0.45)" }}>Прозрачность</span>
              <Slider value={[overlayOpacity]} onValueChange={([v]) => update({ overlayOpacity: v })} max={100} min={0} step={1} className="flex-1" />
              <span className="text-[10px] w-6 text-right" style={valStyle}>{overlayOpacity}</span>
            </div>

            {overlayType !== "none" && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(26,26,46,0.45)" }}>Цвет элементов</span>
                <div className="relative w-6 h-6 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full" style={{ background: overlayColorHex, border: "2px solid rgba(255,255,255,0.8)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }} />
                  <input type="color" value={overlayColorHex} onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1,3),16);
                    const g = parseInt(hex.slice(3,5),16);
                    const b = parseInt(hex.slice(5,7),16);
                    update({ overlayColor: `rgba(${r},${g},${b},1)` });
                  }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            )}

            <div className="mt-2">
              <ApplyToAllButton onClick={onApplyToAll} />
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default BackgroundPanel;
