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

/** Декоративная "звезда" / астериск из HookSlide.jsx — для превью и cover-слайда */
const DecorShape = ({ color, size = 56 }: { color: string; size?: number }) => (
  <svg
    viewBox="0 0 280 280"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: size, height: size, display: "block", overflow: "visible" }}
    aria-hidden="true"
  >
    <g fill={color}>
      <g transform="translate(140 140)">
        <rect x="-36" y="-126" width="72" height="150" rx="36" ry="36" />
        <rect x="-34" y="-122" width="68" height="146" rx="34" ry="34" transform="rotate(60)" />
        <rect x="-37" y="-128" width="74" height="152" rx="37" ry="37" transform="rotate(120)" />
        <rect x="-35" y="-124" width="70" height="148" rx="35" ry="35" transform="rotate(180)" />
        <rect x="-36" y="-126" width="72" height="150" rx="36" ry="36" transform="rotate(240)" />
        <rect x="-34" y="-120" width="68" height="144" rx="34" ry="34" transform="rotate(300)" />
        <circle cx="0" cy="0" r="58" />
        <circle cx="-8" cy="6" r="50" />
        <circle cx="10" cy="-4" r="46" />
      </g>
    </g>
  </svg>
);

export { DecorShape };

const TEMPLATES: SlideTemplate[] = [
  {
    id: "hook",
    name: "Hook",
    accentColor: "#CDE0FA",
    accentMode: "highlight",
    apply: {
      bgColor: "#FFFFFF",
      bgImage: undefined,
      bgVideo: undefined,
      bgType: "color",
      overlayType: "dots",
      overlayOpacity: 40,
      overlayColor: "#CCCCCC",
      titleColor: "#0A0A0A",
      bodyColor: "#666666",
      metaColor: "#999999",
      showFooter: false,
      footerText: "",
      showArrow: true,
      showUsername: true,
      showSlideCount: true,
      bgDarken: 0,
      titleFont: "'Inter', sans-serif",
      titleLetterSpacing: -0.015,
      titleCase: "none",
      bodyFont: "'Inter', sans-serif",
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "center",
      decorShape: "asterisk",
      decorColor: "#E7F0FB",
      decorSize: 52,
      decorTop: 8,
      decorLeft: -5,
      accentMode: "highlight",
      accentColor: "#CDE0FA",
    },
    coverApply: {
      bgColor: "#FFFFFF",
      overlayType: "dots",
      overlayOpacity: 40,
      overlayColor: "#CCCCCC",
      titleColor: "#0A0A0A",
      bodyColor: "#666666",
      metaColor: "#999999",
      hAlign: "left",
      vAlign: "center",
      decorShape: "asterisk",
      decorColor: "#E7F0FB",
      decorSize: 52,
      decorTop: 8,
      decorLeft: -5,
      accentMode: "highlight",
      accentColor: "#CDE0FA",
    },
    preview: (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ background: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
      >
        {/* Halftone dot pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='%23CCCCCC' opacity='0.4'/></svg>\")",
            backgroundRepeat: "repeat",
            backgroundSize: "6px 6px",
            zIndex: 1,
          }}
        />
        {/* Top bar */}
        <div
          className="absolute flex items-center justify-end"
          style={{ top: 6, left: 6, right: 6, zIndex: 5 }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#F0F0F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 4,
              color: "#0A0A0A",
              fontWeight: 500,
            }}
          >
            1/7
          </div>
        </div>
        {/* Decor */}
        <div style={{ position: "absolute", top: "8%", left: "-5%", width: "52%", zIndex: 2 }}>
          <DecorShape color="#E7F0FB" size={50} />
        </div>
        {/* Content */}
        <div style={{ position: "absolute", top: "55%", left: 7, right: 7, zIndex: 4 }}>
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              lineHeight: 1.1,
              color: "#0A0A0A",
              margin: 0,
              textAlign: "left",
              letterSpacing: "-0.015em",
            }}
          >
            Как я{" "}
            <span
              style={{
                background: "#CDE0FA",
                borderRadius: 2,
                padding: "0 2px",
              }}
            >
              выросла
            </span>
          </h3>
          <p
            style={{
              fontSize: 4.5,
              color: "#666666",
              margin: "3px 0 0 0",
              lineHeight: 1.4,
              textAlign: "left",
            }}
          >
            за 1 месяц без рекламы
          </p>
        </div>
        {/* Bottom bar */}
        <div
          className="absolute flex items-center justify-between"
          style={{ bottom: 6, left: 6, right: 6, zIndex: 5 }}
        >
          <span style={{ fontSize: 4.5, color: "#999999" }}>@yalokontent</span>
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "1px solid #0A0A0A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 6,
              color: "#0A0A0A",
            }}
          >
            →
          </div>
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
