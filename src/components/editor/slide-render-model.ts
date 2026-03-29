/**
 * Single source of truth for all slide style calculations.
 * Used by both SlideFrame (preview) and DownloadModal (export).
 */
import type { Slide } from "./SlideCarousel";
import type { SlideFormat } from "./SizePanel";
import { FORMAT_TEXT_DEFAULTS } from "./shared-styles";

export const H_ALIGN_TO_TEXT: Record<string, string> = { left: "left", center: "center", right: "right" };
export const V_ALIGN_TO_JUSTIFY: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end" };

export interface SlideMetrics {
  padding: number;
  usernameSize: number;
  footerSize: number;
  titleSize: number;
  bodySize: number;
}

/** Get font/padding metrics for a slide, with optional scale factor for export */
export function getSlideMetrics(slide: Slide, format: SlideFormat, scale = 1): SlideMetrics {
  const fmt = FORMAT_TEXT_DEFAULTS[format] || FORMAT_TEXT_DEFAULTS.carousel;
  return {
    padding: fmt.padding * scale,
    usernameSize: fmt.usernameSize * scale,
    footerSize: fmt.footerSize * scale,
    titleSize: (slide.titleSize ?? fmt.titleSize) * scale,
    bodySize: (slide.bodySize ?? fmt.bodySize) * scale,
  };
}

export function getMediaStyle(slide: Slide, overrides?: { posX?: number; posY?: number; scale?: number }): React.CSSProperties {
  const posX = overrides?.posX ?? slide.bgPosX;
  const posY = overrides?.posY ?? slide.bgPosY;
  const sc = overrides?.scale ?? slide.bgScale;
  return {
    position: 'absolute',
    left: `${posX}%`,
    top: `${posY}%`,
    transform: `translate(-50%, -50%) scale(${sc / 100})`,
    transformOrigin: 'center center',
    minWidth: '100%',
    minHeight: '100%',
  };
}

export function getTitleStyle(slide: Slide, metrics: SlideMetrics, overrides?: { offsetX?: number; offsetY?: number; scale?: number }): {
  wrapperStyle: React.CSSProperties;
  textStyle: React.CSSProperties;
} {
  const ox = overrides?.offsetX ?? (slide.titleOffsetX ?? 0);
  const oy = overrides?.offsetY ?? (slide.titleOffsetY ?? 0);
  const sc = overrides?.scale ?? (slide.titleScale ?? 1);
  return {
    wrapperStyle: {
      transform: `translate(${ox}px, ${oy}px) scale(${sc})`,
      transformOrigin: 'center center',
    },
    textStyle: {
      color: slide.titleColor || '#ffffff',
      fontSize: `${metrics.titleSize}px`,
      fontFamily: slide.titleFont || "'Inter', sans-serif",
      textTransform: (slide.titleCase === 'uppercase' ? 'uppercase' : slide.titleCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
      lineHeight: slide.titleLineHeight ?? 1.1,
      letterSpacing: `${(slide.titleLetterSpacing ?? 0)}px`,
      fontWeight: 'bold',
      margin: 0,
    },
  };
}

export function getBodyStyle(slide: Slide, metrics: SlideMetrics, overrides?: { offsetX?: number; offsetY?: number; scale?: number }): {
  wrapperStyle: React.CSSProperties;
  textStyle: React.CSSProperties;
} {
  const ox = overrides?.offsetX ?? (slide.bodyOffsetX ?? 0);
  const oy = overrides?.offsetY ?? (slide.bodyOffsetY ?? 0);
  const sc = overrides?.scale ?? (slide.bodyScale ?? 1);
  return {
    wrapperStyle: {
      transform: `translate(${ox}px, ${oy}px) scale(${sc})`,
      transformOrigin: 'center center',
    },
    textStyle: {
      color: slide.bodyColor || 'rgba(255, 255, 255, 0.85)',
      fontSize: `${metrics.bodySize}px`,
      fontFamily: slide.bodyFont || "'Inter', sans-serif",
      textTransform: (slide.bodyCase === 'uppercase' ? 'uppercase' : slide.bodyCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
      lineHeight: slide.bodyLineHeight ?? 1.5,
      letterSpacing: `${(slide.bodyLetterSpacing ?? 0)}px`,
      fontWeight: 400,
      margin: 0,
    },
  };
}
