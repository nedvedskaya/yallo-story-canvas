import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastColors(bgColor: string) {
  const hexMatches = bgColor.match(/#[0-9a-fA-F]{6}/g);
  if (!hexMatches || hexMatches.length === 0) {
    return {
      titleColor: '#ffffff',
      bodyColor: 'rgba(255,255,255,0.85)',
      metaColor: 'rgba(255,255,255,0.7)',
      overlayColor: 'rgba(255,255,255,0.25)',
    };
  }

  const avgLuminance = hexMatches.reduce((sum, hex) => sum + getLuminance(hex), 0) / hexMatches.length;
  const isLight = avgLuminance > 0.45;

  return isLight
    ? {
        titleColor: '#1A1A1A',
        bodyColor: '#1A1A1A',
        metaColor: '#999999',
        overlayColor: 'rgba(0,0,0,0.08)',
      }
    : {
        titleColor: '#ffffff',
        bodyColor: 'rgba(255,255,255,0.85)',
        metaColor: 'rgba(255,255,255,0.7)',
        overlayColor: 'rgba(255,255,255,0.25)',
      };
}
