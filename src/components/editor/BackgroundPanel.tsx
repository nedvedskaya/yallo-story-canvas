import { useState, useRef, useCallback, useEffect } from "react";
import { resizeImage } from "@/lib/image-utils";
import { Slider } from "@/components/ui/slider";
import { Upload, Volume2, VolumeX, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import MediaControls from "./MediaControls";
import { labelStyle, valStyle } from "./shared-styles";
import GlassTabBar from "./GlassTabBar";
import ApplyToAllButton from "./ApplyToAllButton";
import { rgbaToHex } from "@/lib/utils";
import type { Sticker } from "./StickerLayer";
import { DecorShape, HalftoneDots } from "./TemplatesPanel";
import type { Slide } from "./SlideCarousel";

/** Поля слайда, которые копируются при "применить фон ко всем слайдам".
 *  Единый источник истины — этот массив. Если в BackgroundPanel появляется
 *  новый контрол, влияющий на визуал фона для ВСЕХ слайдов, — добавляй сюда. */
export const BG_APPLY_KEYS: readonly (keyof Slide)[] = [
  "bgColor",
  "overlayType",
  "overlayOpacity",
  "overlayColor",
] as const;

export type OverlayType = "none" | "dots" | "lines" | "grid" | "cells" | "blobs" | "gradient";
type BgTab = "color" | "photo" | "video";

const overlayOptions: { id: OverlayType; label: string }[] = [
  { id: "none", label: "Без элементов" },
  { id: "dots", label: "Точки" },
  { id: "lines", label: "Линии" },
  { id: "grid", label: "Сетка" },
  { id: "cells", label: "Ячейки" },
  { id: "blobs", label: "Блики" },
  { id: "gradient", label: "Градиент" },
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
  stickers?: Sticker[];
  onAddSticker?: (src: string, width: number, height: number) => void;
  onDeleteSticker?: (id: string) => void;
  /** Шаблонный декор (Minimalism cover — halftone-звезда). Управляется здесь:
   *  show/hide через переключатель в разделе «Декоративные элементы». */
  decorShape?: 'asterisk' | 'none';
  decorColor?: string;
  onDecorChange?: (shape: 'asterisk' | 'none') => void;
  /** Декор-точки (halftone-арка Minimalism Layout 3). Отдельный переключатель
   *  в том же разделе «Декоративные элементы». */
  decorDots?: 'halftone' | 'none';
  onDecorDotsChange?: (dots: 'halftone' | 'none') => void;
}

const BackgroundPanel = ({
  bgColor, overlayType, overlayOpacity, overlayColor,
  bgImage, bgVideo, bgScale, bgPosX, bgPosY, bgDarken, bgMuted,
  onSave, onApplyToAll,
  stickers = [], onAddSticker, onDeleteSticker,
  decorShape, decorColor, onDecorChange,
  decorDots, onDecorDotsChange,
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
  const stickerInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (bgImage && bgImage.startsWith('blob:')) URL.revokeObjectURL(bgImage);
      if (bgVideo && bgVideo.startsWith('blob:')) URL.revokeObjectURL(bgVideo);
      const url = await resizeImage(file, 1920);
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

  const handleStickerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddSticker) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxBase = 80;
      const ratio = Math.min(maxBase / img.width, maxBase / img.height, 1);
      onAddSticker(url, img.width * ratio, img.height * ratio);
    };
    img.src = url;
    if (stickerInputRef.current) stickerInputRef.current.value = "";
  };

  const addStickerFromBlob = useCallback((blob: Blob) => {
    if (!onAddSticker) return;
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const maxBase = 80;
      const ratio = Math.min(maxBase / img.width, maxBase / img.height, 1);
      onAddSticker(url, img.width * ratio, img.height * ratio);
    };
    img.src = url;
  }, [onAddSticker]);

  const pasteHelperRef = useRef<HTMLTextAreaElement>(null);

  const handleStickerPaste = useCallback(async () => {
    if (!onAddSticker) return;
    // Try modern Clipboard API first (works on Chrome desktop with permission)
    if (navigator.clipboard && (navigator.clipboard as any).read) {
      try {
        const items = await (navigator.clipboard as any).read();
        for (const item of items) {
          const imageType = item.types.find((t: string) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            addStickerFromBlob(blob);
            toast.success("Элемент вставлен");
            return;
          }
        }
      } catch {
        // permission denied or unsupported — fall through
      }
    }
    // Fallback: focus a hidden textarea so the next Ctrl+V/Cmd+V triggers paste
    if (pasteHelperRef.current) {
      pasteHelperRef.current.focus();
      pasteHelperRef.current.select();
    }
    toast.message("Нажмите Ctrl+V (⌘+V) чтобы вставить картинку");
  }, [onAddSticker, addStickerFromBlob]);

  // Global paste listener — captures Ctrl+V even when Clipboard API is blocked.
  // Also handles text/html with embedded <img src="data:..."> (rich-text paste).
  useEffect(() => {
    if (!onAddSticker) return;
    const onPaste = (e: ClipboardEvent) => {
      const dt = e.clipboardData;
      if (!dt) return;
      // 1. Direct file/image items
      const items = dt.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.kind === "file" && it.type.startsWith("image/")) {
            const blob = it.getAsFile();
            if (blob) {
              e.preventDefault();
              addStickerFromBlob(blob);
              toast.success("Элемент вставлен");
              return;
            }
          }
        }
      }
      // 2. text/html with embedded image (e.g. copied from web)
      const html = dt.getData("text/html");
      if (html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) {
          const src = match[1];
          if (src.startsWith("data:image/") || src.startsWith("http")) {
            e.preventDefault();
            fetch(src)
              .then(r => r.blob())
              .then(blob => {
                addStickerFromBlob(blob);
                toast.success("Элемент вставлен");
              })
              .catch(() => toast.error("Не удалось загрузить изображение"));
            return;
          }
        }
      }
      // 3. plain text URL pointing to image
      const text = dt.getData("text/plain");
      if (text && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)/i.test(text.trim())) {
        e.preventDefault();
        fetch(text.trim())
          .then(r => r.blob())
          .then(blob => {
            addStickerFromBlob(blob);
            toast.success("Элемент вставлен");
          })
          .catch(() => toast.error("Не удалось загрузить изображение"));
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [onAddSticker, addStickerFromBlob]);

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

      {/* Decorative elements (stickers + template decor) */}
      {(onAddSticker || onDecorChange) && (
        <div>
          <p className="text-[11px] font-medium mb-1.5" style={labelStyle}>Декоративные элементы</p>

          {/* Шаблонный декор (цветок-астериск Minimalism). Показываем только если
              шаблон его поддерживает (onDecorChange передан). Мини-превью + переключатель.
              Клик по превью — скрыть; кнопка «Добавить» — показать снова. */}
          {onDecorChange && (
            <div className="flex items-center gap-2 mb-2">
              {decorShape === 'asterisk' ? (
                <>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(26,26,46,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: 4,
                    }}
                  >
                    <DecorShape color={decorColor || '#D6E8F7'} />
                  </div>
                  <button
                    onClick={() => onDecorChange('none')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium active:scale-95"
                    style={{ background: 'rgba(220,40,40,0.1)', color: '#c02626' }}
                  >
                    <Trash2 size={12} />
                    Удалить цветок
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onDecorChange('asterisk')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium active:scale-95"
                  style={{ background: 'rgba(26,26,46,0.06)', color: '#1a1a2e' }}
                >
                  <Plus size={14} />
                  Добавить цветок
                </button>
              )}
            </div>
          )}

          {/* Halftone-точки — отдельный декор Minimalism Layout 3. Тот же UX,
              что у цветка: мини-превью + кнопка «Удалить/Добавить». Рендер —
              в SlideFrame через slide.decorDots. */}
          {onDecorDotsChange && (
            <div className="flex items-center gap-2 mb-2">
              {decorDots === 'halftone' ? (
                <>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(26,26,46,0.04)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      overflow: 'hidden',
                      padding: 2,
                    }}
                  >
                    <div style={{ width: '100%', height: '100%' }}>
                      <HalftoneDots color={decorColor || '#D6E8F7'} />
                    </div>
                  </div>
                  <button
                    onClick={() => onDecorDotsChange('none')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium active:scale-95"
                    style={{ background: 'rgba(220,40,40,0.1)', color: '#c02626' }}
                  >
                    <Trash2 size={12} />
                    Удалить точки
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onDecorDotsChange('halftone')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium active:scale-95"
                  style={{ background: 'rgba(26,26,46,0.06)', color: '#1a1a2e' }}
                >
                  <Plus size={14} />
                  Добавить точки
                </button>
              )}
            </div>
          )}

          {onAddSticker && (<>
          <div className="flex gap-2">
            <button
              onClick={() => stickerInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium active:scale-95"
              style={{ background: 'rgba(26,26,46,0.06)', color: '#1a1a2e' }}
            >
              <Plus size={14} />
              Загрузить
            </button>
            <button
              onClick={handleStickerPaste}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium active:scale-95"
              style={{ background: 'rgba(26,26,46,0.06)', color: '#1a1a2e' }}
            >
              Вставить
            </button>
            <input ref={stickerInputRef} type="file" accept="image/*" className="hidden" onChange={handleStickerFile} />
            <textarea
              ref={pasteHelperRef}
              aria-hidden="true"
              tabIndex={-1}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, left: -9999, top: -9999 }}
            />
          </div>

          {stickers.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {stickers.map((s) => (
                <div key={s.id} className="relative group">
                  <img
                    src={s.src}
                    alt=""
                    className="rounded-lg object-contain"
                    style={{ width: 56, height: 56, background: 'rgba(0,0,0,0.04)' }}
                  />
                  <button
                    onClick={() => onDeleteSticker?.(s.id)}
                    className="absolute -top-1 -right-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(220,40,40,0.85)', color: '#fff' }}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] mt-1" style={{ color: 'rgba(26,26,46,0.4)' }}>
            Двойной клик по элементу на слайде — удалить
          </p>
          </>)}
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;
