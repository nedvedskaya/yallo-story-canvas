import { useRef, useCallback, useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SlideToolbar, { type HAlign, type VAlign, type BgType } from "./SlideToolbar";
import { glassBtnStyle, FORMAT_TEXT_DEFAULTS } from "./shared-styles";
import type { OverlayType } from "./BackgroundPanel";

import { FORMAT_OPTIONS, type SlideFormat } from "./SizePanel";
import SlideFrame from "./SlideFrame";

/**
 * SlideType — discriminator for type-specific layout dispatch.
 * Layout is determined by `type`; visual style (colors, fonts, decor) by the template.
 * See src/components/editor/SlideFactory.tsx and src/components/editor/slide-types/*.
 */
export type SlideType =
  | 'hook'
  | 'problem'
  | 'thesis'
  | 'list'
  | 'cta'
  | 'big_number'
  | 'quote'
  | 'steps'
  | 'comparison'
  | 'story_moment'
  | 'hero_card'
  | 'question'
  | 'visual_focus'
  | 'text_block';

export interface ComparisonSide {
  label: string;
  text?: string;
  items?: string[];
}

export interface Slide {
  id: number;
  username: string;
  title: string;
  body: string;

  /** Slide type — drives layout dispatch in SlideFactory. Undefined = 'text_block' fallback. */
  type?: SlideType;

  /** Style template — drives visual axis (palette, fonts, decor). Independent of `type`.
   *  'minimalism' activates the Minimalism styling branch in SlideFrame (topbar variant,
   *  side padding 80px, bottom bar hidden). Background dot-pattern is a SEPARATE flag
   *  (`bgPattern: 'dots'`) and off by default for Minimalism — user re-enables via the BG panel. */
  template?: 'minimalism';

  // Type-specific content fields (all optional; each *Content component reads only its own).
  // Names are prefixed (steps_items, comparison_left, hero_*, question_text) where API keys
  // like `steps`, `left`, `right`, `name`, `role`, `description`, `question` would collide with
  // existing Slide fields or reserved React/DOM names.
  subtitle?: string;
  highlight?: string;
  accent_text?: string;
  pain_points?: string[];
  items?: string[];
  numbered?: boolean;
  action_hint?: string;
  value?: string;
  caption?: string;
  context?: string;
  author?: string;
  author_role?: string;
  steps_items?: { label: string; description?: string }[];
  comparison_left?: ComparisonSide;
  comparison_right?: ComparisonSide;
  time_marker?: string;
  scene?: string;
  emotion?: string;
  sensory_detail?: string;
  hero_name?: string;
  hero_role?: string;
  hero_description?: string;
  hero_stats?: { value: string; label: string }[];
  question_text?: string;
  image_url?: string;
  annotation?: string;

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
  titleColor?: string;
  bodyColor?: string;
  metaColor?: string;
  overlayColor?: string;
  bgVideoFile?: File;
  hasList?: boolean;
  decorShape?: 'asterisk' | 'none';
  decorColor?: string;
  decorSize?: number;
  decorTop?: number;
  decorLeft?: number;
  /** Decorative background pattern that tiles across the whole slide (e.g. notebook-paper dots). */
  bgPattern?: 'dots' | 'none';
  accentMode?: 'highlight' | 'color' | 'none';
  accentColor?: string;
  stickers?: Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    width: number;
    height: number;
  }>;
}

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
  onUpdateSticker?: (stickerId: string, updates: Partial<{x:number;y:number;scale:number;rotation:number}>) => void;
  onDeleteSticker?: (stickerId: string) => void;
  watermark?: string;
}

const SlideCarousel = ({
  slides, activeSlide, onSlideChange, isSheetOpen = false, slideFormat = "carousel",
  onUpdateSlide, onAddSlide, onMoveSlide, onDuplicateSlide, onDeleteSlide, onEditorOpenChange,
  onUpdateSticker, onDeleteSticker, watermark,
}: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[activeSlide];
  const editorOpen = false;

  // Text drag state
  const textDragTarget = useRef<"title" | "body">("title");
  const touchStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const [titleDragOffset, setTitleDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [bodyDragOffset, setBodyDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [titlePinchScale, setTitlePinchScale] = useState<number | null>(null);
  const [bodyPinchScale, setBodyPinchScale] = useState<number | null>(null);
  const mouseDragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number; slideId: number; target: "title" | "body" } | null>(null);
  const textDragMovedRef = useRef(false);


  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];
  const slideAspectRatio = `${formatInfo.width}/${formatInfo.height}`;
  const isLandscape = formatInfo.width > formatInfo.height;


  const getTouchDist = (e: React.TouchEvent) => {
    const [a, b] = [e.touches[0], e.touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };
  const setDragForTarget = (target: "title" | "body", val: { x: number; y: number } | null) => {
    if (target === "title") setTitleDragOffset(val); else setBodyDragOffset(val);
  };
  const setPinchForTarget = (target: "title" | "body", val: number | null) => {
    if (target === "title") setTitlePinchScale(val); else setBodyPinchScale(val);
  };

  // Text touch handlers — single-finger drag + pinch-to-scale
  const handleTextTouchStart = (e: React.TouchEvent, slide: Slide, target: "title" | "body") => {
    if (editorOpen) return;
    textDragTarget.current = target;
    textDragMovedRef.current = false;
    const scaleKey = target === "title" ? "titleScale" : "bodyScale";
    if (e.touches.length === 2) {
      pinchStartRef.current = { dist: getTouchDist(e), scale: slide[scaleKey] ?? 1 };
      touchStartRef.current = null;
    } else if (e.touches.length === 1) {
      pinchStartRef.current = null;
      const oxKey = target === "title" ? "titleOffsetX" : "bodyOffsetX";
      const oyKey = target === "title" ? "titleOffsetY" : "bodyOffsetY";
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        offsetX: slide[oxKey] ?? 0,
        offsetY: slide[oyKey] ?? 0,
      };
    }
  };
  const handleTextTouchMove = (e: React.TouchEvent) => {
    if (editorOpen) return;
    const t = textDragTarget.current;
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.stopPropagation();
      textDragMovedRef.current = true;
      const dist = getTouchDist(e);
      setPinchForTarget(t, Math.max(0.3, Math.min(3, pinchStartRef.current.scale * (dist / pinchStartRef.current.dist))));
    } else if (e.touches.length === 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) {
        e.stopPropagation();
        textDragMovedRef.current = true;
        setDragForTarget(t, {
          x: touchStartRef.current.offsetX + dx,
          y: touchStartRef.current.offsetY + dy,
        });
      }
    }
  };
  const handleTextTouchEnd = (slideId: number) => {
    if (editorOpen) return;
    const t = textDragTarget.current;
    const scaleKey = t === "title" ? "titleScale" : "bodyScale";
    const oxKey = t === "title" ? "titleOffsetX" : "bodyOffsetX";
    const oyKey = t === "title" ? "titleOffsetY" : "bodyOffsetY";
    const currentPinch = t === "title" ? titlePinchScale : bodyPinchScale;
    const currentDrag = t === "title" ? titleDragOffset : bodyDragOffset;
    const updates: Partial<Slide> = {};
    if (currentPinch !== null) { updates[scaleKey] = currentPinch; setPinchForTarget(t, null); }
    if (currentDrag !== null) { updates[oxKey] = currentDrag.x; updates[oyKey] = currentDrag.y; setDragForTarget(t, null); }
    if (Object.keys(updates).length > 0) onUpdateSlide(slideId, updates);
    pinchStartRef.current = null;
    touchStartRef.current = null;
  };

  // Text mouse drag
  const handleTextMouseDown = (e: React.MouseEvent, slide: Slide, target: "title" | "body") => {
    if (editorOpen) return;
    e.preventDefault();
    textDragMovedRef.current = false;
    const oxKey = target === "title" ? "titleOffsetX" : "bodyOffsetX";
    const oyKey = target === "title" ? "titleOffsetY" : "bodyOffsetY";
    mouseDragRef.current = { x: e.clientX, y: e.clientY, offsetX: slide[oxKey] ?? 0, offsetY: slide[oyKey] ?? 0, slideId: slide.id, target };
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDragRef.current) return;
      const dx = e.clientX - mouseDragRef.current.x;
      const dy = e.clientY - mouseDragRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) textDragMovedRef.current = true;
      setDragForTarget(mouseDragRef.current.target, { x: mouseDragRef.current.offsetX + dx, y: mouseDragRef.current.offsetY + dy });
    };
    const onMouseUp = () => {
      if (!mouseDragRef.current) return;
      const t = mouseDragRef.current.target;
      const currentDrag = t === "title" ? titleDragOffset : bodyDragOffset;
      if (currentDrag !== null) {
        const oxKey = t === "title" ? "titleOffsetX" : "bodyOffsetX";
        const oyKey = t === "title" ? "titleOffsetY" : "bodyOffsetY";
        onUpdateSlide(mouseDragRef.current.slideId, { [oxKey]: currentDrag.x, [oyKey]: currentDrag.y });
        setDragForTarget(t, null);
      }
      mouseDragRef.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [titleDragOffset, bodyDragOffset, onUpdateSlide]);




  const scrollToIndex = (index: number) => {
    setTimeout(() => {
      if (scrollRef.current) {
        const child = scrollRef.current.children[index] as HTMLElement;
        child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }, 50);
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    let closestIndex = 0;
    let closestDist = Infinity;

    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    if (closestIndex !== activeSlide && closestIndex < slides.length) {
      onSlideChange(closestIndex);
    }
  }, [activeSlide, slides.length, onSlideChange]);

  const handleAdd = useCallback((idx: number) => { onAddSlide(idx); scrollToIndex(idx); }, [onAddSlide]);
  const handleMove = useCallback((fromIdx: number, dir: -1 | 1) => { onMoveSlide(fromIdx, dir); scrollToIndex(Math.max(0, Math.min(fromIdx + dir, slides.length - 1))); }, [onMoveSlide, slides.length]);
  const handleDuplicate = useCallback((idx: number) => { onDuplicateSlide(idx); scrollToIndex(idx + 1); }, [onDuplicateSlide]);
  const handleDelete = useCallback((idx: number) => { onDeleteSlide(idx); scrollToIndex(Math.min(idx, slides.length - 2)); }, [onDeleteSlide, slides.length]);

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
        className="flex w-full items-center gap-3 overflow-x-auto snap-x-mandatory scrollbar-hide transition-all duration-300"
        style={{
          scrollBehavior: "smooth",
          paddingLeft: 'calc(50% - 160px)',
          paddingRight: 'calc(50% - 160px)',
          transform: isSheetOpen ? 'scale(0.55) translateY(-45%)' : 'scale(1) translateY(0)',
          transformOrigin: 'center center',
        }}
      >
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div key={slide.id} className="flex items-center gap-3 flex-shrink-0">
              <div
                className={cn(
                  "flex-shrink-0 snap-center transition-all duration-300 overflow-hidden",
                  isActive ? "scale-100" : "scale-[0.92] opacity-60"
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
                  <SlideFrame
                    slide={slide}
                    slideIndex={index}
                    totalSlides={slides.length}
                    format={slideFormat}
                    dataSlideId={slide.id}
                    editorOpen={editorOpen}
                    videoMuted={slide.bgMuted !== false || !isActive}
                    videoRefCallback={(el) => {
                      if (el) {
                        if (isActive) el.play().catch(() => {});
                        else el.pause();
                      }
                    }}
                    titleOverrides={isActive && (titleDragOffset !== null || titlePinchScale !== null) ? {
                      offsetX: titleDragOffset?.x ?? (slide.titleOffsetX ?? 0),
                      offsetY: titleDragOffset?.y ?? (slide.titleOffsetY ?? 0),
                      scale: titlePinchScale ?? (slide.titleScale ?? 1),
                    } : undefined}
                    bodyOverrides={isActive && (bodyDragOffset !== null || bodyPinchScale !== null) ? {
                      offsetX: bodyDragOffset?.x ?? (slide.bodyOffsetX ?? 0),
                      offsetY: bodyDragOffset?.y ?? (slide.bodyOffsetY ?? 0),
                      scale: bodyPinchScale ?? (slide.bodyScale ?? 1),
                    } : undefined}
                    onTitleTouchStart={(e) => handleTextTouchStart(e, slide, "title")}
                    onTitleTouchMove={(e) => handleTextTouchMove(e)}
                    onTitleTouchEnd={() => handleTextTouchEnd(slide.id)}
                    onTitleMouseDown={(e) => handleTextMouseDown(e, slide, "title")}
                    onTitleClick={() => {}}
                    onBodyTouchStart={(e) => handleTextTouchStart(e, slide, "body")}
                    onBodyTouchMove={(e) => handleTextTouchMove(e)}
                    onBodyTouchEnd={() => handleTextTouchEnd(slide.id)}
                    onBodyMouseDown={(e) => handleTextMouseDown(e, slide, "body")}
                    onBodyClick={() => {}}
                    onUpdateSticker={isActive ? onUpdateSticker : undefined}
                    onDeleteSticker={isActive ? onDeleteSticker : undefined}
                    stickerInteractive={isActive}
                    onDeleteDecor={isActive ? () => onUpdateSlide(slide.id, { decorShape: 'none' }) : undefined}
                    watermark={watermark}
                  />
                </div>
              </div>

              <button onClick={() => handleAdd(index + 1)} className="flex items-center justify-center transition-all active:scale-90 flex-shrink-0" style={addBtnStyle}><Plus size={14} /></button>
            </div>
          );
        })}
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
    </div>
  );
};

export default SlideCarousel;
