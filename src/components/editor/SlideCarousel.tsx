import { useRef, useState, useCallback } from "react";
import { Plus } from "lucide-react";
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

interface SlideCarouselProps {
  activeSlide: number;
  onSlideChange: (index: number) => void;
}

const SlideCarousel = ({ activeSlide, onSlideChange }: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState(initialSlides);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  const currentSlide = slides[activeSlide];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const slideWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth
      : 0;
    if (slideWidth === 0) return;
    const scrollLeft = container.scrollLeft;
    const index = Math.round(scrollLeft / slideWidth);
    if (index !== activeSlide) {
      onSlideChange(index);
    }
  };

  const updateSlide = useCallback((id: number, updates: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-0 py-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full gap-4 overflow-x-auto px-8 snap-x-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "flex-shrink-0 snap-center transition-all duration-300 overflow-hidden",
              index === activeSlide ? "scale-100" : "scale-[0.92] opacity-60"
            )}
            style={{
              width: "min(85vw, 360px)",
              aspectRatio: "1080/1440",
            }}
          >
            {/* Glass outer shell */}
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
              {/* Inner content plate */}
              <div
                className="relative flex h-full flex-col p-6"
                style={{
                  background: slide.bgColor,
                  borderRadius: '16px',
                  justifyContent: vAlignToJustify[slide.vAlign],
                  textAlign: hAlignToText[slide.hAlign] as React.CSSProperties['textAlign'],
                }}
              >
                {/* Top row: username + counter — always at top */}
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

                {/* Text content block */}
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
        ))}

        {/* Add slide button */}
        <div
          className="flex flex-shrink-0 snap-center items-center justify-center overflow-hidden glass"
          style={{
            width: "min(85vw, 360px)",
            aspectRatio: "1080/1440",
          }}
        >
          <button className="flex flex-col items-center gap-2 transition-colors" style={{ color: 'rgba(26, 26, 46, 0.4)' }}>
            <Plus size={32} />
            <span className="text-sm">Добавить слайд</span>
          </button>
        </div>
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
          onCropClick={() => {/* TODO: crop overlay */}}
        />
      )}

      {/* Dots indicator */}
      <div className="mt-4 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              onSlideChange(index);
              if (scrollRef.current) {
                const child = scrollRef.current.children[index] as HTMLElement;
                child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === activeSlide ? "w-6" : "w-2"
            )}
            style={{
              background: index === activeSlide ? 'rgba(26, 26, 46, 0.3)' : 'rgba(26, 26, 46, 0.1)',
            }}
          />
        ))}
      </div>

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
