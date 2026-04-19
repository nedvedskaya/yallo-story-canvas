import type React from "react";
import type { SlideFormat } from "./SizePanel";

export const glassBtnStyle: React.CSSProperties = {
  width: 36, height: 36, color: "#4a4a6a",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

/** "Glass" оболочка вокруг слайд-карточки в карусели. Более крупный blur
 *  и насыщенная saturation, чем у кнопок — чтобы акцентировать рамку превью. */
export const glassCardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1.5px solid rgba(200, 200, 220, 0.5)",
  borderRadius: "0px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
};

export const labelStyle: React.CSSProperties = { color: "rgba(26,26,46,0.5)" };
export const valStyle: React.CSSProperties = { color: "rgba(26,26,46,0.6)" };

/** Дефолтный цвет вторичного/мета-текста (username, footer) на светлом фоне.
 *  Раньше дублировался как `"#999999"` в 5 местах; теперь один источник. */
export const DEFAULT_META_COLOR = "#999999";

/**
 * Design system constants at EXPORT resolution.
 * All values in px at native export size (e.g. 1080px wide for carousel).
 * Preview rendering divides by scale factor; export uses as-is.
 */
export interface FormatDesign {
  /** Safe-zone padding: top, bottom, left, right */
  safeZone: { top: number; bottom: number; left: number; right: number };
  /** Typography sizes */
  titleSize: number;
  bodySize: number;
  bulletSize: number;
  usernameSize: number;
  counterSize: number;
  footerSize: number;
  /** Line heights */
  titleLineHeight: number;
  bodyLineHeight: number;
  bulletLineHeight: number;
  /** Max width as fraction of safe zone width */
  titleMaxWidth: number;
  bodyMaxWidth: number;
  bulletMaxWidth: number;
  /** Gap between title and body */
  titleBodyGap: number;
  /** Bullet vertical spacing */
  bulletGap: number;
  /** Bullet indent */
  bulletIndent: number;
}

export const FORMAT_DESIGN: Record<SlideFormat, FormatDesign> = {
  carousel: {
    safeZone: { top: 80, bottom: 80, left: 80, right: 80 },
    titleSize: 68, bodySize: 38, bulletSize: 36,
    usernameSize: 24, counterSize: 24, footerSize: 22,
    titleLineHeight: 1.05, bodyLineHeight: 1.45, bulletLineHeight: 1.5,
    titleMaxWidth: 0.85, bodyMaxWidth: 0.90, bulletMaxWidth: 0.85,
    titleBodyGap: 32, bulletGap: 18, bulletIndent: 12,
  },
  square: {
    safeZone: { top: 64, bottom: 64, left: 64, right: 64 },
    titleSize: 60, bodySize: 34, bulletSize: 32,
    usernameSize: 22, counterSize: 22, footerSize: 20,
    titleLineHeight: 1.1, bodyLineHeight: 1.45, bulletLineHeight: 1.5,
    titleMaxWidth: 0.85, bodyMaxWidth: 0.90, bulletMaxWidth: 0.85,
    titleBodyGap: 28, bulletGap: 16, bulletIndent: 12,
  },
  stories: {
    safeZone: { top: 120, bottom: 160, left: 60, right: 60 },
    titleSize: 78, bodySize: 44, bulletSize: 40,
    usernameSize: 24, counterSize: 24, footerSize: 22,
    titleLineHeight: 1.05, bodyLineHeight: 1.4, bulletLineHeight: 1.5,
    titleMaxWidth: 0.80, bodyMaxWidth: 0.85, bulletMaxWidth: 0.80,
    titleBodyGap: 36, bulletGap: 20, bulletIndent: 12,
  },
  presentation: {
    safeZone: { top: 60, bottom: 60, left: 80, right: 80 },
    titleSize: 60, bodySize: 30, bulletSize: 30,
    usernameSize: 20, counterSize: 20, footerSize: 18,
    titleLineHeight: 1.1, bodyLineHeight: 1.5, bulletLineHeight: 1.6,
    titleMaxWidth: 0.70, bodyMaxWidth: 0.80, bulletMaxWidth: 0.75,
    titleBodyGap: 28, bulletGap: 18, bulletIndent: 12,
  },
};

/** Get export width for a format */
export function getExportWidth(format: SlideFormat): number {
  switch (format) {
    case "presentation": return 1920;
    default: return 1080;
  }
}

/** Get preview width for a format (matches DownloadModal) */
export function getPreviewWidth(format: SlideFormat): number {
  switch (format) {
    case "stories": return 220;
    case "square": return 270;
    case "presentation": return 380;
    default: return 290;
  }
}

/** Scale factor from preview to export */
export function getScaleFactor(format: SlideFormat): number {
  return getExportWidth(format) / getPreviewWidth(format);
}
