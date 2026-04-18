import { useState, useEffect, useRef } from "react";
import type { Slide } from "@/components/editor/SlideCarousel";
import type { SlideFormat } from "@/components/editor/SizePanel";

const SLIDES_KEY = "yalo-slides-v1";
const FORMAT_KEY = "yalo-format-v1";
const ACTIVE_KEY = "yalo-active-v1";

/** Strip non-serializable / blob: media from a slide before saving */
function sanitizeForStorage(slide: Slide): Slide {
  const copy: any = { ...slide };
  if (copy.bgImage && typeof copy.bgImage === "string" && copy.bgImage.startsWith("blob:")) {
    delete copy.bgImage;
  }
  if (copy.bgVideo && typeof copy.bgVideo === "string" && copy.bgVideo.startsWith("blob:")) {
    delete copy.bgVideo;
  }
  if (copy.bgVideoFile) delete copy.bgVideoFile;
  // Sanitize stickers (often blob: URLs from uploaded files)
  if (Array.isArray(copy.stickers)) {
    copy.stickers = copy.stickers.filter(
      (s: any) => s?.src && !(typeof s.src === "string" && s.src.startsWith("blob:"))
    );
  }
  return copy;
}

function restoreFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Persist slides to localStorage. Skips persistence if a `?token=` URL param is
 * present (bot-generated content takes precedence).
 */
export function usePersistentSlides(initial: Slide[]) {
  const skipPersist = useRef(false);

  // If a token is in URL, do not restore from localStorage — bot will populate.
  const hasToken = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("token");

  const [slides, setSlides] = useState<Slide[]>(() => {
    if (hasToken) return initial;
    const saved = restoreFromStorage<Slide[] | null>(SLIDES_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    return initial;
  });

  useEffect(() => {
    if (skipPersist.current) return;
    try {
      const sanitized = slides.map(sanitizeForStorage);
      localStorage.setItem(SLIDES_KEY, JSON.stringify(sanitized));
    } catch {
      // Quota or serialization failure — ignore
    }
  }, [slides]);

  return [slides, setSlides] as const;
}

export function usePersistentFormat(initial: SlideFormat) {
  const hasToken = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("token");

  const [format, setFormat] = useState<SlideFormat>(() => {
    if (hasToken) return initial;
    return restoreFromStorage<SlideFormat>(FORMAT_KEY, initial);
  });

  useEffect(() => {
    try { localStorage.setItem(FORMAT_KEY, JSON.stringify(format)); } catch {}
  }, [format]);

  return [format, setFormat] as const;
}

export function usePersistentActiveSlide(initial: number) {
  const [active, setActive] = useState<number>(() => {
    return restoreFromStorage<number>(ACTIVE_KEY, initial);
  });

  useEffect(() => {
    try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(active)); } catch {}
  }, [active]);

  return [active, setActive] as const;
}

export function clearPersistedSlides() {
  try {
    localStorage.removeItem(SLIDES_KEY);
    localStorage.removeItem(FORMAT_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}
