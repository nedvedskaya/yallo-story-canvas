import { useRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
}

const demoSlides: Slide[] = [
  {
    id: 1,
    title: "Привет, мир!",
    subtitle: "Это первый слайд вашей карусели. Начните редактирование прямо сейчас.",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
  },
  {
    id: 2,
    title: "Расскажите историю",
    subtitle: "Каждый слайд — это возможность передать вашу идею красиво и лаконично.",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    textColor: "#ffffff",
  },
  {
    id: 3,
    title: "Призыв к действию",
    subtitle: "Подписывайтесь, ставьте лайк и делитесь с друзьями ✨",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    textColor: "#ffffff",
  },
];

interface SlideCarouselProps {
  activeSlide: number;
  onSlideChange: (index: number) => void;
}

const SlideCarousel = ({ activeSlide, onSlideChange }: SlideCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-0 py-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full gap-4 overflow-x-auto px-8 snap-x-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {demoSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "flex-shrink-0 snap-center transition-all duration-300 overflow-hidden",
              index === activeSlide ? "scale-100" : "scale-[0.92] opacity-60"
            )}
            style={{
              width: "min(85vw, 360px)",
              aspectRatio: "4/5",
              borderRadius: '24px',
            }}
          >
            {/* Glass outer shell */}
            <div
              className="h-full w-full p-[6px]"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1.5px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '24px',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
              }}
            >
              {/* Inner content plate */}
              <div
                className="flex h-full flex-col items-center justify-center px-8 text-center"
                style={{
                  background: slide.bgColor,
                  borderRadius: '18px',
                }}
              >
                <h2
                  className="mb-4 text-2xl font-semibold leading-tight"
                  style={{ color: slide.textColor }}
                >
                  {slide.title}
                </h2>
                <p
                  className="text-sm font-light leading-relaxed opacity-90"
                  style={{ color: slide.textColor }}
                >
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Add slide button */}
        <div
          className="flex flex-shrink-0 snap-center items-center justify-center overflow-hidden"
          style={{
            width: "min(85vw, 360px)",
            aspectRatio: "4/5",
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1.5px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '24px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
          }}
        >
          <button className="flex flex-col items-center gap-2 text-muted-foreground transition-colors">
            <Plus size={32} />
            <span className="text-sm">Добавить слайд</span>
          </button>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="mt-6 flex items-center gap-2">
        {demoSlides.map((_, index) => (
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
              index === activeSlide
                ? "w-6 bg-foreground/30"
                : "w-2 bg-foreground/10"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideCarousel;
