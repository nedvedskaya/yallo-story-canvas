import { useState, useEffect, useRef } from "react";
import type { Slide, SlideType, ComparisonSide } from "@/components/editor/SlideCarousel";
import type { SlideFormat } from "@/components/editor/SizePanel";
import type { SlideTemplate } from "@/components/editor/TemplatesPanel";

/** Raw slide envelope from /api/generation — keys match backend contract. */
interface BotSlide {
  index: number;
  type?: string;
  // shared / legacy
  title?: string;
  body?: string;
  text?: string;
  has_list?: boolean;
  design_hint?: string;
  // typed content
  subtitle?: string;
  highlight?: string;
  accent_text?: string;
  pain_points?: string[];
  items?: string[];
  numbered?: boolean;
  action_hint?: string;
  value?: string;
  caption?: string;
  context?: string;
  author?: string;
  author_role?: string;
  steps?: { label: string; description?: string }[];
  left?: ComparisonSide;
  right?: ComparisonSide;
  time_marker?: string;
  scene?: string;
  emotion?: string;
  sensory_detail?: string;
  name?: string;
  role?: string;
  description?: string;
  stats?: { value: string; label: string }[];
  question?: string;
  image_url?: string;
  annotation?: string;
}

const VALID_TYPES: readonly SlideType[] = [
  'hook', 'problem', 'thesis', 'list', 'cta', 'big_number',
  'quote', 'steps', 'comparison', 'story_moment', 'hero_card',
  'question', 'visual_focus', 'text_block',
] as const;

function coerceType(raw: string | undefined): SlideType {
  if (raw && (VALID_TYPES as readonly string[]).includes(raw)) {
    return raw as SlideType;
  }
  return 'text_block';
}

interface BotResponse {
  token: string;
  format: string;
  slides_count: number;
  slides: BotSlide[];
  author_username: string;
  template: string;
  watermark: boolean;
}

let nextBotId = 1000;

function mapFormat(fmt: string): SlideFormat {
  switch (fmt) {
    case "stories": return "stories";
    case "presentation": return "presentation";
    case "square": return "square";
    default: return "carousel";
  }
}

export function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export function notifyExported(token: string) {
  fetch(`${API_BASE}/generation/exported`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).catch(() => {});
}

export function useBotToken(
  templates: SlideTemplate[],
  onApplyTemplate: (tpl: SlideTemplate) => void,
) {
  const [loading, setLoading] = useState(false);
  const [botSlides, setBotSlides] = useState<Slide[] | null>(null);
  const [botFormat, setBotFormat] = useState<SlideFormat | null>(null);
  const [watermark, setWatermark] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    const token = getTokenFromUrl();
    if (!token || fetched.current) return;
    fetched.current = true;
    tokenRef.current = token;
    setLoading(true);

    fetch(`${API_BASE}/generation?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (!r.ok) throw new Error("bad response");
        return r.json() as Promise<BotResponse>;
      })
      .then(data => {
        const format = mapFormat(data.format);
        // Find minimalism template defaults
        const minTpl = templates.find(t => t.id === "minimalism");
        const tplApply = minTpl?.apply || {};

        const slides: Slide[] = data.slides.map((s) => ({
          id: nextBotId++,
          username: data.author_username || "@username",
          title: s.title || "Заголовок",
          body: s.body || s.text || "",
          bgColor: "#F3F3F3",
          bgType: "color" as const,
          hAlign: "left" as const,
          vAlign: "center" as const,
          overlayType: "grid" as const,
          overlayOpacity: 40,
          bgScale: 100,
          bgPosX: 50,
          bgPosY: 50,
          bgDarken: 0,
          hasList: !!s.has_list,
          titleColor: "#1A1A1A",
          bodyColor: "#1A1A1A",
          metaColor: "#999999",
          overlayColor: "rgba(0,0,0,0.08)",
          showFooter: false,
          showArrow: true,
          showUsername: true,
          showSlideCount: true,
          titleFont: "'Dela Gothic One', sans-serif",
          titleCase: "none",
          bodyFont: "'Inter', sans-serif",
          ...tplApply,
          // Type + type-specific fields (after tplApply so API wins over template defaults).
          type: coerceType(s.type),
          subtitle: s.subtitle,
          highlight: s.highlight,
          accent_text: s.accent_text,
          pain_points: s.pain_points,
          items: s.items,
          numbered: s.numbered,
          action_hint: s.action_hint,
          value: s.value,
          caption: s.caption,
          context: s.context,
          author: s.author,
          author_role: s.author_role,
          steps_items: s.steps,
          comparison_left: s.left,
          comparison_right: s.right,
          time_marker: s.time_marker,
          scene: s.scene,
          emotion: s.emotion,
          sensory_detail: s.sensory_detail,
          hero_name: s.name,
          hero_role: s.role,
          hero_description: s.description,
          hero_stats: s.stats,
          question_text: s.question,
          image_url: s.image_url,
          annotation: s.annotation,
        }));

        setBotSlides(slides);
        setBotFormat(format);
        setWatermark(!!data.watermark);

        // Apply template if specified
        if (data.template) {
          const tpl = templates.find(t => t.id === data.template);
          if (tpl) {
            setTimeout(() => onApplyTemplate(tpl), 100);
          }
        }
      })
      .catch(() => {
        // Silent fail — show default editor
      })
      .finally(() => setLoading(false));
  }, [templates, onApplyTemplate]);

  return { loading, botSlides, botFormat, watermark, token: tokenRef.current };
}
