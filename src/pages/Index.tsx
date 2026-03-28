import { useState, useCallback } from "react";
import TopBar from "@/components/editor/TopBar";
import SlideCarousel from "@/components/editor/SlideCarousel";
import type { Slide } from "@/components/editor/SlideCarousel";
import BottomMenu from "@/components/editor/BottomMenu";
import BottomSheet from "@/components/editor/BottomSheet";
import type { MenuId } from "@/components/editor/BottomMenu";
import type { OverlayType } from "@/components/editor/BackgroundPanel";

let nextId = 4;

const initialSlides: Slide[] = [
  {
    id: 1, username: "@username", title: "Заголовок слайда",
    body: "Основной текст слайда. Начните редактирование прямо сейчас.",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgType: "color", hAlign: "center", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50,
  },
  {
    id: 2, username: "@username", title: "Расскажите историю",
    body: "Каждый слайд — это возможность передать вашу идею красиво и лаконично.",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bgType: "color", hAlign: "center", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50,
  },
  {
    id: 3, username: "@username", title: "Призыв к действию",
    body: "Подписывайтесь, ставьте лайк и делитесь с друзьями ✨",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgType: "color", hAlign: "center", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50,
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<MenuId | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);

  const currentSlide = slides[activeSlide];

  const handleUpdateSlide = useCallback((id: number, updates: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleApplyBgToAll = useCallback(() => {
    if (!currentSlide) return;
    setSlides(prev =>
      prev.map(s => ({
        ...s,
        bgColor: currentSlide.bgColor,
        overlayType: currentSlide.overlayType,
        overlayOpacity: currentSlide.overlayOpacity,
      }))
    );
  }, [currentSlide]);

  const handleAddSlide = useCallback((atIndex: number) => {
    const newSlide: Slide = {
      id: nextId++, username: "@username", title: "Новый слайд", body: "Введите текст...",
      bgColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      bgType: "color", hAlign: "center", vAlign: "center",
      overlayType: "none", overlayOpacity: 50,
    };
    setSlides(prev => { const next = [...prev]; next.splice(atIndex, 0, newSlide); return next; });
    setActiveSlide(atIndex);
  }, []);

  const handleMoveSlide = useCallback((fromIdx: number, dir: -1 | 1) => {
    setSlides(prev => {
      const toIdx = fromIdx + dir;
      if (toIdx < 0 || toIdx >= prev.length) return prev;
      const next = [...prev];
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next;
    });
    setActiveSlide(prev => {
      const toIdx = prev + dir;
      return Math.max(0, Math.min(toIdx, slides.length - 1));
    });
  }, [slides.length]);

  const handleDuplicateSlide = useCallback((idx: number) => {
    setSlides(prev => {
      const clone = { ...prev[idx], id: nextId++ };
      const next = [...prev]; next.splice(idx + 1, 0, clone); return next;
    });
    setActiveSlide(idx + 1);
  }, []);

  const handleDeleteSlide = useCallback((idx: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    setActiveSlide(prev => Math.min(prev, slides.length - 2));
  }, [slides.length]);

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-main overflow-hidden">
      <div className="relative z-10 flex h-[100dvh] flex-col pt-[env(safe-area-inset-top)]">
        <TopBar />
        <main className="flex flex-1 flex-col min-h-0 pb-[calc(72px+env(safe-area-inset-bottom))]">
          <SlideCarousel
            slides={slides}
            activeSlide={activeSlide}
            onSlideChange={setActiveSlide}
            isSheetOpen={!!activeTab}
            onUpdateSlide={handleUpdateSlide}
            onAddSlide={handleAddSlide}
            onMoveSlide={handleMoveSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        </main>
      </div>

      <BottomSheet
        activeTab={activeTab}
        onClose={() => setActiveTab(null)}
        currentSlide={currentSlide}
        onUpdateSlide={handleUpdateSlide}
        onApplyBgToAll={handleApplyBgToAll}
      />
      <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
