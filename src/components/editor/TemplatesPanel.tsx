import type { Slide } from "./SlideCarousel";

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
      titleLetterSpacing: 0,
      titleCase: "none",
      bodyFont: "'Inter', sans-serif",
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "center",
    },
    coverApply: {
      bgColor: "#1A1A1A",
      overlayType: "grid",
      overlayOpacity: 18,
      overlayColor: "rgba(255,255,255,0.08)",
      titleColor: "#FFFFFF",
      bodyColor: "rgba(255,255,255,0.85)",
      metaColor: "rgba(255,255,255,0.5)",
      hAlign: "left",
      vAlign: "center",
    },
    preview: (
      <div
        className="w-full h-full flex flex-col justify-between relative"
        style={{ background: "#1A1A1A", padding: 8, fontFamily: "'Inter', sans-serif" }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: "12px 12px", pointerEvents: "none", zIndex: 0,
          }}
        />
        <div className="flex justify-between items-center relative z-10">
          <span style={{ fontSize: 5, color: "rgba(255,255,255,0.5)" }}>@username</span>
          <span style={{ fontSize: 5, color: "rgba(255,255,255,0.5)" }}>[ 1/3 ]</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1 py-1 relative z-10">
          <h3 style={{ fontFamily: "'Dela Gothic One', sans-serif", fontSize: 11, lineHeight: 1.05, color: "#FFFFFF", margin: 0, textAlign: "left" }}>
            Заголовок
          </h3>
          <p style={{ fontSize: 5, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5, textAlign: "left" }}>Текст слайда</p>
        </div>
        <div className="flex justify-end items-center relative z-10">
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, color: "#FFFFFF" }}>→</div>
        </div>
      </div>
    ),
  },
  {
    id: "minimalism-clean",
    name: "Минимализм",
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
      titleLetterSpacing: 0,
      titleCase: "uppercase",
      bodyFont: "'Inter', sans-serif",
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "center",
    },
    coverApply: {
      titleSize: 100,
      hAlign: "left",
      vAlign: "center",
    },
    preview: (
      <div className="w-full h-full flex flex-col justify-between" style={{ background: "#FFFFFF", padding: 8, fontFamily: "'Inter', sans-serif" }}>
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 5, color: "#999" }}>@username</span>
          <span style={{ fontSize: 5, color: "#999" }}>[ 1/3 ]</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1 py-1">
          <h3 style={{ fontFamily: "'SONGER Grotesque', sans-serif", fontSize: 12, lineHeight: 1.0, color: "#1A1A1A", margin: 0, textAlign: "left", textTransform: "uppercase", fontWeight: 700 }}>
            ЗАГОЛОВОК
          </h3>
          <p style={{ fontSize: 5, color: "#1A1A1A", margin: 0, lineHeight: 1.5, textAlign: "left" }}>Основной текст слайда</p>
        </div>
        <div className="flex justify-end items-center">
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1px solid #1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, color: "#1A1A1A" }}>→</div>
        </div>
      </div>
    ),
  },
  {
    id: "bordo",
    name: "Бордо",
    accentColor: "#630208",
    accentMode: "color",
    apply: {
      bgColor: "#E5E3D7",
      bgImage: undefined,
      bgVideo: undefined,
      bgType: "color",
      overlayType: "none",
      overlayOpacity: 0,
      titleColor: "#010003",
      bodyColor: "#49453E",
      metaColor: "rgba(1,0,3,0.45)",
      overlayColor: "rgba(0,0,0,0.08)",
      showFooter: false,
      footerText: "",
      showArrow: true,
      showUsername: true,
      showSlideCount: true,
      bgDarken: 0,
      titleFont: "'Forum', serif",
      titleLetterSpacing: 0,
      titleCase: "none",
      bodyFont: "'Inter', sans-serif",
      bodyLetterSpacing: 0,
      bodyCase: "none",
      hAlign: "left",
      vAlign: "center",
    },
    coverApply: {
      bgColor: "#620107",
      titleColor: "#FFFFFF",
      bodyColor: "rgba(255,255,255,0.8)",
      metaColor: "rgba(255,255,255,0.5)",
      titleSize: 120,
      hAlign: "left",
      vAlign: "center",
    },
    preview: (
      <div
        className="w-full h-full flex flex-col justify-between"
        style={{ background: "#620107", padding: 8, fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 5, color: "rgba(255,255,255,0.5)" }}>@username</span>
          <span style={{ fontSize: 5, color: "rgba(255,255,255,0.5)" }}>[ 1/3 ]</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1 py-1">
          <h3 style={{
            fontFamily: "'Forum', serif",
            fontSize: 14,
            lineHeight: 1.0,
            color: "#FFFFFF",
            margin: 0,
            textAlign: "left",
            fontWeight: 400,
          }}>
            Шрифтовые
          </h3>
          <p style={{ fontSize: 5, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5, textAlign: "left" }}>Текст слайда</p>
        </div>
        <div className="flex justify-end items-center">
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, color: "#FFFFFF" }}>→</div>
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
