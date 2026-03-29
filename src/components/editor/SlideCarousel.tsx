import { useRef, useCallback, useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SlideToolbar, { type HAlign, type VAlign, type BgType } from "./SlideToolbar";
import { glassBtnStyle } from "./shared-styles";
import SlideOverlay from "./SlideOverlay";
import type { OverlayType } from "./BackgroundPanel";
import TextEditorModal from "./TextEditorModal";
import { FORMAT_OPTIONS, type SlideFormat } from "./SizePanel";

// Adaptive text sizes per format (used as defaults when slide doesn't override)
const FORMAT_TEXT_DEFAULTS: Record<SlideFormat, { titleSize: number; bodySize: number; padding: number; usernameSize: number; footerSize: number }> = {
  carousel:     { titleSize: 22, bodySize: 13, padding: 20, usernameSize: 11, footerSize: 9 },
  square:       { titleSize: 20, bodySize: 12, padding: 18, usernameSize: 11, footerSize: 9 },
  stories:      { titleSize: 20, bodySize: 12, padding: 24, usernameSize: 12, footerSize: 10 },
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
  titleOffsetX?: number;
  titleOffsetY?: number;
  titleScale?: number;
  bodyOffsetX?: number;
  bodyOffsetY?: number;
  bodyScale?: number;
}

const hAlignToText: Record<HAlign, string> = { left: "left", center: "center", right: "right" };
const vAlignToJustify: Record<VAlign, string> = { start: "flex-start", center: "center", end: "flex-end" };

const getBgMediaStyle = (slide: Slide): React.CSSProperties => ({
  position: 'absolute',
  left: `${slide.bgPosX}%`,
  top: `${slide.bgPosY}%`,
  transform: `translate(-50%, -50%) scale(${slide.bgScale / 100})`,
  transformOrigin: 'center center',
  minWidth: '100%',
  minHeight: '100%',
});


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
  onEditorOpenChange?: (open: boolean) => void;
}

const SlideCarousel = ({
  slides, activeSlide, onSlideChange, isSheetOpen = false, slideFormat = "carousel",
  onUpdateSlide, onAddSlide, onMoveSlide, onDuplicateSlide, onDeleteSlide, onEditorOpenChange,
}: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[activeSlide];
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorField, setEditorField] = useState<"title" | "body">("title");

  // Text drag & pinch state (separate for title and body)
  const textDragTarget = useRef<"title" | "body">("title");
  const touchStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [pinchScale, setPinchScale] = useState<number | null>(null);
  const mouseDragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number; slideId: number; target: "title" | "body" } | null>(null);

  // Media drag & pinch state
  const mediaTouchRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const mediaPinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const [mediaDragOffset, setMediaDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [mediaPinchScale, setMediaPinchScale] = useState<number | null>(null);
  const mediaMouseRef = useRef<{ x: number; y: number; posX: number; posY: number; slideId: number } | null>(null);

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];
  const slideAspectRatio = `${formatInfo.width}/${formatInfo.height}`;
  const isLandscape = formatInfo.width > formatInfo.height;
  const fmt = FORMAT_TEXT_DEFAULTS[slideFormat] || FORMAT_TEXT_DEFAULTS.carousel;

  const openEditor = (field: "title" | "body") => {
    setEditorField(field);
    setEditorOpen(true);
    onEditorOpenChange?.(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    onEditorOpenChange?.(false);
  };

  const getTouchDist = (e: React.TouchEvent) => {
    const [a, b] = [e.touches[0], e.touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  // ── Text touch drag/pinch ──
  const handleTextTouchStart = (e: React.TouchEvent, slide: Slide, target: "title" | "body") => {
    if (editorOpen) return;
    textDragTarget.current = target;
    const oxKey = target === "title" ? "titleOffsetX" : "bodyOffsetX";
    const oyKey = target === "title" ? "titleOffsetY" : "bodyOffsetY";
    const scaleKey = target === "title" ? "titleScale" : "bodyScale";
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, offsetX: slide[oxKey] ?? 0, offsetY: slide[oyKey] ?? 0 };
      pinchStartRef.current = null;
    } else if (e.touches.length === 2) {
      touchStartRef.current = null;
      pinchStartRef.current = { dist: getTouchDist(e), scale: slide[scaleKey] ?? 1 };
    }
  };
  const handleTextTouchMove = (e: React.TouchEvent) => {
    if (editorOpen) return;
    if (e.touches.length === 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setDragOffset({ x: touchStartRef.current.offsetX + dx, y: touchStartRef.current.offsetY + dy });
    } else if (e.touches.length === 2 && pinchStartRef.current) {
      const dist = getTouchDist(e);
      setPinchScale(Math.max(0.3, Math.min(3, pinchStartRef.current.scale * (dist / pinchStartRef.current.dist))));
    }
  };
  const handleTextTouchEnd = (slideId: number) => {
    if (editorOpen) return;
    const t = textDragTarget.current;
    const oxKey = t === "title" ? "titleOffsetX" : "bodyOffsetX";
    const oyKey = t === "title" ? "titleOffsetY" : "bodyOffsetY";
    const scaleKey = t === "title" ? "titleScale" : "bodyScale";
    const updates: Partial<Slide> = {};
    if (dragOffset !== null) { updates[oxKey] = dragOffset.x; updates[oyKey] = dragOffset.y; setDragOffset(null); }
    if (pinchScale !== null) { updates[scaleKey] = pinchScale; setPinchScale(null); }
    if (Object.keys(updates).length > 0) onUpdateSlide(slideId, updates);
    touchStartRef.current = null; pinchStartRef.current = null;
  };

  // ── Text mouse drag (desktop) ──
  const handleTextMouseDown = (e: React.MouseEvent, slide: Slide, target: "title" | "body") => {
    if (editorOpen) return;
    e.preventDefault();
    const oxKey = target === "title" ? "titleOffsetX" : "bodyOffsetX";
    const oyKey = target === "title" ? "titleOffsetY" : "bodyOffsetY";
    mouseDragRef.current = { x: e.clientX, y: e.clientY, offsetX: slide[oxKey] ?? 0, offsetY: slide[oyKey] ?? 0, slideId: slide.id, target };
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDragRef.current) return;
      const dx = e.clientX - mouseDragRef.current.x;
      const dy = e.clientY - mouseDragRef.current.y;
      setDragOffset({ x: mouseDragRef.current.offsetX + dx, y: mouseDragRef.current.offsetY + dy });
    };
    const onMouseUp = () => {
      if (!mouseDragRef.current) return;
      if (dragOffset !== null) {
        const t = mouseDragRef.current.target;
        const oxKey = t === "title" ? "titleOffsetX" : "bodyOffsetX";
        const oyKey = t === "title" ? "titleOffsetY" : "bodyOffsetY";
        onUpdateSlide(mouseDragRef.current.slideId, { [oxKey]: dragOffset.x, [oyKey]: dragOffset.y });
        setDragOffset(null);
      }
      mouseDragRef.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [dragOffset, onUpdateSlide]);

  // ── Media touch drag/pinch ──
  const handleMediaTouchStart = (e: React.TouchEvent, slide: Slide) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      mediaTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, posX: slide.bgPosX, posY: slide.bgPosY };
      mediaPinchRef.current = null;
    } else if (e.touches.length === 2) {
      mediaTouchRef.current = null;
      mediaPinchRef.current = { dist: getTouchDist(e), scale: slide.bgScale };
    }
  };
  const handleMediaTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.touches.length === 1 && mediaTouchRef.current) {
      const dx = e.touches[0].clientX - mediaTouchRef.current.x;
      const dy = e.touches[0].clientY - mediaTouchRef.current.y;
      setMediaDragOffset({ x: mediaTouchRef.current.posX + (dx / 3), y: mediaTouchRef.current.posY + (dy / 3) });
    } else if (e.touches.length === 2 && mediaPinchRef.current) {
      const dist = getTouchDist(e);
      setMediaPinchScale(Math.max(10, Math.min(300, mediaPinchRef.current.scale * (dist / mediaPinchRef.current.dist))));
    }
  };
  const handleMediaTouchEnd = (slideId: number) => {
    const updates: Partial<Slide> = {};
    if (mediaDragOffset !== null) { updates.bgPosX = mediaDragOffset.x; updates.bgPosY = mediaDragOffset.y; setMediaDragOffset(null); }
    if (mediaPinchScale !== null) { updates.bgScale = mediaPinchScale; setMediaPinchScale(null); }
    if (Object.keys(updates).length > 0) onUpdateSlide(slideId, updates);
    mediaTouchRef.current = null; mediaPinchRef.current = null;
  };

  // ── Media mouse drag (desktop) ──
  const handleMediaMouseDown = (e: React.MouseEvent, slide: Slide) => {
    e.preventDefault(); e.stopPropagation();
    mediaMouseRef.current = { x: e.clientX, y: e.clientY, posX: slide.bgPosX, posY: slide.bgPosY, slideId: slide.id };
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mediaMouseRef.current) return;
      const dx = e.clientX - mediaMouseRef.current.x;
      const dy = e.clientY - mediaMouseRef.current.y;
      setMediaDragOffset({ x: mediaMouseRef.current.posX + (dx / 3), y: mediaMouseRef.current.posY + (dy / 3) });
    };
    const onMouseUp = () => {
      if (!mediaMouseRef.current) return;
      if (mediaDragOffset !== null) {
        onUpdateSlide(mediaMouseRef.current.slideId, { bgPosX: mediaDragOffset.x, bgPosY: mediaDragOffset.y });
        setMediaDragOffset(null);
      }
      mediaMouseRef.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [mediaDragOffset, onUpdateSlide]);

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
                  borderRadius: '0px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                }}
              >
                <div
                  data-slide-id={slide.id}
                  className="relative flex h-full flex-col overflow-hidden"
                  style={{
                    background: slide.bgColor,
                    borderRadius: '0px',
                    textAlign: hAlignToText[slide.hAlign] as React.CSSProperties['textAlign'],
                    padding: `${fmt.padding}px`,
                  }}
                >
                  {/* Overlay pattern - on bg color only, behind image/video */}
                  <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} />
                  {/* Background image layer */}
                  {slide.bgImage && (
                    <div
                      className="absolute inset-0 z-[2]"
                      style={{ overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}
                      onTouchStart={(e) => handleMediaTouchStart(e, slide)}
                      onTouchMove={(e) => handleMediaTouchMove(e)}
                      onTouchEnd={() => handleMediaTouchEnd(slide.id)}
                      onMouseDown={(e) => handleMediaMouseDown(e, slide)}
                    >
                      <img src={slide.bgImage} alt="" style={{
                        ...getBgMediaStyle(slide),
                        objectFit: 'contain',
                        left: `${mediaDragOffset !== null && index === activeSlide ? mediaDragOffset.x : slide.bgPosX}%`,
                        top: `${mediaDragOffset !== null && index === activeSlide ? mediaDragOffset.y : slide.bgPosY}%`,
                        transform: `translate(-50%, -50%) scale(${(mediaPinchScale !== null && index === activeSlide ? mediaPinchScale : slide.bgScale) / 100})`,
                      }} />
                      {slide.bgDarken > 0 && (
                        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})`, pointerEvents: 'none' }} />
                      )}
                    </div>
                  )}
                  {slide.bgVideo && (
                    <div
                      className="absolute inset-0 z-[2]"
                      style={{ overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}
                      onTouchStart={(e) => handleMediaTouchStart(e, slide)}
                      onTouchMove={(e) => handleMediaTouchMove(e)}
                      onTouchEnd={() => handleMediaTouchEnd(slide.id)}
                      onMouseDown={(e) => handleMediaMouseDown(e, slide)}
                    >
                      <video
                        src={slide.bgVideo}
                        autoPlay loop playsInline
                        muted={slide.bgMuted !== false || index !== activeSlide}
                        style={{
                          ...getBgMediaStyle(slide),
                          objectFit: 'cover',
                          left: `${mediaDragOffset !== null && index === activeSlide ? mediaDragOffset.x : slide.bgPosX}%`,
                          top: `${mediaDragOffset !== null && index === activeSlide ? mediaDragOffset.y : slide.bgPosY}%`,
                          transform: `translate(-50%, -50%) scale(${(mediaPinchScale !== null && index === activeSlide ? mediaPinchScale : slide.bgScale) / 100})`,
                        }}
                        ref={(el) => {
                          if (el) {
                            if (index === activeSlide) el.play().catch(() => {});
                            else el.pause();
                          }
                        }}
                      />
                      {slide.bgDarken > 0 && (
                        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})`, pointerEvents: 'none' }} />
                      )}
                    </div>
                  )}
                  {/* Content layer */}
                  <div className="relative z-10 flex flex-col h-full w-full">
                    {/* Top bar: username + slide count — always at top */}
                    <div className="flex items-center justify-between w-full flex-shrink-0 mb-2">
                      {slide.showUsername !== false ? (
                        <span className="outline-none font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: `${fmt.usernameSize}px` }}>{slide.username}</span>
                      ) : <span />}
                      {slide.showSlideCount !== false ? (
                        <span className="font-normal" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: `${fmt.usernameSize}px` }}>{index + 1}/{slides.length}</span>
                      ) : <span />}
                    </div>

                    {/* Content area — flex-1, vAlign controls justifyContent */}
                    <div className="flex flex-col flex-1 min-h-0" style={{ justifyContent: vAlignToJustify[slide.vAlign] }}>
                      <div>
                        {/* Title — separate drag */}
                        <div
                          onTouchStart={(e) => handleTextTouchStart(e, slide, "title")}
                          onTouchMove={(e) => handleTextTouchMove(e)}
                          onTouchEnd={() => handleTextTouchEnd(slide.id)}
                          onMouseDown={(e) => handleTextMouseDown(e, slide, "title")}
                          style={{
                            transform: `translate(${(dragOffset !== null && textDragTarget.current === "title" && index === activeSlide ? dragOffset.x : slide.titleOffsetX ?? 0)}px, ${(dragOffset !== null && textDragTarget.current === "title" && index === activeSlide ? dragOffset.y : slide.titleOffsetY ?? 0)}px) scale(${(pinchScale !== null && textDragTarget.current === "title" && index === activeSlide ? pinchScale : slide.titleScale ?? 1)})`,
                            transformOrigin: 'center center',
                            touchAction: 'none',
                            cursor: editorOpen ? 'text' : 'grab',
                          }}
                        >
                          <h2
                            onClick={() => openEditor("title")}
                            className="outline-none font-bold cursor-pointer"
                            style={{
                              color: '#ffffff',
                              fontSize: `${slide.titleSize ?? fmt.titleSize}px`,
                              fontFamily: slide.titleFont || "'Inter', sans-serif",
                              textTransform: (slide.titleCase === 'uppercase' ? 'uppercase' : slide.titleCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
                              lineHeight: slide.titleLineHeight ?? 1.1,
                              letterSpacing: `${slide.titleLetterSpacing ?? 0}px`,
                            }}
                            dangerouslySetInnerHTML={{ __html: slide.title }}
                          />
                        </div>
                        {/* Body — separate drag */}
                        <div
                          onTouchStart={(e) => handleTextTouchStart(e, slide, "body")}
                          onTouchMove={(e) => handleTextTouchMove(e)}
                          onTouchEnd={() => handleTextTouchEnd(slide.id)}
                          onMouseDown={(e) => handleTextMouseDown(e, slide, "body")}
                          style={{
                            transform: `translate(${(dragOffset !== null && textDragTarget.current === "body" && index === activeSlide ? dragOffset.x : slide.bodyOffsetX ?? 0)}px, ${(dragOffset !== null && textDragTarget.current === "body" && index === activeSlide ? dragOffset.y : slide.bodyOffsetY ?? 0)}px) scale(${(pinchScale !== null && textDragTarget.current === "body" && index === activeSlide ? pinchScale : slide.bodyScale ?? 1)})`,
                            transformOrigin: 'center center',
                            touchAction: 'none',
                            cursor: editorOpen ? 'text' : 'grab',
                          }}
                        >
                          <p
                            onClick={() => openEditor("body")}
                            className="outline-none mt-3 font-normal cursor-pointer"
                            style={{
                              color: 'rgba(255, 255, 255, 0.85)',
                              fontSize: `${slide.bodySize ?? fmt.bodySize}px`,
                              fontFamily: slide.bodyFont || "'Inter', sans-serif",
                              textTransform: (slide.bodyCase === 'uppercase' ? 'uppercase' : slide.bodyCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
                              lineHeight: slide.bodyLineHeight ?? 1.5,
                              letterSpacing: `${slide.bodyLetterSpacing ?? 0}px`,
                            }}
                            dangerouslySetInnerHTML={{ __html: slide.body }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom bar: footer + swipe arrow — always at bottom */}
                    <div className="flex items-end justify-between w-full flex-shrink-0">
                      {slide.showFooter ? (
                        <span className="font-normal" style={{ color: 'rgba(255,255,255,0.6)', fontSize: `${fmt.footerSize}px` }}>
                          {slide.footerText || ""}
                        </span>
                      ) : <span />}
                      {slide.showArrow !== false && index < slides.length - 1 ? (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: `${fmt.footerSize + 2}px` }}>→</span>
                      ) : <span />}
                    </div>
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
          onHAlignChange={(v) => onUpdateSlide(currentSlide.id, { hAlign: v, titleOffsetX: 0, titleOffsetY: 0, bodyOffsetX: 0, bodyOffsetY: 0, titleScale: 1, bodyScale: 1 })}
          onVAlignChange={(v) => onUpdateSlide(currentSlide.id, { vAlign: v, titleOffsetX: 0, titleOffsetY: 0, bodyOffsetX: 0, bodyOffsetY: 0, titleScale: 1, bodyScale: 1 })}
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
          onClose={closeEditor}
        />
      )}
    </div>
  );
};

export default SlideCarousel;
