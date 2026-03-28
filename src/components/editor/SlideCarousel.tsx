import { useRef, useState, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SlideToolbar, { type HAlign, type VAlign, type BgType } from "./SlideToolbar";
import BackgroundModal from "./BackgroundModal";

interface Slide {
  id: number;
  username: string;
  title: string;
  body: string;
  bgColor: string;
  bgType: BgType;
  hAlign: HAlign;
  vAlign: VAlign;
}

let nextId = 4;

const initialSlides: Slide[] = [
  {
    id: 1,
    username: "@username",
    title: "Заголовок слайда",
    body: "Основной текст слайда. Начните редактирование прямо сейчас.",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgType: "color",
    hAlign: "center",
    vAlign: "center",
  },
  {
    id: 2,
    username: "@username",
    title: "Расскажите историю",
    body: "Каждый слайд — это возможность передать вашу идею красиво и лаконично.",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bgType: "color",
    hAlign: "center",
    vAlign: "center",
  },
  {
    id: 3,
    username: "@username",
    title: "Призыв к действию",
    body: "Подписывайтесь, ставьте лайк и делитесь с друзьями ✨",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgType: "color",
    hAlign: "center",
    vAlign: "center",
  },
];

const hAlignToText: Record<HAlign, string> = { left: "left", center: "center", right: "right" };
const vAlignToJustify: Record<VAlign, string> = { start: "flex-start", center: "center", end: "flex-end" };

const glassBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  color: "#4a4a6a",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const addBtnStyle: React.CSSProperties = {
  ...glassBtnStyle,
  width: 32,
  height: 32,
  flexShrink: 0,
};

interface SlideCarouselProps {
  activeSlide: number;
  onSlideChange: (index: number) => void;
  isSheetOpen?: boolean;
}

const SlideCarousel = ({ activeSlide, onSlideChange, isSheetOpen = false }: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState(initialSlides);
  const [bgModalOpen, setBgModalOpen] = useState(false);

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
      ? (container.firstElementChild as HTMLElement).offsetWidth
      : 0;
    if (slideWidth === 0) return;
    const scrollLeft = container.scrollLeft;
    const index = Math.round(scrollLeft / slideWidth);
    if (index !== activeSlide && index < slides.length) {
      onSlideChange(index);
    }
  };

  const updateSlide = useCallback((id: number, updates: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const addSlide = useCallback((atIndex: number) => {
    const newSlide: Slide = {
      id: nextId++,
      username: "@username",
      title: "Новый слайд",
      body: "Введите текст...",
      bgColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      bgType: "color",
      hAlign: "center",
      vAlign: "center",
    };
    setSlides(prev => {
      const next = [...prev];
      next.splice(atIndex, 0, newSlide);
      return next;
    });
    onSlideChange(atIndex);
    scrollToIndex(atIndex);
  }, [onSlideChange]);

  const moveSlide = useCallback((fromIdx: number, dir: -1 | 1) => {
    const toIdx = fromIdx + dir;
    setSlides(prev => {
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const next = [...prev];
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next;
    });
    const newIdx = Math.max(0, Math.min(toIdx, slides.length - 1));
    onSlideChange(newIdx);
    scrollToIndex(newIdx);
  }, [slides.length, onSlideChange]);

  const duplicateSlide = useCallback((idx: number) => {
    setSlides(prev => {
      const clone = { ...prev[idx], id: nextId++ };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    onSlideChange(idx + 1);
    scrollToIndex(idx + 1);
  }, [onSlideChange]);

  const deleteSlide = useCallback((idx: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    const newIdx = Math.min(idx, slides.length - 2);
    onSlideChange(newIdx);
    scrollToIndex(newIdx);
  }, [slides.length, onSlideChange]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-0 py-2 min-h-0">
      {/* Top actions for active slide */}
      {currentSlide && !isSheetOpen && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            onClick={() => moveSlide(activeSlide, -1)}
            className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={glassBtnStyle}
            disabled={activeSlide === 0}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => moveSlide(activeSlide, 1)}
            className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={glassBtnStyle}
            disabled={activeSlide === slides.length - 1}
          >
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => duplicateSlide(activeSlide)}
            className="flex items-center justify-center transition-all active:scale-90"
            style={glassBtnStyle}
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => deleteSlide(activeSlide)}
            className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={glassBtnStyle}
            disabled={slides.length <= 1}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full items-center gap-3 overflow-x-auto px-8 snap-x-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="flex items-center gap-3 flex-shrink-0">
            {/* Slide card */}
            <div
              className={cn(
                "flex-shrink-0 snap-center transition-all duration-300 overflow-hidden",
                index === activeSlide ? "scale-100" : "scale-[0.92] opacity-60"
              )}
              style={{
                width: "min(78vw, 320px)",
                aspectRatio: "1080/1440",
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
                  className="relative flex h-full flex-col p-6"
                  style={{
                    background: slide.bgColor,
                    borderRadius: '16px',
                    justifyContent: vAlignToJustify[slide.vAlign],
                    textAlign: hAlignToText[slide.hAlign] as React.CSSProperties['textAlign'],
                  }}
                >
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
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSlide(slide.id, { username: e.currentTarget.textContent || '' })}
                      className="outline-none text-xs font-normal"
                      style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}
                    >
                      {slide.username}
                    </span>
                    <span
                      className="text-xs font-normal"
                      style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}
                    >
                      {index + 1}/{slides.length}
                    </span>
                  </div>

                  <div>
                    <h2
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSlide(slide.id, { title: e.currentTarget.textContent || '' })}
                      className="outline-none font-bold leading-tight"
                      style={{
                        color: '#ffffff',
                        fontSize: '28px',
                        marginTop: slide.vAlign === "start" ? "32px" : "0",
                      }}
                    >
                      {slide.title}
                    </h2>

                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSlide(slide.id, { body: e.currentTarget.textContent || '' })}
                      className="outline-none mt-3 font-normal"
                      style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px', lineHeight: 1.5 }}
                    >
                      {slide.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* "+" button between slides */}
            <button
              onClick={() => addSlide(index + 1)}
              className="flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
              style={addBtnStyle}
            >
              <Plus size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      {currentSlide && (
        <SlideToolbar
          hAlign={currentSlide.hAlign}
          vAlign={currentSlide.vAlign}
          bgType={currentSlide.bgType}
          onHAlignChange={(v) => updateSlide(currentSlide.id, { hAlign: v })}
          onVAlignChange={(v) => updateSlide(currentSlide.id, { vAlign: v })}
          onBgClick={() => setBgModalOpen(true)}
          onCropClick={() => {}}
        />
      )}

      {/* Background modal */}
      <BackgroundModal
        open={bgModalOpen}
        onClose={() => setBgModalOpen(false)}
        onSelectColor={(bg) => {
          if (currentSlide) {
            updateSlide(currentSlide.id, { bgColor: bg, bgType: "color" });
          }
        }}
        onSelectType={(type) => {
          if (currentSlide) {
            updateSlide(currentSlide.id, { bgType: type });
          }
        }}
      />
    </div>
  );
};

export default SlideCarousel;
