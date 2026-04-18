import type { SlideFormat } from "@/components/editor/SizePanel";

/**
 * Adaptive title sizing based on word count.
 * Returns size in EXPORT pixels (the same unit as FORMAT_DESIGN.titleSize).
 * The render layer scales it down for preview automatically.
 */

const TITLE_SIZE_BY_FORMAT: Record<SlideFormat, { short: number; medium: number; long: number }> = {
  carousel:     { short: 96,  medium: 72, long: 56 },
  square:       { short: 88,  medium: 64, long: 50 },
  stories:      { short: 110, medium: 84, long: 64 },
  presentation: { short: 84,  medium: 64, long: 48 },
};

const BODY_SIZE_BY_FORMAT: Record<SlideFormat, { short: number; medium: number; long: number }> = {
  carousel:     { short: 44, medium: 38, long: 32 },
  square:       { short: 40, medium: 34, long: 28 },
  stories:      { short: 50, medium: 44, long: 36 },
  presentation: { short: 36, medium: 30, long: 26 },
};

function countWords(text: string): number {
  if (!text) return 0;
  // Strip HTML tags, count remaining words
  const plain = text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  return plain.trim().split(/\s+/).filter(Boolean).length;
}

export function getAdaptiveTitleSize(text: string, format: SlideFormat): number {
  const sizes = TITLE_SIZE_BY_FORMAT[format] || TITLE_SIZE_BY_FORMAT.carousel;
  const words = countWords(text);
  if (words <= 3) return sizes.short;
  if (words <= 6) return sizes.medium;
  return sizes.long;
}

export function getAdaptiveBodySize(text: string, format: SlideFormat): number {
  const sizes = BODY_SIZE_BY_FORMAT[format] || BODY_SIZE_BY_FORMAT.carousel;
  const words = countWords(text);
  if (words <= 8) return sizes.short;
  if (words <= 20) return sizes.medium;
  return sizes.long;
}
