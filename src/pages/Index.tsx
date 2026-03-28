import { useState, useCallback } from "react";
import TopBar from "@/components/editor/TopBar";
import SlideCarousel from "@/components/editor/SlideCarousel";
import type { Slide } from "@/components/editor/SlideCarousel";
import BottomMenu from "@/components/editor/BottomMenu";
import BottomSheet from "@/components/editor/BottomSheet";
import type { MenuId } from "@/components/editor/BottomMenu";

const Index = () => {
  const [activeTab, setActiveTab] = useState<MenuId | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

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

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-main overflow-hidden">
      <div className="relative z-10 flex h-[100dvh] flex-col pt-[env(safe-area-inset-top)]">
        <TopBar />
        <main className="flex flex-1 flex-col min-h-0 pb-[calc(72px+env(safe-area-inset-bottom))]">
          <SlideCarousel
            activeSlide={activeSlide}
            onSlideChange={setActiveSlide}
            isSheetOpen={!!activeTab}
            onSlidesChange={setSlides}
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
