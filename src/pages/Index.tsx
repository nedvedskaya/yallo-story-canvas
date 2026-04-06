import { useState, useCallback, useRef } from "react";
import { getContrastColors } from "@/lib/utils";
import TopBar from "@/components/editor/TopBar";
import SlideCarousel from "@/components/editor/SlideCarousel";
import type { Slide } from "@/components/editor/SlideCarousel";
import BottomMenu from "@/components/editor/BottomMenu";
import BottomSheet from "@/components/editor/BottomSheet";
import type { MenuId } from "@/components/editor/BottomMenu";
import type { SlideFormat } from "@/components/editor/SizePanel";
import DownloadModal from "@/components/editor/DownloadModal";
import type { SlideTemplate } from "@/components/editor/TemplatesPanel";

let nextId = 4;

const MAX_UNDO = 50;

/** Strip all inline-style spans from HTML */
function stripAccentSpans(html: string): string {
  return html.replace(/<span style="[^"]*">([^<]*)<\/span>/g, '$1');
}

const initialSlides: Slide[] = [
  {
    id: 1, username: "@username", title: "Заголовок слайда",
    body: "Основной текст слайда. Начните редактирование прямо сейчас.",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
  },
  {
    id: 2, username: "@username", title: "Расскажите историю",
    body: "Каждый слайд — это возможность передать вашу идею красиво и лаконично.",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
  },
  {
    id: 3, username: "@username", title: "Призыв к действию",
    body: "Подписывайтесь, ставьте лайк и делитесь с друзьями ✨",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<MenuId | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [slideFormat, setSlideFormat] = useState<SlideFormat>("carousel");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<SlideTemplate | null>(null);

  // Undo/Redo stacks
  const undoStack = useRef<Slide[][]>([]);
  const redoStack = useRef<Slide[][]>([]);
  const skipHistory = useRef(false);

  const pushUndo = useCallback((prev: Slide[]) => {
    if (skipHistory.current) return;
    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), prev];
    redoStack.current = [];
  }, []);

  const setSlidesWithHistory = useCallback((updater: Slide[] | ((prev: Slide[]) => Slide[])) => {
    setSlides(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next !== prev) pushUndo(prev);
      return next;
    });
  }, [pushUndo]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    setSlides(current => {
      redoStack.current.push(current);
      return prev;
    });
  }, []);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    setSlides(current => {
      undoStack.current.push(current);
      return next;
    });
  }, []);

  const currentSlide = slides[activeSlide];
  const handleUpdateSlide = useCallback((id: number, updates: Partial<Slide>) => {
    setSlidesWithHistory(prev => prev.map(s => {
      if (s.id !== id) return s;
      const merged = { ...s, ...updates };
      if (updates.bgColor && !updates.titleColor) {
        const contrast = getContrastColors(updates.bgColor);
        Object.assign(merged, contrast);
      }
      return merged;
    }));
  }, [setSlidesWithHistory]);

  // Live update without undo history (for slider dragging)
  const handleUpdateSlideLive = useCallback((id: number, updates: Partial<Slide>) => {
    skipHistory.current = true;
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    skipHistory.current = false;
  }, []);

  const handleApplyBgToAll = useCallback(() => {
    if (!currentSlide) return;
    setSlidesWithHistory(prev =>
      prev.map(s => ({
        ...s,
        bgColor: currentSlide.bgColor,
        overlayType: currentSlide.overlayType,
        overlayOpacity: currentSlide.overlayOpacity,
        overlayColor: currentSlide.overlayColor,
      }))
    );
  }, [currentSlide, setSlidesWithHistory]);

  const handleApplyTextToAll = useCallback(() => {
    if (!currentSlide) return;
    setSlidesWithHistory(prev =>
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
  }, [currentSlide, setSlidesWithHistory]);

  const handleApplyInfoToAll = useCallback(() => {
    if (!currentSlide) return;
    setSlidesWithHistory(prev =>
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
  }, [currentSlide, setSlidesWithHistory]);

  const handleApplyTemplate = useCallback((tpl: SlideTemplate) => {
    setActiveTemplate(tpl);
    setSlidesWithHistory(prev => prev.map(s => {
      // Build style-only updates: skip media & text content fields
      const styleOnly = { ...tpl.apply };
      // Preserve user's media if present
      if (s.bgImage || s.bgVideo) {
        delete styleOnly.bgImage;
        delete styleOnly.bgVideo;
        delete (styleOnly as any).bgVideoFile;
        delete styleOnly.bgScale;
        delete styleOnly.bgPosX;
        delete styleOnly.bgPosY;
        delete styleOnly.bgDarken;
        delete styleOnly.bgColor;
        delete styleOnly.bgType;
        delete styleOnly.overlayType;
        delete styleOnly.overlayOpacity;
      }
      // Preserve user's text content (only restyle)
      delete (styleOnly as any).title;
      delete (styleOnly as any).body;

      const updated = { ...s, ...styleOnly };
      // Apply accent to existing title
      if (tpl.accentColor && updated.title) {
        const clean = stripAccentSpans(updated.title);
        if (tpl.accentMode === "highlight") {
          updated.title = clean.replace(/(\S+)(\s*)$/, `<span style="background:${tpl.accentColor};color:#FFFFFF;padding:2px 6px;border-radius:3px">$1</span>$2`);
        } else {
          updated.title = clean.replace(/(\S+)(\s*)$/, `<span style="color:${tpl.accentColor}">$1</span>$2`);
        }
      }
      return updated;
    }));
  }, [setSlidesWithHistory]);

  const handleClosePanel = useCallback(() => {
    setActiveTab(null);
  }, []);

  const handleAddSlide = useCallback((atIndex: number) => {
    const templateProps = activeTemplate?.apply ?? {};
    const getAutoLayout = (index: number): 'default' | 'title-only' | 'quote' => {
      if (index === 0) return 'title-only';
      if (index >= slides.length) return 'quote';
      return 'default';
    };
    const baseSlide: Slide = {
      id: nextId++, username: "@username", title: "Новый слайд", body: "Введите текст...",
      layoutType: getAutoLayout(atIndex),
      bgColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      bgType: "color", hAlign: "left", vAlign: "center",
      overlayType: "none", overlayOpacity: 50,
      bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
      ...templateProps,
    };
    if (activeTemplate?.accentColor && baseSlide.title) {
      const clean = stripAccentSpans(baseSlide.title);
      if (activeTemplate.accentMode === "highlight") {
        baseSlide.title = clean.replace(/(\S+)(\s*)$/, `<span style="background:${activeTemplate.accentColor};color:#FFFFFF;padding:2px 6px;border-radius:3px">$1</span>$2`);
      } else {
        baseSlide.title = clean.replace(/(\S+)(\s*)$/, `<span style="color:${activeTemplate.accentColor}">$1</span>$2`);
      }
    }
    setSlidesWithHistory(prev => { const next = [...prev]; next.splice(atIndex, 0, baseSlide); return next; });
    setActiveSlide(atIndex);
  }, [activeTemplate, setSlidesWithHistory]);

  const handleMoveSlide = useCallback((fromIdx: number, dir: -1 | 1) => {
    setSlidesWithHistory(prev => {
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
  }, [slides.length, setSlidesWithHistory]);

  const handleDuplicateSlide = useCallback((idx: number) => {
    setSlidesWithHistory(prev => {
      const clone = { ...prev[idx], id: nextId++ };
      const next = [...prev]; next.splice(idx + 1, 0, clone); return next;
    });
    setActiveSlide(idx + 1);
  }, [setSlidesWithHistory]);

  const handleDeleteSlide = useCallback((idx: number) => {
    if (slides.length <= 1) return;
    setSlidesWithHistory(prev => prev.filter((_, i) => i !== idx));
    setActiveSlide(prev => Math.min(prev, slides.length - 2));
  }, [slides.length, setSlidesWithHistory]);

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-main overflow-hidden">
      <div className="relative z-10 flex h-[100dvh] flex-col pt-[env(safe-area-inset-top)]">
        <TopBar
          onDownload={() => setDownloadOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.current.length > 0}
          canRedo={redoStack.current.length > 0}
        />
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
            onEditorOpenChange={setTextEditorOpen}
          />
        </main>
      </div>

      <BottomSheet
        activeTab={activeTab}
        onClose={handleClosePanel}
        currentSlide={currentSlide}
        onUpdateSlide={handleUpdateSlide}
        onUpdateSlideLive={handleUpdateSlideLive}
        onApplyBgToAll={handleApplyBgToAll}
        onApplyTextToAll={handleApplyTextToAll}
        onApplyInfoToAll={handleApplyInfoToAll}
        onApplyTemplate={handleApplyTemplate}
        slideFormat={slideFormat}
        onSlideFormatChange={(fmt) => {
          setSlideFormat(fmt);
          if (fmt === "stories") {
            setSlidesWithHistory(prev => prev.map(s => ({ ...s, showUsername: false, showSlideCount: false })));
          }
        }}
      />
      <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} hidden={textEditorOpen} />
      <DownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} slides={slides} slideFormat={slideFormat} activeSlide={activeSlide} onSlideChange={setActiveSlide} />
    </div>
  );
};

export default Index;
