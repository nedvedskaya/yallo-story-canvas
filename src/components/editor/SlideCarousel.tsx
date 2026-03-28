import { useRef, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SlideToolbar, { type HAlign, type VAlign, type BgType } from "./SlideToolbar";
import SlideOverlay from "./SlideOverlay";
import type { OverlayType } from "./BackgroundPanel";

export interface Slide {
  id: number;
  username: string;
  title: string;
  body: string;
  bgColor: string;
  bgType: BgType;
  hAlign: HAlign;
  vAlign: VAlign;
  overlayType: OverlayType;
  overlayOpacity: number;
  bgImage?: string;
  bgScale: number;
  bgPosX: number;
  bgPosY: number;
}

const hAlignToText: Record<HAlign, string> = { left: "left", center: "center", right: "right" };
const vAlignToJustify: Record<VAlign, string> = { start: "flex-start", center: "center", end: "flex-end" };

const glassBtnStyle: React.CSSProperties = {
  width: 36, height: 36, color: "#4a4a6a",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const addBtnStyle: React.CSSProperties = { ...glassBtnStyle, width: 32, height: 32, flexShrink: 0 };

interface SlideCarouselProps {
  slides: Slide[];
  activeSlide: number;
  onSlideChange: (index: number) => void;
  isSheetOpen?: boolean;
  onUpdateSlide: (id: number, updates: Partial<Slide>) => void;
  onAddSlide: (atIndex: number) => void;
  onMoveSlide: (fromIdx: number, dir: -1 | 1) => void;
  onDuplicateSlide: (idx: number) => void;
  onDeleteSlide: (idx: number) => void;
}

const SlideCarousel = ({
  slides, activeSlide, onSlideChange, isSheetOpen = false,
  onUpdateSlide, onAddSlide, onMoveSlide, onDuplicateSlide, onDeleteSlide,
}: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[activeSlide];

  const scrollToIndex = (index: number) => {
    setTimeout(() => {
      if (scrollRef.current) {
        const child = scrollRef.current.children[index] as HTMLElement;
        child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }, 50);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const slideWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth : 0;
    if (slideWidth === 0) return;
    const index = Math.round(container.scrollLeft / slideWidth);
    if (index !== activeSlide && index < slides.length) onSlideChange(index);
  };

  const handleAdd = useCallback((idx: number) => {
    onAddSlide(idx);
    scrollToIndex(idx);
  }, [onAddSlide]);

  const handleMove = useCallback((fromIdx: number, dir: -1 | 1) => {
    onMoveSlide(fromIdx, dir);
    scrollToIndex(Math.max(0, Math.min(fromIdx + dir, slides.length - 1)));
  }, [onMoveSlide, slides.length]);

  const handleDuplicate = useCallback((idx: number) => {
    onDuplicateSlide(idx);
    scrollToIndex(idx + 1);
  }, [onDuplicateSlide]);

  const handleDelete = useCallback((idx: number) => {
    onDeleteSlide(idx);
    scrollToIndex(Math.min(idx, slides.length - 2));
  }, [onDeleteSlide, slides.length]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-0 py-2 min-h-0">
      {currentSlide && !isSheetOpen && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <button onClick={() => handleMove(activeSlide, -1)} className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-30" style={glassBtnStyle} disabled={activeSlide === 0}><ChevronLeft size={15} /></button>
          <button onClick={() => handleMove(activeSlide, 1)} className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-30" style={glassBtnStyle} disabled={activeSlide === slides.length - 1}><ChevronRight size={15} /></button>
          <button onClick={() => handleDuplicate(activeSlide)} className="flex items-center justify-center transition-all active:scale-90" style={glassBtnStyle}><Copy size={14} /></button>
          <button onClick={() => handleDelete(activeSlide)} className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-30" style={glassBtnStyle} disabled={slides.length <= 1}><Trash2 size={14} /></button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full items-center gap-3 overflow-x-auto px-8 snap-x-mandatory scrollbar-hide transition-all duration-300"
        style={{
          scrollBehavior: "smooth",
          transform: isSheetOpen ? 'scale(0.55) translateY(-45%)' : 'scale(1) translateY(0)',
          transformOrigin: 'center center',
        }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="flex items-center gap-3 flex-shrink-0">
            <div
              className={cn(
                "flex-shrink-0 snap-center transition-all duration-300 overflow-hidden",
                index === activeSlide ? "scale-100" : "scale-[0.92] opacity-60"
              )}
              style={{ width: "min(78vw, 320px)", aspectRatio: "1080/1440" }}
            >
              <div
                className="h-full w-full p-[5px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1.5px solid rgba(200, 200, 220, 0.5)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  className="relative flex h-full flex-col p-6 overflow-hidden"
                  style={{
                    background: slide.bgImage ? undefined : slide.bgColor,
                    borderRadius: '16px',
                    justifyContent: vAlignToJustify[slide.vAlign],
                    textAlign: hAlignToText[slide.hAlign] as React.CSSProperties['textAlign'],
                  }}
                >
                  {slide.bgImage && (
                    <div className="absolute inset-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                      <img
                        src={slide.bgImage}
                        alt=""
                        className="absolute"
                        style={{
                          width: slide.bgScale === 100 ? '100%' : `${slide.bgScale}%`,
                          height: slide.bgScale === 100 ? '100%' : `${slide.bgScale}%`,
                          objectFit: 'contain',
                          left: `${slide.bgPosX}%`,
                          top: `${slide.bgPosY}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    </div>
                  )}
                  <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} />

                  <div
                    className="flex items-center justify-between w-full"
                    style={{
                      position: slide.vAlign !== "start" ? "absolute" : "relative",
                      top: slide.vAlign !== "start" ? "24px" : undefined,
                      left: slide.vAlign !== "start" ? "24px" : undefined,
                      right: slide.vAlign !== "start" ? "24px" : undefined,
                      width: slide.vAlign !== "start" ? "calc(100% - 48px)" : undefined,
                    }}
                  >
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => onUpdateSlide(slide.id, { username: e.currentTarget.textContent || '' })} className="outline-none text-xs font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>{slide.username}</span>
                    <span className="text-xs font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>{index + 1}/{slides.length}</span>
                  </div>

                  <div>
                    <h2 contentEditable suppressContentEditableWarning onBlur={(e) => onUpdateSlide(slide.id, { title: e.currentTarget.textContent || '' })} className="outline-none font-bold leading-tight" style={{ color: '#ffffff', fontSize: '28px', marginTop: slide.vAlign === "start" ? "32px" : "0" }}>{slide.title}</h2>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => onUpdateSlide(slide.id, { body: e.currentTarget.textContent || '' })} className="outline-none mt-3 font-normal" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px', lineHeight: 1.5 }}>{slide.body}</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => handleAdd(index + 1)} className="flex items-center justify-center transition-all active:scale-90 flex-shrink-0" style={addBtnStyle}><Plus size={14} /></button>
          </div>
        ))}
      </div>

      {currentSlide && !isSheetOpen && (
        <SlideToolbar
          hAlign={currentSlide.hAlign}
          vAlign={currentSlide.vAlign}
          bgType={currentSlide.bgType}
          onHAlignChange={(v) => onUpdateSlide(currentSlide.id, { hAlign: v })}
          onVAlignChange={(v) => onUpdateSlide(currentSlide.id, { vAlign: v })}
          onBgClick={() => {}}
          onCropClick={() => {}}
        />
      )}
    </div>
  );
};

export default SlideCarousel;
