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
      bodyLineHeight: 1.65,
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
  currentLayoutType?: string;
  onLayoutChange?: (layout: 'default' | 'title-only' | 'photo-top' | 'quote') => void;
}

const LAYOUT_OPTIONS: Array<{
  id: 'default' | 'title-only' | 'photo-top' | 'quote';
  label: string;
  preview: React.ReactNode;
}> = [
  {
    id: 'default',
    label: 'Стандарт',
    preview: (
      <div style={{ width: '100%', height: '100%', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ height: 8, width: '80%', background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
        <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
        <div style={{ height: 4, width: '70%', background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
      </div>
    ),
  },
  {
    id: 'title-only',
    label: 'Обложка',
    preview: (
      <div style={{ width: '100%', height: '100%', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div style={{ height: 12, width: '90%', background: 'rgba(255,255,255,0.95)', borderRadius: 2 }} />
        <div style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.95)', borderRadius: 2, marginTop: 4 }} />
      </div>
    ),
  },
  {
    id: 'photo-top',
    label: 'Фото + текст',
    preview: (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3', overflow: 'hidden' }}>
        <div style={{ flex: '0 0 52%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 12, border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 2 }} />
        </div>
        <div style={{ flex: 1, padding: '5px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
          <div style={{ height: 5, width: '85%', background: 'rgba(26,26,46,0.7)', borderRadius: 1 }} />
          <div style={{ height: 3, width: '100%', background: 'rgba(26,26,46,0.3)', borderRadius: 1 }} />
        </div>
      </div>
    ),
  },
  {
    id: 'quote',
    label: 'Цитата',
    preview: (
      <div style={{ width: '100%', height: '100%', padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29, #302b63)' }}>
        <div style={{ fontSize: 18, lineHeight: 0.8, color: 'rgba(255,255,255,0.25)', fontFamily: 'Georgia, serif' }}>"</div>
        <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.7)', borderRadius: 1, marginTop: 3 }} />
        <div style={{ height: 4, width: '85%', background: 'rgba(255,255,255,0.7)', borderRadius: 1, marginTop: 2 }} />
        <div style={{ height: 3, width: '50%', background: 'rgba(255,255,255,0.35)', borderRadius: 1, marginTop: 5 }} />
      </div>
    ),
  },
];

const TemplatesPanel = ({ onApplyTemplate, currentLayoutType, onLayoutChange }: TemplatesPanelProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Тип слайда */}
      <div>
        <p className="text-[11px] font-medium mb-2" style={{ color: 'rgba(26,26,46,0.5)' }}>Тип слайда</p>
        <div className="grid grid-cols-4 gap-2">
          {LAYOUT_OPTIONS.map((opt) => {
            const isActive = (currentLayoutType || 'default') === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onLayoutChange?.(opt.id)}
                className="flex flex-col items-center gap-1 transition-all active:scale-95"
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: isActive ? '2px solid #1a1a2e' : '1.5px solid rgba(200,200,220,0.5)',
                  boxShadow: isActive ? '0 2px 8px rgba(26,26,46,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s',
                }}>
                  {opt.preview}
                </div>
                <span className="text-[9px] font-medium text-center leading-tight" style={{ color: isActive ? '#1a1a2e' : 'rgba(26,26,46,0.5)' }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(26,26,46,0.08)' }} />

      {/* Шаблоны оформления */}
      <div>
        <p className="text-[11px] font-medium mb-2" style={{ color: 'rgba(26,26,46,0.5)' }}>Шаблон оформления</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => onApplyTemplate(tpl)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all active:scale-95"
            >
              <div className="overflow-hidden" style={{
                width: 80, height: 100, borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                {tpl.preview}
              </div>
              <span className="text-[10px] font-medium" style={{ color: '#1a1a2e' }}>
                {tpl.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;
export { TEMPLATES };
