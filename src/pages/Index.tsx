import { useState, useCallback, useRef } from "react";
import TopBar from "@/components/editor/TopBar";
import SlideCarousel from "@/components/editor/SlideCarousel";
import type { Slide } from "@/components/editor/SlideCarousel";
import BottomMenu from "@/components/editor/BottomMenu";
import BottomSheet from "@/components/editor/BottomSheet";
import type { MenuId } from "@/components/editor/BottomMenu";
import type { SlideFormat } from "@/components/editor/SizePanel";

let nextId = 4;

const initialSlides: Slide[] = [
  {
    id: 1, username: "@username", title: "Заголовок слайда",
    body: "Основной текст слайда. Начните редактирование прямо сейчас.",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
    titleSize: 24, bodySize: 14,
  },
  {
    id: 2, username: "@username", title: "Расскажите историю",
    body: "Каждый слайд — это возможность передать вашу идею красиво и лаконично.",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
    titleSize: 24, bodySize: 14,
  },
  {
    id: 3, username: "@username", title: "Призыв к действию",
    body: "Подписывайтесь, ставьте лайк и делитесь с друзьями ✨",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
    titleSize: 24, bodySize: 14,
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<MenuId | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [slideFormat, setSlideFormat] = useState<SlideFormat>("carousel");

  const slideSnapshotRef = useRef<Slide | null>(null);
  const formatSnapshotRef = useRef<SlideFormat | null>(null);

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

  const handleApplyTextToAll = useCallback(() => {
    if (!currentSlide) return;
    setSlides(prev =>
      prev.map(s => ({
        ...s,
        titleFont: currentSlide.titleFont,
        titleSize: currentSlide.titleSize,
        titleCase: currentSlide.titleCase,
        titleLineHeight: currentSlide.titleLineHeight,
        titleLetterSpacing: currentSlide.titleLetterSpacing,
        bodyFont: currentSlide.bodyFont,
        bodySize: currentSlide.bodySize,
        bodyCase: currentSlide.bodyCase,
        bodyLineHeight: currentSlide.bodyLineHeight,
        bodyLetterSpacing: currentSlide.bodyLetterSpacing,
      }))
    );
  }, [currentSlide]);

  const handleApplyInfoToAll = useCallback(() => {
    if (!currentSlide) return;
    setSlides(prev =>
      prev.map(s => ({
        ...s,
        showUsername: currentSlide.showUsername,
        username: currentSlide.username,
        showSlideCount: currentSlide.showSlideCount,
        showArrow: currentSlide.showArrow,
        showFooter: currentSlide.showFooter,
        footerText: currentSlide.footerText,
      }))
    );
  }, [currentSlide]);

  const handleTabChange = useCallback((tab: MenuId | null) => {
    if (tab && currentSlide) {
      slideSnapshotRef.current = { ...currentSlide };
      formatSnapshotRef.current = slideFormat;
    }
    setActiveTab(tab);
  }, [currentSlide, slideFormat]);

  const handleSaveClose = useCallback(() => {
    slideSnapshotRef.current = null;
    formatSnapshotRef.current = null;
    setActiveTab(null);
  }, []);

  const handleCancelClose = useCallback(() => {
    if (slideSnapshotRef.current && currentSlide) {
      const snap = slideSnapshotRef.current;
      setSlides(prev => prev.map(s => s.id === snap.id ? snap : s));
    }
    if (formatSnapshotRef.current !== null) {
      setSlideFormat(formatSnapshotRef.current);
    }
    slideSnapshotRef.current = null;
    formatSnapshotRef.current = null;
    setActiveTab(null);
  }, [currentSlide]);

  const handleAddSlide = useCallback((atIndex: number) => {
    const newSlide: Slide = {
      id: nextId++, username: "@username", title: "Новый слайд", body: "Введите текст...",
      bgColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      bgType: "color", hAlign: "center", vAlign: "center",
      overlayType: "none", overlayOpacity: 50,
      bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
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
            slideFormat={slideFormat}
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
        onClose={handleCancelClose}
        onSaveClose={handleSaveClose}
        currentSlide={currentSlide}
        onUpdateSlide={handleUpdateSlide}
        onApplyBgToAll={handleApplyBgToAll}
        onApplyTextToAll={handleApplyTextToAll}
        onApplyInfoToAll={handleApplyInfoToAll}
        slideFormat={slideFormat}
        onSlideFormatChange={setSlideFormat}
      />
      <BottomMenu activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
