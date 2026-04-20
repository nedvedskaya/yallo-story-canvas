import { useState, useCallback, useRef, useEffect } from "react";
import { getContrastColors } from "@/lib/utils";
import TopBar from "@/components/editor/TopBar";
import SlideCarousel from "@/components/editor/SlideCarousel";
import type { Slide, LayoutId } from "@/components/editor/SlideCarousel";
import BottomMenu from "@/components/editor/BottomMenu";
import BottomSheet from "@/components/editor/BottomSheet";
import type { MenuId } from "@/components/editor/BottomMenu";
import type { SlideFormat } from "@/components/editor/SizePanel";
import DownloadModal from "@/components/editor/DownloadModal";
import type { SlideTemplate } from "@/components/editor/TemplatesPanel";
import { TEMPLATES } from "@/components/editor/TemplatesPanel";
import { useBotToken, getTokenFromUrl, notifyExported } from "@/hooks/use-bot-token";
import { usePersistentSlides, usePersistentFormat, usePersistentActiveSlide } from "@/hooks/use-persistent-slides";
import { stripHtml } from "@/components/editor/layouts/shared";
import { wrapLastWordAsAccent } from "@/lib/accent";
import { pickApplyPatch } from "@/lib/slide-apply";
import { BG_APPLY_KEYS } from "@/components/editor/BackgroundPanel";
import { TEXT_APPLY_KEYS } from "@/components/editor/TextPanel";
import { INFO_APPLY_KEYS } from "@/components/editor/InfoPanel";
import { MINIMALISM_ACCENT, MINIMALISM_TITLE_FONT, MINIMALISM_BODY_FONT } from "@/components/editor/layouts/minimalism/tokens";
import { DEFAULT_META_COLOR } from "@/components/editor/shared-styles";


let nextId = 2;

const MAX_UNDO = 50;

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
  // Когда SlideCarousel сообщает клик на конкретной секции (title/body),
  // мы открываем Text-панель и прокидываем нужный initialSection внутрь
  // TextPanel. Nonce используется, чтобы TextPanel перевыставлял вкладку даже
  // на повторные клики подряд (иначе `initialSection` не меняется и effect
  // не стреляет).
  const [textSection, setTextSection] = useState<{ section: 'title' | 'body'; nonce: number } | null>(null);
  const handleOpenTextSection = useCallback((section: 'title' | 'body') => {
    setActiveTab('text');
    setTextSection({ section, nonce: Date.now() });
  }, []);
  const [activeSlide, setActiveSlide] = usePersistentActiveSlide(0);
  const [slides, setSlides] = usePersistentSlides(initialSlides);
  const [slideFormat, setSlideFormat] = usePersistentFormat("carousel");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<SlideTemplate | null>(null);

  // Миграция persistent-state. Две ветки:
  //   (a) Слайды со старого Minimalism (bgPattern='dots' + accentColor='#CDE0FA',
  //       но без template='minimalism') — добавляем template, гасим точки.
  //   (b) Для всех слайдов с template='minimalism' принудительно обновляем
  //       titleFont (если Dela Gothic One остался от initialSlide-default) и
  //       чистим старые inline-span HTML-highlight'ы в title (убираем
  //       color:#FFFFFF и border-radius:3px от прошлых версий — делаем их pill).
  // Также восстанавливаем activeTemplate, чтобы handleAddSlide создавал новые
  // слайды с Minimalism-стилем. Запускается один раз при старте.
  useEffect(() => {
    // КРИТИЧНО: nextId — module-level `let nextId = 2`. При загрузке из
    // localStorage слайды имеют id=1,2,3,…, а nextId сбрасывается в 2 →
    // handleAddSlide/Duplicate выдаёт ДУБЛИКАТ существующего id, и react
    // `.map(s => s.id === id ? …)` в handleUpdateSlide задевает ДВА слайда
    // разом (симптом: «первые два слайда минимализм обновляются одинаково»).
    // Поднимаем nextId за максимальный существующий id + ДЕДУПЛИЦИРУЕМ
    // уже существующие коллизии: если два слайда имеют одинаковый id,
    // второму и последующим выдаём свежий nextId++.
    setSlides(prev => {
      const maxId = prev.reduce((m, s) => (s.id > m ? s.id : m), 0);
      if (nextId <= maxId) nextId = maxId + 1;
      const seen = new Set<number>();
      let hasDuplicates = false;
      const deduped = prev.map(s => {
        if (seen.has(s.id)) {
          hasDuplicates = true;
          const newId = nextId++;
          seen.add(newId);
          return { ...s, id: newId };
        }
        seen.add(s.id);
        return s;
      });
      return hasDuplicates ? deduped : prev;
    });
    let anyMinimalism = false;
    setSlides(prev => {
      let changed = false;
      const migrated = prev.map(s => {
        const looksOldMinimalism = s.bgPattern === 'dots' && s.accentColor === MINIMALISM_ACCENT;
        const isMinimalism = s.template === 'minimalism' || looksOldMinimalism;
        if (!isMinimalism) return s;
        anyMinimalism = true;

        // Единый стиль Minimalism: всегда принудительно Marvin Visions для
        // заголовка и Inter для основного текста. Ольга: «сделай единый стиль
        // у шаблона Минимализм». Любые ранее сохранённые кастомные шрифты на
        // slide-уровне (Dela Gothic One, Space Grotesk и т.п.) сбрасываются
        // в template-дефолт — пользователь может поменять вручную через Text-панель.
        const nextTitleFont = MINIMALISM_TITLE_FONT;
        const nextBodyFont = MINIMALISM_BODY_FONT;

        // Чистим старый HTML-highlight (color:#FFFFFF, border-radius:3px) в title.
        // Заменяем на pill-стиль (border-radius:999, без color).
        // Дополнительно: убираем inline font-family и font-size из любых span'ов
        // в title — они могли попасть через InlineTextEditor и перекрывают
        // шрифт h1-обёртки. Шрифт должен приходить ТОЛЬКО от layout-компонента.
        let nextTitle = s.title || '';
        if (nextTitle.includes('<span') && nextTitle.includes('background:')) {
          nextTitle = nextTitle
            .replace(/color:\s*#FFFFFF\s*;?/gi, '')
            .replace(/border-radius:\s*3px/gi, 'border-radius:999px')
            .replace(/padding:\s*2px\s+6px/gi, 'padding:0.08em 0.15em 0.12em')
            // Мигрируем все прошлые варианты padding → новый em-based.
            .replace(/padding:\s*0\.08em\s+(?:14px|8px)\s+0\.12em/gi, 'padding:0.08em 0.15em 0.12em');
        }
        // Чистим все источники «чужого» шрифта в title, чтобы layout-обёртка
        // применяла MINIMALISM_TITLE_FONT (Marvin Visions) единообразно:
        //   1) inline style="font-family:..." / "font-size:..." в любых спанах
        //   2) deprecated <font face="..." size="..."> теги (вставляет
        //      document.execCommand('fontName') в InlineTextEditor)
        // Регекс для font-family/size — по ; или концу style (style value не
        // содержит двойных кавычек, значит [^;]+ безопасен).
        if (nextTitle.includes('<span') || nextTitle.includes('<font')) {
          nextTitle = nextTitle
            .replace(/font-family\s*:[^;"]*;?/gi, '')
            .replace(/font-size\s*:[^;"]*;?/gi, '')
            // <font face="X" size="Y">...</font> → просто инлайн-содержимое
            .replace(/<font\b[^>]*>/gi, '')
            .replace(/<\/font>/gi, '');
        }

        // Без type='hook' Minimalism-слайды рендерятся как text_block
        // (vAlign:end = текст внизу) — это расходилось с hook-layout'ом
        // в редакторе. Ставим hook для старых сохранённых слайдов, чтобы
        // они поднялись на top:48% с pill-подсветкой.
        const nextType = s.type || 'hook';

        // Новая архитектура — layout. Старые сохранённые слайды приходят
        // без layout; назначаем 1 (hero-hook эталон), чтобы визуально ничего
        // не менялось. Юзер может переключить кнопкой Shuffle.
        const nextLayout: LayoutId = (s.layout ?? 1) as LayoutId;

        const patched = {
          ...s,
          template: 'minimalism' as const,
          type: nextType,
          layout: nextLayout,
          bgPattern: (looksOldMinimalism ? 'none' : s.bgPattern) as typeof s.bgPattern,
          titleFont: nextTitleFont,
          bodyFont: nextBodyFont,
          title: nextTitle,
        };
        if (
          patched.template !== s.template ||
          patched.type !== s.type ||
          patched.layout !== s.layout ||
          patched.bgPattern !== s.bgPattern ||
          patched.titleFont !== s.titleFont ||
          patched.bodyFont !== s.bodyFont ||
          patched.title !== s.title
        ) {
          changed = true;
        }
        return patched;
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
  // Version counter — бьётся при push/pop стеков, чтобы React сделал
  // re-render и кнопки Undo/Redo перечитали `.current.length` (сами refs
  // не триггерят рендер). canUndo/canRedo читается от ref'ов после bump.
  const [, bumpHistory] = useState(0);
  const bump = useCallback(() => bumpHistory(v => v + 1), []);

  const pushUndo = useCallback((prev: Slide[]) => {
    if (skipHistory.current) return;
    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), prev];
    redoStack.current = [];
    bump();
  }, [bump]);

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
    bump();
  }, [bump]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    setSlides(current => {
      undoStack.current.push(current);
      return next;
    });
    bump();
  }, [bump]);

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

  // Универсальная фабрика: "применить <keys> ко всем". Списки ключей живут
  // рядом с соответствующими панелями (BG_APPLY_KEYS в BackgroundPanel.tsx и т.д.),
  // чтобы при добавлении нового контрола правилось в одном месте.
  const applyPatchToAll = useCallback((keys: readonly (keyof Slide)[]) => {
    if (!currentSlide) return;
    const patch = pickApplyPatch(currentSlide, keys);
    setSlidesWithHistory(prev => prev.map(s => ({ ...s, ...patch })));
  }, [currentSlide, setSlidesWithHistory]);

  const handleApplyBgToAll = useCallback(() => applyPatchToAll(BG_APPLY_KEYS), [applyPatchToAll]);
  const handleApplyTextToAll = useCallback(() => applyPatchToAll(TEXT_APPLY_KEYS), [applyPatchToAll]);
  const handleApplyInfoToAll = useCallback(() => applyPatchToAll(INFO_APPLY_KEYS), [applyPatchToAll]);

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
      // Циклично раскидываем layout 1→2→3→4→1… при применении шаблона,
      // чтобы карусель из N слайдов выглядела разнообразно даже с одним
      // шаблоном. Пользователь может потом руками переключить layout
      // любого слайда кнопкой Shuffle.
      if (tpl.id === 'minimalism') {
        updated.layout = (((idx % 4) + 1) as LayoutId);
        // Layout 4 (Minimalism) вёрстка предполагает текст «над плашкой»
        // (slide.subtitle) + текст «внутри плашки» (slide.body). Чтобы
        // оба блока сразу были доступны пользователю в TextPanel и в
        // отрисовке, инициализируем subtitle пустой строкой, если он
        // ещё не задан. Непустой — уважаем (пользователь мог ввести).
        if (updated.layout === 4 && typeof updated.subtitle !== 'string') {
          updated.subtitle = "";
        }
        // Layout 3 дефолтно показывает halftone-точки в bottom-right. Это
        // декоративный элемент — пользователь может его скрыть через BG-панель
        // → «Декоративные элементы». Другие layouts получают decorDots='none'
        // (равно скрыто), чтобы декор не тащился при Shuffle-переключении.
        updated.decorDots = updated.layout === 3 ? 'halftone' : 'none';
      }
      // Apply accent to existing title (only on non-cover slides; cover keeps clean look).
      // highlight-mode: цвет текста не перекрываем (наследует titleColor), плашка —
      // полная pill (border-radius:999 + padding как в HookContent), чтобы совпадало
      // с эталоном-референсом.
      if (tpl.accentColor && updated.title && idx !== 0) {
        const clean = stripHtml(updated.title);
        updated.title = wrapLastWordAsAccent(clean, tpl.accentColor, tpl.accentMode ?? "highlight");
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

  // Стикеры во время drag'а апдейтятся 60 раз/сек — пушить каждый tick в undo
  // было бы бессмысленно. Используем trailing-debounce: первый update запоминает
  // pre-drag snapshot; следующие tick'и только сбрасывают таймер; когда 400мс
  // нет новых апдейтов — drag считается завершённым, pre-drag snapshot идёт в
  // undoStack. Один тап на стикер и одно перетаскивание = одна запись в истории.
  const stickerDragRef = useRef<{ slides: Slide[]; timer: number } | null>(null);
  const handleUpdateSticker = useCallback((stickerId: string, updates: Partial<{x:number;y:number;scale:number;rotation:number}>) => {
    if (!currentSlide) return;
    setSlides(prev => {
      if (!stickerDragRef.current) {
        stickerDragRef.current = { slides: prev, timer: 0 };
      }
      const snap = stickerDragRef.current;
      if (snap.timer) window.clearTimeout(snap.timer);
      snap.timer = window.setTimeout(() => {
        if (stickerDragRef.current) {
          undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), stickerDragRef.current.slides];
          redoStack.current = [];
          stickerDragRef.current = null;
          bump();
        }
      }, 400);
      return prev.map(s =>
        s.id === currentSlide.id
          ? { ...s, stickers: (s.stickers || []).map(st => st.id === stickerId ? { ...st, ...updates } : st) }
          : s
      );
    });
  }, [currentSlide, bump]);

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
      metaColor: DEFAULT_META_COLOR,
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
      baseSlide.title = wrapLastWordAsAccent(clean, activeTemplate.accentColor, activeTemplate.accentMode ?? "highlight");
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
            onOpenTextSection={handleOpenTextSection}
            watermark={watermark ? "Создано в @yalokontent_bot" : undefined}
          />
        </main>
      </div>

      <BottomSheet
        activeTab={activeTab}
        onClose={handleClosePanel}
        currentSlide={currentSlide}
        textInitialSection={textSection?.section}
        textInitialNonce={textSection?.nonce}
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
