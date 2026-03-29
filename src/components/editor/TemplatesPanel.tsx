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
}

const TEMPLATES: SlideTemplate[] = [
  {
    id: "tetrad",
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
      bodyLineHeight: 1.65,
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
            <span style={{ background: "#FF4200", color: "#fff", padding: "0 2px", borderRadius: 1 }}>слайда</span>
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
    id: "minimalism",
    name: "Минимализм",
    accentColor: "#7C3AED",
    apply: {
      bgColor: "#FFFFFF",
      bgImage: undefined,
      bgVideo: undefined,
      bgType: "color",
      bgDarken: 0,
      overlayType: "none",
      overlayOpacity: 0,
      overlayColor: "rgba(0,0,0,0)",
      titleColor: "#111111",
      bodyColor: "#444444",
      metaColor: "#AAAAAA",
      titleFont: "'SONGER Grotesque', sans-serif",
      titleSize: 24,
      titleLineHeight: 1.15,
      titleLetterSpacing: -0.3,
      titleCase: "uppercase",
      bodyFont: "'Inter', sans-serif",
      bodySize: 13,
      bodyLineHeight: 1.7,
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "end",
      showUsername: true,
      showSlideCount: true,
      showArrow: true,
      showFooter: false,
      footerText: "",
    },
    preview: (
      <div
        className="w-full h-full flex flex-col justify-between relative"
        style={{ background: "#FFFFFF", padding: 8, fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 5, color: "#AAAAAA" }}>@username</span>
          <span style={{ fontSize: 5, color: "#AAAAAA" }}>1/3</span>
        </div>
        <div className="flex flex-col gap-1 pb-1">
          <h3
            style={{
              fontFamily: "'SONGER Grotesque', sans-serif",
              fontSize: 9,
              lineHeight: 1.15,
              color: "#111111",
              margin: 0,
              textAlign: "left",
              textTransform: "uppercase",
              letterSpacing: "-0.3px",
            }}
          >
            Заголовок{" "}
            <span style={{ background: "#7C3AED", color: "#fff", padding: "0 2px", borderRadius: 1 }}>слайда</span>
          </h3>
          <p style={{ fontSize: 5, color: "#444444", margin: 0, lineHeight: 1.5, textAlign: "left" }}>
            Основной текст слайда
          </p>
        </div>
        <div className="flex justify-end items-center">
          <div
            style={{
              width: 10, height: 10, borderRadius: "50%",
              border: "1px solid #111111",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 5, color: "#111111",
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
