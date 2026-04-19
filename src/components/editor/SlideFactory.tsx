/**
 * SlideFactory — dispatches by (template, layout) pair.
 *
 * Architecture (новая модель, после рефакторинга под layouts):
 *   - `slide.template` задаёт визуальный набор (палитра, шрифты, декор).
 *   - `slide.layout` (1..4) задаёт вёрстку внутри шаблона.
 *   - Контент всегда универсальный: title + body + highlight.
 *   - `slide.type`/items/value/author остаются в типе для back-compat,
 *     но в рендере больше не читаются.
 *
 * Unknown template → TextBlockContent (fallback для legacy без template).
 * Unknown layout внутри Minimalism → MinimalismLayout1.
 */
import React from "react";
import type { Slide, LayoutId } from "./SlideCarousel";
import type { SlideFormat } from "./SizePanel";
import type { SlideMetrics } from "./slide-render-model";
import TextBlockContent from "./slide-types/TextBlockContent";
import MinimalismLayout1 from "./layouts/minimalism/MinimalismLayout1";
import MinimalismLayout2 from "./layouts/minimalism/MinimalismLayout2";
import MinimalismLayout3 from "./layouts/minimalism/MinimalismLayout3";
import MinimalismLayout4 from "./layouts/minimalism/MinimalismLayout4";

export interface SlideContentProps {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  format: SlideFormat;
  /** Scale factor: 1 for preview, exportWidth/previewWidth for export. */
  scale: number;
  metrics: SlideMetrics;
  titleOverrides?: { offsetX?: number; offsetY?: number; scale?: number };
  bodyOverrides?: { offsetX?: number; offsetY?: number; scale?: number };
  editorOpen?: boolean;
  onTitleTouchStart?: (e: React.TouchEvent) => void;
  onTitleTouchMove?: (e: React.TouchEvent) => void;
  onTitleTouchEnd?: () => void;
  onTitleMouseDown?: (e: React.MouseEvent) => void;
  onTitleClick?: () => void;
  onBodyTouchStart?: (e: React.TouchEvent) => void;
  onBodyTouchMove?: (e: React.TouchEvent) => void;
  onBodyTouchEnd?: () => void;
  onBodyMouseDown?: (e: React.MouseEvent) => void;
  onBodyClick?: () => void;
  /** Generic "patch this slide" callback (bound к slide.id в SlideCarousel).
   *  Нужен layouts, которые в UI меняют поля слайда напрямую, минуя BG-panel —
   *  например, photo upload в MinimalismLayout2. undefined для неактивных
   *  слайдов / экспорта (где интерактив не нужен). */
  onSlidePatch?: (patch: Partial<Slide>) => void;
}

const MINIMALISM: Record<LayoutId, React.FC<SlideContentProps>> = {
  1: MinimalismLayout1,
  2: MinimalismLayout2,
  3: MinimalismLayout3,
  4: MinimalismLayout4,
};

export function SlideFactory(props: SlideContentProps) {
  const { slide } = props;

  if (slide.template === "minimalism") {
    const l = (slide.layout ?? 1) as LayoutId;
    const Comp = MINIMALISM[l] || MinimalismLayout1;
    return <Comp {...props} />;
  }

  // fallback для слайдов без template или с неизвестным template
  return <TextBlockContent {...props} />;
}

export default SlideFactory;
