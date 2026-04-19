import type { Slide } from "./SlideCarousel";
// Reference: standalone HookSlide component (1080×1350 fixed) lives at ./HookSlide.jsx.
// The template below configures editable slides to visually match HookSlide.

export interface SlideTemplate {
  id: string;
  name: string;
  /** Partial slide props applied to all slides */
  apply: Partial<Slide>;
  /** Partial slide props applied ONLY to the first slide (cover) — overrides `apply` */
  coverApply?: Partial<Slide>;
  /** Preview render */
  preview: React.ReactNode;
  /** Accent color for highlighting last word in titles */
  accentColor?: string;
  /** How accent is applied: "color" = text color, "highlight" = background highlight */
  accentMode?: "color" | "highlight";
}

/** Декоративный 6-лепестковый астериск с halftone-эффектом (1-в-1 с эталоном
 *  claude.design / Yalo Carousel Slide.html). ViewBox 520×520.
 *
 *  Анатомия:
 *    1. flowerMask — силуэт из 6 эллипсов-лепестков (rx=62 ry=108, cx=260 cy=110)
 *       повёрнутых 0/60/120/180/240/300 вокруг (260,260) + центральный круг r=90.
 *    2. Halftone-паттерн: 9×9 тайл, точка r=2.4 at (4.5, 4.5) цветом decor.
 *    3. Над точками — сплошной слой decor, но с альфа-маской radial fade
 *       (solid в центре → прозрачный на краях). Итог: центр плотный,
 *       края видны только как точки.
 *
 *  Параметр `width` задаёт ширину в px (SVG auto-height); по умолчанию
 *  использовать процентную ширину от контейнера через прямой стиль. */
const DecorShape = ({
  color,
  size,
  style,
}: {
  color: string;
  size?: number;
  style?: React.CSSProperties;
}) => {
  const uid = `decor-${Math.random().toString(36).slice(2, 8)}`;
  const mergedStyle: React.CSSProperties = {
    width: size ?? "100%",
    height: size ?? "auto",
    display: "block",
    overflow: "visible",
    ...(style || {}),
  };
  return (
    <svg
      viewBox="0 0 520 520"
      xmlns="http://www.w3.org/2000/svg"
      style={mergedStyle}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`${uid}-dots`}
          x="0"
          y="0"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="4.5" cy="4.5" r="2.4" fill={color} />
        </pattern>
        <g id={`${uid}-petal`}>
          <ellipse cx="260" cy="110" rx="62" ry="108" fill="white" />
        </g>
        <mask id={`${uid}-flower`} maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="520">
          <rect width="520" height="520" fill="black" />
          <circle cx="260" cy="260" r="90" fill="white" />
          <use href={`#${uid}-petal`} transform="rotate(0 260 260)" />
          <use href={`#${uid}-petal`} transform="rotate(60 260 260)" />
          <use href={`#${uid}-petal`} transform="rotate(120 260 260)" />
          <use href={`#${uid}-petal`} transform="rotate(180 260 260)" />
          <use href={`#${uid}-petal`} transform="rotate(240 260 260)" />
          <use href={`#${uid}-petal`} transform="rotate(300 260 260)" />
        </mask>
        <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor="white" stopOpacity="1" />
          <stop offset="65%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-fade`} maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="520">
          <rect width="520" height="520" fill={`url(#${uid}-core)`} />
        </mask>
      </defs>
      <g mask={`url(#${uid}-flower)`}>
        <rect width="520" height="520" fill={`url(#${uid}-dots)`} />
        <g mask={`url(#${uid}-fade)`}>
          <rect width="520" height="520" fill={color} />
        </g>
      </g>
    </svg>
  );
};

export { DecorShape };

// Шаблон «Минимализм» — 1-в-1 с эталоном claude.design (см.
// ./Яло/carousel-slide-standalone-src.html). Стилевой пакет задаёт
// палитру + шрифты + фоновый dot-pattern; конкретный layout для hook —
// в HookContent.tsx. Другие slide-types пока не переработаны.
const TEMPLATES: SlideTemplate[] = [
  {
    id: "minimalism",
    name: "Минимализм",
    accentColor: "#CDE0FA",
    accentMode: "highlight",
    apply: {
      bgColor: "#FFFFFF",
      bgImage: undefined,
      bgVideo: undefined,
      bgType: "color",
      overlayType: "none",
      overlayOpacity: 0,
      bgDarken: 0,
      titleColor: "#0A0A0A",
      bodyColor: "#666666",
      metaColor: "#999999",
      showFooter: false,
      footerText: "",
      showArrow: false,
      showUsername: true,
      showSlideCount: true,
      titleFont: "'Marvin Visions', 'Space Grotesk', 'Inter', sans-serif",
      titleLetterSpacing: -0.015,
      titleCase: "none",
      bodyFont: "'Inter', sans-serif",
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "end",
      decorShape: "none",
      bgPattern: "dots",
      accentMode: "highlight",
      accentColor: "#CDE0FA",
    },
    coverApply: {
      bgColor: "#FFFFFF",
      overlayType: "none",
      overlayOpacity: 0,
      titleColor: "#0A0A0A",
      bodyColor: "#666666",
      metaColor: "#999999",
      hAlign: "left",
      vAlign: "end",
      decorShape: "asterisk",
      decorColor: "#D6E8F7",
      // 520×520 астериск в правом-верхнем, right:-60px. В % 1080-слайда:
      //   decorSize = 520/1080 ≈ 48%
      //   decorTop = 80/1350 ≈ 6%
      //   decorLeft = 100% − 48% + (-60/1080×100%) = 57.4%
      decorSize: 48,
      decorTop: 6,
      decorLeft: 57,
      bgPattern: "dots",
      accentMode: "highlight",
      accentColor: "#CDE0FA",
    },
    preview: (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          background: "#FFFFFF",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1' fill='%23CCCCCC' opacity='0.35'/></svg>\")",
          backgroundSize: "6px 6px",
          backgroundRepeat: "repeat",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Top bar: @username слева, pill-counter справа */}
        <div
          className="absolute flex items-center justify-between"
          style={{ top: 4, left: 6, right: 6, zIndex: 5 }}
        >
          <span style={{ fontSize: 4, color: "#999999" }}>@username</span>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#F0F0F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 3,
              fontWeight: 500,
              color: "#0A0A0A",
            }}
          >
            1/6
          </div>
        </div>
        {/* Астериск: top-right, срезан правым краем */}
        <div style={{ position: "absolute", top: "6%", left: "57%", width: "48%", zIndex: 2 }}>
          <DecorShape color="#D6E8F7" />
        </div>
        {/* Content — примерно на 58% по вертикали */}
        <div style={{ position: "absolute", top: "58%", left: 7, right: 7, zIndex: 4 }}>
          <h3
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 8.5,
              lineHeight: 1.1,
              color: "#0A0A0A",
              margin: 0,
              textAlign: "left",
              letterSpacing: "-0.015em",
            }}
          >
            Почему одни бренды{" "}
            <span
              style={{
                display: "inline-block",
                background: "#CDE0FA",
                color: "#0A0A0A",
                borderRadius: 999,
                padding: "0.08em 3px 0.12em",
                marginLeft: -3,
                lineHeight: 1,
              }}
            >
              запоминаются&nbsp;сразу,
            </span>{" "}
            а другие — нет?
          </h3>
          <p
            style={{
              fontSize: 4,
              color: "#666666",
              margin: "3px 0 0 0",
              lineHeight: 1.4,
              textAlign: "left",
            }}
          >
            Потому что внимание нельзя купить.
          </p>
        </div>
      </div>
    ),
  },
];

interface TemplatesPanelProps {
  onApplyTemplate: (tpl: SlideTemplate) => void;
}

const TemplatesPanel = ({ onApplyTemplate }: TemplatesPanelProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
      {TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onApplyTemplate(tpl)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
        >
          <div
            className="overflow-hidden"
            style={{
              width: 96,
              height: 120,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {tpl.preview}
          </div>
          <span className="text-[10px] font-medium" style={{ color: "#1a1a2e" }}>
            {tpl.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TemplatesPanel;
export { TEMPLATES };
