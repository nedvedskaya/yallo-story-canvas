/**
 * Single source of truth for all slide style calculations.
 * Used by both SlideFrame (preview) and DownloadModal (export).
 */
import type { Slide } from "./SlideCarousel";
import type { SlideFormat } from "./SizePanel";
import { FORMAT_DESIGN, getPreviewWidth, getExportWidth } from "./shared-styles";
import { getAdaptiveTitleSize, getAdaptiveBodySize } from "@/lib/text-sizing";

export const H_ALIGN_TO_TEXT: Record<string, string> = { left: "left", center: "center", right: "right" };
export const V_ALIGN_TO_JUSTIFY: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end" };

export interface SlideMetrics {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  usernameSize: number;
  counterSize: number;
  footerSize: number;
  titleSize: number;
  bodySize: number;
  bulletSize: number;
  titleLineHeight: number;
  bodyLineHeight: number;
  bulletLineHeight: number;
  titleMaxWidth: number;
  bodyMaxWidth: number;
  bulletMaxWidth: number;
  titleBodyGap: number;
  bulletGap: number;
  bulletIndent: number;
  /** For legacy compat */
  padding: number;
  /** Effective render scale: (previewW / exportW) * scale.
   *  Multiply any design-spec (export-resolution) px value by renderScale
   *  to get the correct preview/export px. Used by slide-type components
   *  that hard-code reference values (e.g. Minimalism Hook: 88 title, 28 subtitle). */
  renderScale: number;
}

/**
 * Get slide metrics at rendered resolution.
 *
 * @param slide - slide data (titleSize/bodySize are in PREVIEW px if set by user)
 * @param format - slide format
 * @param scale - legacy scale: 1 for preview, exportWidth/previewWidth for export.
 *                Used to scale user-set titleSize/bodySize overrides.
 */
export function getSlideMetrics(slide: Slide, format: SlideFormat, scale = 1): SlideMetrics {
  const d = FORMAT_DESIGN[format] || FORMAT_DESIGN.carousel;
  const exportW = getExportWidth(format);
  const previewW = getPreviewWidth(format);
  const renderScale = (previewW / exportW) * scale;

  // Adaptive default sizes (export-resolution px) based on word count
  const adaptiveTitle = getAdaptiveTitleSize(slide.title || "", format);
  const adaptiveBody = getAdaptiveBodySize(slide.body || "", format);

  return {
    paddingTop: d.safeZone.top * renderScale,
    paddingBottom: d.safeZone.bottom * renderScale,
    paddingLeft: d.safeZone.left * renderScale,
    paddingRight: d.safeZone.right * renderScale,
    usernameSize: d.usernameSize * renderScale,
    counterSize: d.counterSize * renderScale,
    footerSize: d.footerSize * renderScale,
    // If user set titleSize (preview px), scale by `scale`. Otherwise use adaptive.
    titleSize: slide.titleSize != null ? slide.titleSize * scale : adaptiveTitle * renderScale,
    bodySize: slide.bodySize != null ? slide.bodySize * scale : adaptiveBody * renderScale,
    bulletSize: d.bulletSize * renderScale,
    titleLineHeight: slide.titleLineHeight ?? d.titleLineHeight,
    bodyLineHeight: slide.bodyLineHeight ?? d.bodyLineHeight,
    bulletLineHeight: d.bulletLineHeight,
    titleMaxWidth: d.titleMaxWidth,
    bodyMaxWidth: d.bodyMaxWidth,
    bulletMaxWidth: d.bulletMaxWidth,
    titleBodyGap: d.titleBodyGap * renderScale,
    bulletGap: d.bulletGap * renderScale,
    bulletIndent: d.bulletIndent * renderScale,
    padding: ((d.safeZone.top + d.safeZone.bottom + d.safeZone.left + d.safeZone.right) / 4) * renderScale,
    renderScale,
  };
}

/** Единая формула media-стиля для preview и export.
 *  Раньше было две ветки (% в preview через scale-transform, абсолютные px в
 *  export через width/height) — они расходились на bgScale≠100 и non-center
 *  posY, поэтому «элементы съезжали» при экспорте PNG/PDF. Теперь везде %:
 *  width/height = bgScale% от контейнера, позиция = bgPosX%/bgPosY% от
 *  контейнера, translate(-50%, -50%) центрирует изображение по точке.
 *  object-fit:cover сохраняет aspect ratio, обрезая переполнение. */
export function getMediaStyle(
  slide: Slide,
  overrides?: { posX?: number; posY?: number; scale?: number },
  _containerWidth?: number,
  _containerHeight?: number,
): React.CSSProperties {
  const posX = overrides?.posX ?? slide.bgPosX;
  const posY = overrides?.posY ?? slide.bgPosY;
  const sc = overrides?.scale ?? slide.bgScale;

  return {
    position: 'absolute',
    left: `${posX}%`,
    top: `${posY}%`,
    width: `${sc}%`,
    height: `${sc}%`,
    transform: 'translate(-50%, -50%)',
    objectFit: 'cover' as const,
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
      maxWidth: `${metrics.titleMaxWidth * 100}%`,
    },
    textStyle: {
      color: slide.titleColor || '#ffffff',
      fontSize: `${metrics.titleSize}px`,
      fontFamily: slide.titleFont || "'Inter', sans-serif",
      textTransform: (slide.titleCase === 'uppercase' ? 'uppercase' : slide.titleCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
      lineHeight: metrics.titleLineHeight,
      letterSpacing: `${(slide.titleLetterSpacing ?? 0)}px`,
      fontWeight: 'bold',
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      overflow: 'hidden',
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
      maxWidth: `${metrics.bodyMaxWidth * 100}%`,
    },
    textStyle: {
      color: slide.bodyColor || 'rgba(255, 255, 255, 0.85)',
      fontSize: `${metrics.bodySize}px`,
      fontFamily: slide.bodyFont || "'Inter', sans-serif",
      textTransform: (slide.bodyCase === 'uppercase' ? 'uppercase' : slide.bodyCase === 'lowercase' ? 'lowercase' : 'none') as React.CSSProperties['textTransform'],
      lineHeight: metrics.bodyLineHeight,
      letterSpacing: `${(slide.bodyLetterSpacing ?? 0)}px`,
      fontWeight: 400,
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      overflow: 'hidden',
    },
  };
}
