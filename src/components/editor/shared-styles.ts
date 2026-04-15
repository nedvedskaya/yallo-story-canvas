import type React from "react";
import type { SlideFormat } from "./SizePanel";

export const glassBtnStyle: React.CSSProperties = {
  width: 36, height: 36, color: "#4a4a6a",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

export const labelStyle: React.CSSProperties = { color: "rgba(26,26,46,0.5)" };
export const valStyle: React.CSSProperties = { color: "rgba(26,26,46,0.6)" };

// Format-specific text defaults
export const FORMAT_TEXT_DEFAULTS: Record<SlideFormat, { titleSize: number; bodySize: number; padding: number; usernameSize: number; footerSize: number }> = {
  carousel:     { titleSize: 18, bodySize: 10, padding: 20, usernameSize: 8, footerSize: 7 },
  square:       { titleSize: 16, bodySize: 10, padding: 18, usernameSize: 8, footerSize: 7 },
  stories:      { titleSize: 14, bodySize: 9, padding: 24, usernameSize: 8, footerSize: 7 },
  presentation: { titleSize: 16, bodySize: 10, padding: 16, usernameSize: 7, footerSize: 6 },
};

// Scale format defaults to export pixel size
export function getExportTextDefaults(format: SlideFormat, exportWidth: number, previewWidth: number) {
  const base = FORMAT_TEXT_DEFAULTS[format];
  const scale = exportWidth / previewWidth;
  return {
    titleSize: base.titleSize * scale,
    bodySize: base.bodySize * scale,
    padding: base.padding * scale,
    usernameSize: base.usernameSize * scale,
    footerSize: base.footerSize * scale,
  };
}
