import type { Slide } from "./SlideCarousel";

export interface SlideTemplate {
  id: string;
  name: string;
  /** Partial slide props applied to all slides */
  apply: Partial<Slide>;
  /** Preview render */
  preview: React.ReactNode;
  /** Accent color for highlighting last word in titles */
  accentColor?: string;
  /** How accent is applied: "color" = text color, "highlight" = background highlight */
  accentMode?: "color" | "highlight";
}

const TEMPLATES: SlideTemplate[] = [
  {
    id: "minimalism",
    name: "Тетрадь",
    accentColor: "#FF4200",
    apply: {

      bgColor: "#F3F3F3",
      bgImage: undefined,
      bgVideo: undefined,
      bgType: "color",
      overlayType: "grid",
      overlayOpacity: 40,
      titleColor: "#1A1A1A",
      bodyColor: "#1A1A1A",
      metaColor: "#999999",
      overlayColor: "rgba(0,0,0,0.08)",
      showFooter: false,
      footerText: "",
      showArrow: true,
      showUsername: true,
      showSlideCount: true,
      bgDarken: 0,
      titleFont: "'Dela Gothic One', sans-serif",
      titleSize: 28,
      titleLineHeight: 1.15,
      titleLetterSpacing: 0,
      titleCase: "none",
      bodyFont: "'Inter', sans-serif",
      bodySize: 14,
      bodyLineHeight: 1.4,
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "center",
    },
    preview: (
      <div
        className="w-full h-full flex flex-col justify-between relative"
        style={{
          background: "#F3F3F3",
          padding: 8,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "12px 12px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* top bar */}
        <div className="flex justify-between items-center relative z-10">
          <span style={{ fontSize: 5, color: "#999" }}>@username</span>
          <span style={{ fontSize: 5, color: "#999" }}>[ 1/3 ]</span>
        </div>
        {/* content */}
        <div className="flex-1 flex flex-col justify-center gap-1 py-1 relative z-10">
          <h3
            style={{
              fontFamily: "'Dela Gothic One', sans-serif",
              fontSize: 9,
              lineHeight: 1.15,
              color: "#1A1A1A",
              margin: 0,
              textAlign: "left",
            }}
          >
            Заголовок{" "}
            <span style={{ color: "#FF4200" }}>слайда</span>
          </h3>
          <p style={{ fontSize: 5, color: "#1A1A1A", margin: 0, lineHeight: 1.5, textAlign: "left" }}>
            Основной текст слайда
          </p>
        </div>
        {/* bottom */}
        <div className="flex justify-end items-center relative z-10">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "1px solid #1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 5,
              color: "#1A1A1A",
            }}
          >
            →
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "minimalism-clean",
    name: "Минимализм",
    accentColor: "#7C5CFC",
    accentMode: "highlight",
    apply: {
      bgColor: "#FFFFFF",
      bgImage: undefined,
      bgVideo: undefined,
      bgType: "color",
      overlayType: "none",
      overlayOpacity: 0,
      titleColor: "#1A1A1A",
      bodyColor: "#1A1A1A",
      metaColor: "#999999",
      overlayColor: "rgba(0,0,0,0.08)",
      showFooter: false,
      footerText: "",
      showArrow: true,
      showUsername: true,
      showSlideCount: true,
      bgDarken: 0,
      titleFont: "'SONGER Grotesque', sans-serif",
      titleSize: 28,
      titleLineHeight: 1.15,
      titleLetterSpacing: 0,
      titleCase: "uppercase",
      bodyFont: "'Inter', sans-serif",
      bodySize: 14,
      bodyLineHeight: 1.4,
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "center",
    },
    preview: (
      <div
        className="w-full h-full flex flex-col justify-between"
        style={{
          background: "#FFFFFF",
          padding: 8,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* top bar */}
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 5, color: "#999" }}>@username</span>
          <span style={{ fontSize: 5, color: "#999" }}>[ 1/3 ]</span>
        </div>
        {/* content */}
        <div className="flex-1 flex flex-col justify-center gap-1 py-1">
          <h3
            style={{
              fontFamily: "'SONGER Grotesque', sans-serif",
              fontSize: 7,
              lineHeight: 1.2,
              color: "#1A1A1A",
              margin: 0,
              textAlign: "left",
              textTransform: "uppercase",
            }}
          >
            ЗАГОЛОВОК{" "}
            <span
              style={{
                background: "#7C5CFC",
                color: "#FFFFFF",
                padding: "1px 2px",
                borderRadius: 1,
              }}
            >
              СЛАЙДА
            </span>
          </h3>
          <p style={{ fontSize: 5, color: "#1A1A1A", margin: 0, lineHeight: 1.5, textAlign: "left" }}>
            Основной текст слайда
          </p>
        </div>
        {/* bottom */}
        <div className="flex justify-end items-center">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "1px solid #1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 5,
              color: "#1A1A1A",
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
          {/* Live preview card */}
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
