import { useRef, useCallback, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SlideToolbar, { type HAlign, type VAlign, type BgType } from "./SlideToolbar";
import SlideOverlay from "./SlideOverlay";
import type { OverlayType } from "./BackgroundPanel";
import TextEditorModal from "./TextEditorModal";
import { FORMAT_OPTIONS, type SlideFormat } from "./SizePanel";

// Adaptive text sizes per format (used as defaults when slide doesn't override)
const FORMAT_TEXT_DEFAULTS: Record<SlideFormat, { titleSize: number; bodySize: number; padding: number; usernameSize: number; footerSize: number }> = {
  carousel:     { titleSize: 22, bodySize: 13, padding: 20, usernameSize: 11, footerSize: 9 },
  square:       { titleSize: 20, bodySize: 12, padding: 18, usernameSize: 11, footerSize: 9 },
  stories:      { titleSize: 26, bodySize: 15, padding: 24, usernameSize: 12, footerSize: 10 },
  presentation: { titleSize: 18, bodySize: 11, padding: 16, usernameSize: 10, footerSize: 8 },
};

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
  bgVideo?: string;
  bgScale: number;
  bgPosX: number;
  bgPosY: number;
  bgDarken: number;
  bgMuted?: boolean;
  titleFont?: string;
  titleSize?: number;
  titleCase?: string;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  bodyFont?: string;
  bodySize?: number;
  bodyCase?: string;
  bodyLineHeight?: number;
  bodyLetterSpacing?: number;
  showUsername?: boolean;
  showSlideCount?: boolean;
  showArrow?: boolean;
  showFooter?: boolean;
  footerText?: string;
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
  slideFormat?: SlideFormat;
  onUpdateSlide: (id: number, updates: Partial<Slide>) => void;
  onAddSlide: (atIndex: number) => void;
  onMoveSlide: (fromIdx: number, dir: -1 | 1) => void;
  onDuplicateSlide: (idx: number) => void;
  onDeleteSlide: (idx: number) => void;
}

const SlideCarousel = ({
  slides, activeSlide, onSlideChange, isSheetOpen = false, slideFormat = "carousel",
  onUpdateSlide, onAddSlide, onMoveSlide, onDuplicateSlide, onDeleteSlide,
}: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[activeSlide];
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorField, setEditorField] = useState<"title" | "body">("title");

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];
  const slideAspectRatio = `${formatInfo.width}/${formatInfo.height}`;
  const isLandscape = formatInfo.width > formatInfo.height;
  const fmt = FORMAT_TEXT_DEFAULTS[slideFormat] || FORMAT_TEXT_DEFAULTS.carousel;

  const openEditor = (field: "title" | "body") => {
    setEditorField(field);
    setEditorOpen(true);
  };

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
              style={{
                width: isLandscape
                  ? "min(90vw, 420px)"
                  : formatInfo.id === "stories"
                    ? "min(52vw, 240px)"
                    : formatInfo.id === "square"
                      ? "min(72vw, 300px)"
                      : "min(78vw, 320px)",
                aspectRatio: slideAspectRatio,
                maxHeight: "calc(100vh - 220px)",
              }}
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
                  data-slide-id={slide.id}
                  className="relative flex h-full flex-col p-6 overflow-hidden"
                  style={{
                    background: slide.bgColor,
                    borderRadius: '16px',
                    justifyContent: vAlignToJustify[slide.vAlign],
                    textAlign: hAlignToText[slide.hAlign] as React.CSSProperties['textAlign'],
                  }}
                >
                  {/* Overlay pattern - on bg color only, behind image/video */}
                  <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} />
                  {/* Background image layer */}
                  {slide.bgImage && (
                    <div className="absolute inset-0 z-[2]" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                      <img
                        src={slide.bgImage}
                        alt=""
                        style={{
                          position: 'absolute',
                          left: `${slide.bgPosX}%`,
                          top: `${slide.bgPosY}%`,
                          transform: `translate(-50%, -50%) scale(${slide.bgScale / 100})`,
                          transformOrigin: 'center center',
                          minWidth: '100%',
                          minHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                      {slide.bgDarken > 0 && (
                        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})` }} />
                      )}
                    </div>
                  )}
                  {/* Background video layer */}
                  {slide.bgVideo && (
                    <div className="absolute inset-0 z-[2]" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                      <video
                        src={slide.bgVideo}
                        autoPlay
                        loop
                        muted={slide.bgMuted !== false || index !== activeSlide}
                        playsInline
                        style={{
                          position: 'absolute',
                          left: `${slide.bgPosX}%`,
                          top: `${slide.bgPosY}%`,
                          transform: `translate(-50%, -50%) scale(${slide.bgScale / 100})`,
                          transformOrigin: 'center center',
                          minWidth: '100%',
                          minHeight: '100%',
                          objectFit: 'cover',
                        }}
                        ref={(el) => {
                          if (el) {
                            if (index === activeSlide) {
                              el.play().catch(() => {});
                            } else {
                              el.pause();
                            }
                          }
                        }}
                      />
                      {slide.bgDarken > 0 && (
                        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})` }} />
                      )}
                    </div>
                  )}
                  {/* Content layer */}
                  <div className="relative z-10 flex flex-col h-full w-full" style={{ justifyContent: vAlignToJustify[slide.vAlign] }}>

                    {/* Top bar: username + slide count */}
                    {(slide.showUsername !== false || slide.showSlideCount !== false) && (
                    <div
                      className="flex items-center justify-between w-full"
                      style={{
                        position: slide.vAlign !== "start" ? "absolute" : "relative",
                        top: slide.vAlign !== "start" ? 0 : undefined,
                        left: slide.vAlign !== "start" ? 0 : undefined,
                        right: slide.vAlign !== "start" ? 0 : undefined,
                        width: slide.vAlign !== "start" ? "100%" : undefined,
                      }}
                    >
                      {slide.showUsername !== false ? (
                        <span className="outline-none text-xs font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>{slide.username}</span>
                      ) : <span />}
                      {slide.showSlideCount !== false ? (
                        <span className="text-xs font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>{index + 1}/{slides.length}</span>
                      ) : <span />}
                    </div>
                    )}

                    <div>
                    <h2
                      onClick={() => openEditor("title")}
                      className="outline-none font-bold cursor-pointer"
                      style={{
                        color: '#ffffff',
                        fontSize: `${slide.titleSize ?? 24}px`,
                        fontFamily: slide.titleFont || "'Inter', sans-serif",
                        textTransform: (slide.titleCase === 'uppercase' ? 'uppercase' : slide.titleCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
                        lineHeight: slide.titleLineHeight ?? 1.1,
                        letterSpacing: `${slide.titleLetterSpacing ?? 0}px`,
                        marginTop: slide.vAlign === "start" ? "32px" : "0",
                      }}
                      dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                      <p
                        onClick={() => openEditor("body")}
                        className="outline-none mt-3 font-normal cursor-pointer"
                        style={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: `${slide.bodySize ?? 14}px`,
                          fontFamily: slide.bodyFont || "'Inter', sans-serif",
                          textTransform: (slide.bodyCase === 'uppercase' ? 'uppercase' : slide.bodyCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
                          lineHeight: slide.bodyLineHeight ?? 1.5,
                          letterSpacing: `${slide.bodyLetterSpacing ?? 0}px`,
                        }}
                        dangerouslySetInnerHTML={{ __html: slide.body }}
                      />
                    </div>

                    {/* Bottom: footer + swipe arrow */}
                    {(slide.showFooter || slide.showArrow !== false) && (
                      <div
                        className="flex items-end justify-between w-full"
                        style={{
                          position: slide.vAlign !== "end" ? "absolute" : "relative",
                          bottom: slide.vAlign !== "end" ? 0 : undefined,
                          left: slide.vAlign !== "end" ? 0 : undefined,
                          right: slide.vAlign !== "end" ? 0 : undefined,
                          width: slide.vAlign !== "end" ? "100%" : undefined,
                          marginTop: slide.vAlign === "end" ? "auto" : undefined,
                        }}
                      >
                        {slide.showFooter ? (
                          <span className="text-[10px] font-normal" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {slide.footerText || ""}
                          </span>
                        ) : <span />}
                        {slide.showArrow !== false && index < slides.length - 1 ? (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>→</span>
                        ) : <span />}
                      </div>
                    )}
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
      {currentSlide && (
        <TextEditorModal
          open={editorOpen}
          field={editorField}
          initialHtml={editorField === "title" ? currentSlide.title : currentSlide.body}
          onSave={(html) => {
            onUpdateSlide(currentSlide.id, { [editorField]: html });
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default SlideCarousel;
