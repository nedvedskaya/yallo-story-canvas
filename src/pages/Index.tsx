import { useState, useCallback, useRef, useEffect } from "react";
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
import { TEMPLATES } from "@/components/editor/TemplatesPanel";
import { useBotToken, getTokenFromUrl, notifyExported } from "@/hooks/use-bot-token";
import { usePersistentSlides, usePersistentFormat, usePersistentActiveSlide } from "@/hooks/use-persistent-slides";


let nextId = 2;

const MAX_UNDO = 50;

/** Strip all inline-style spans from HTML */
/** Strip ALL HTML tags, returning plain text */
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const initialSlides: Slide[] = [
  {
    id: 1, username: "@username", title: "Заголовок",
    body: "Текст слайда",
    bgColor: "#1A1A1A",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "grid", overlayOpacity: 18,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
    titleColor: "#FFFFFF",
    bodyColor: "rgba(255,255,255,0.85)",
    metaColor: "rgba(255,255,255,0.5)",
    overlayColor: "rgba(255,255,255,0.08)",
    showFooter: false,
    showArrow: true,
    showUsername: true,
    showSlideCount: true,
    titleFont: "'Dela Gothic One', sans-serif",
    titleCase: "none",
    bodyFont: "'Inter', sans-serif",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<MenuId | null>(null);
  const [activeSlide, setActiveSlide] = usePersistentActiveSlide(0);
  const [slides, setSlides] = usePersistentSlides(initialSlides);
  const [slideFormat, setSlideFormat] = usePersistentFormat("carousel");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<SlideTemplate | null>(null);

  // Миграция persistent-state: слайды, созданные до введения `slide.template`,
  // остались с bgPattern:'dots' + titleFont:Dela Gothic, без template-флага.
  // Если у слайда стоит характерный признак старого Minimalism (bgPattern='dots'
  // + accentColor='#CDE0FA'), промечаем его как template='minimalism', сбрасываем
  // точечный паттерн (пользователь может включить его заново через BG panel)
  // и форсим Marvin-стек шрифтов. Заодно восстанавливаем activeTemplate, чтобы
  // handleAddSlide создавал новые слайды с Minimalism-стилем. Запускается один
  // раз при старте.
  useEffect(() => {
    let anyMinimalism = false;
    setSlides(prev => {
      let changed = false;
      const migrated = prev.map(s => {
        const oldMinimalism = s.bgPattern === 'dots' && s.accentColor === '#CDE0FA';
        if (s.template === 'minimalism') anyMinimalism = true;
        if (!oldMinimalism || s.template === 'minimalism') return s;
        anyMinimalism = true;
        changed = true;
        return {
          ...s,
          template: 'minimalism' as const,
          bgPattern: 'none' as const,
          titleFont: s.titleFont === "'Dela Gothic One', sans-serif"
            ? "'Marvin Visions', 'Space Grotesk', 'Inter', sans-serif"
            : s.titleFont,
        };
      });
      return changed ? migrated : prev;
    });
    if (anyMinimalism) {
      const tpl = TEMPLATES.find(t => t.id === "minimalism");
      if (tpl) setActiveTemplate(tpl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const safeActiveSlide = Math.max(0, Math.min(activeSlide, slides.length - 1));
  const currentSlide = slides[safeActiveSlide];
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
    setSlidesWithHistory(prev => prev.map((s, idx) => {
      // Build style-only updates: skip media & text content fields
      const baseApply = idx === 0 && tpl.coverApply
        ? { ...tpl.apply, ...tpl.coverApply }
        : { ...tpl.apply };
      const styleOnly: Partial<Slide> = { ...baseApply };
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
      // Apply accent to existing title (only on non-cover slides; cover keeps clean look).
      // highlight-mode: цвет текста НЕ перекрываем — пусть наследует titleColor,
      // чтобы выделенное слово читалось в цвет остального заголовка (а не белым).
      if (tpl.accentColor && updated.title && idx !== 0) {
        const clean = stripHtml(updated.title);
        if (tpl.accentMode === "highlight") {
          updated.title = clean.replace(/(\S+)(\s*)$/, `<span style="background:${tpl.accentColor};padding:2px 6px;border-radius:3px">$1</span>$2`);
        } else {
          updated.title = clean.replace(/(\S+)(\s*)$/, `<span style="color:${tpl.accentColor}">$1</span>$2`);
        }
      }
      return updated;
    }));
  }, [setSlidesWithHistory]);

  // Bot token loading
  const { botSlides, botFormat, watermark } = useBotToken(TEMPLATES, handleApplyTemplate);

  useEffect(() => {
    if (botSlides) {
      setSlides(botSlides);
      setActiveSlide(0);
    }
  }, [botSlides]);

  useEffect(() => {
    if (botFormat) {
      setSlideFormat(botFormat);
    }
  }, [botFormat]);

  const handleClosePanel = useCallback(() => {
    setActiveTab(null);
  }, []);

  const handleAddSticker = useCallback((src: string, width: number, height: number) => {
    if (!currentSlide) return;
    const sticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      src, x: 50, y: 50, scale: 1, rotation: 0, width, height,
    };
    setSlidesWithHistory(prev => prev.map(s =>
      s.id === currentSlide.id ? { ...s, stickers: [...(s.stickers || []), sticker] } : s
    ));
  }, [currentSlide, setSlidesWithHistory]);

  const handleDeleteSticker = useCallback((stickerId: string) => {
    if (!currentSlide) return;
    setSlidesWithHistory(prev => prev.map(s =>
      s.id === currentSlide.id ? { ...s, stickers: (s.stickers || []).filter(st => st.id !== stickerId) } : s
    ));
  }, [currentSlide, setSlidesWithHistory]);

  const handleUpdateSticker = useCallback((stickerId: string, updates: Partial<{x:number;y:number;scale:number;rotation:number}>) => {
    if (!currentSlide) return;
    setSlides(prev => prev.map(s =>
      s.id === currentSlide.id ? { ...s, stickers: (s.stickers || []).map(st => st.id === stickerId ? { ...st, ...updates } : st) } : s
    ));
  }, [currentSlide]);

  const handleAddSlide = useCallback((atIndex: number) => {
    const isCover = atIndex === 0;
    const templateProps = activeTemplate
      ? (isCover && activeTemplate.coverApply
          ? { ...activeTemplate.apply, ...activeTemplate.coverApply }
          : { ...activeTemplate.apply })
      : {};
    const baseSlide: Slide = {
      id: nextId++, username: "@username", title: "Новый слайд", body: "Введите текст...",
      bgColor: "#F3F3F3",
      bgType: "color", hAlign: "left", vAlign: "center",
      overlayType: "grid", overlayOpacity: 40,
      bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
      titleColor: "#1A1A1A",
      bodyColor: "#1A1A1A",
      metaColor: "#999999",
      overlayColor: "rgba(0,0,0,0.08)",
      showFooter: false,
      showArrow: true,
      showUsername: true,
      showSlideCount: true,
      titleFont: "'Dela Gothic One', sans-serif",
      titleCase: "none",
      bodyFont: "'Inter', sans-serif",
      ...templateProps,
    };
    if (activeTemplate?.accentColor && baseSlide.title && !isCover) {
      const clean = stripHtml(baseSlide.title);
      if (activeTemplate.accentMode === "highlight") {
        // Не перекрываем цвет текста — наследуется от titleColor.
        baseSlide.title = clean.replace(/(\S+)(\s*)$/, `<span style="background:${activeTemplate.accentColor};padding:2px 6px;border-radius:3px">$1</span>$2`);
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
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            watermark={watermark ? "Создано в @yalokontent_bot" : undefined}
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
          setSlidesWithHistory(prev => prev.map(s => ({
            ...s,
            titleSize: undefined,
            bodySize: undefined,
            ...(fmt === "stories" ? { showUsername: false, showSlideCount: false } : {}),
          })));
        }}
        onAddSticker={handleAddSticker}
        onDeleteSticker={handleDeleteSticker}
      />
      <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} hidden={textEditorOpen} />
      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        slides={slides}
        slideFormat={slideFormat}
        activeSlide={activeSlide}
        onSlideChange={setActiveSlide}
        onExported={() => {
          const token = getTokenFromUrl();
          if (token) notifyExported(token);
        }}
        watermark={watermark ? "Создано в @yalokontent_bot" : undefined}
      />
      
    </div>
  );
};

export default Index;
