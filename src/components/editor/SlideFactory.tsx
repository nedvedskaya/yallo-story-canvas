/**
 * SlideFactory — dispatches to the correct *Content component based on slide.type.
 *
 * The slide's TYPE drives LAYOUT (hook, big_number, quote, list, steps, ...).
 * The template (Minimalism / Тетрадь / Бордо) drives VISUAL (colors, fonts, decor).
 * These axes are independent — the factory only cares about layout dispatch.
 *
 * Unknown type → falls back to TextBlockContent, so pre-type-system slides and
 * any future types the backend adds ahead of the frontend still render safely.
 */
import React from "react";
import type { Slide, SlideType } from "./SlideCarousel";
import type { SlideFormat } from "./SizePanel";
import type { SlideMetrics } from "./slide-render-model";
import TextBlockContent from "./slide-types/TextBlockContent";
import HookContent from "./slide-types/HookContent";

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
}

/**
 * Dispatch map. Phase 1 registers only `text_block`. As type-specific components
 * land (HookContent, BigNumberContent, ...), register them here — unknown types
 * still fall through to TextBlockContent so partial rollouts are safe.
 */
const CONTENT_MAP: Partial<Record<SlideType, React.FC<SlideContentProps>>> = {
  hook: HookContent,
  text_block: TextBlockContent,
};

export function SlideFactory(props: SlideContentProps) {
  const type: SlideType = props.slide.type || "text_block";
  const Comp = CONTENT_MAP[type] || TextBlockContent;
  return <Comp {...props} />;
}

export default SlideFactory;
