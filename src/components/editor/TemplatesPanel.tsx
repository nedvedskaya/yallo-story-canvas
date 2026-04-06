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
  description: string;
  preview: React.ReactNode;
}> = [
  {
    id: 'default',
    label: 'Классика',
    description: 'Заголовок + текст',
    preview: (
      <div style={{ width: '100%', height: '100%', padding: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* noise texture overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        {/* top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 4, color: 'rgba(255,255,255,0.5)' }}>@username</span>
          <span style={{ fontSize: 3.5, color: 'rgba(255,255,255,0.4)', border: '0.5px solid rgba(255,255,255,0.25)', borderRadius: 2, padding: '0.5px 2px' }}>1 / 6</span>
        </div>
        {/* content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          {/* title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              Как я
            </div>
            <div style={{ fontSize: 7, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#fff' }}>вырос</span>
              <span style={{ color: '#ffd700' }}> в 10x</span>
            </div>
          </div>
          {/* body lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, marginTop: 2 }}>
            <div style={{ height: 2.5, width: '100%', background: 'rgba(255,255,255,0.35)', borderRadius: 1 }} />
            <div style={{ height: 2.5, width: '85%', background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
            <div style={{ height: 2.5, width: '60%', background: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
          </div>
        </div>
        {/* bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: '0.8px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 4, color: 'rgba(255,255,255,0.8)' }}>
            →
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'title-only',
    label: 'Обложка',
    description: 'Крупный заголовок',
    preview: (
      <div style={{ width: '100%', height: '100%', padding: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* glow effect */}
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 4, color: 'rgba(255,255,255,0.4)' }}>@username</span>
        </div>
        {/* BIG title */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 5, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 2 }}>
            КЕЙС
          </div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>
            <div>Миллион</div>
            <div style={{ color: '#7C5CFC' }}>за год</div>
          </div>
        </div>
        {/* bottom line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ height: 0.5, flex: 1, background: 'rgba(255,255,255,0.1)', marginRight: 4 }} />
          <span style={{ fontSize: 4, color: 'rgba(255,255,255,0.5)' }}>→</span>
        </div>
      </div>
    ),
  },
  {
    id: 'photo-top',
    label: 'Фото + текст',
    description: 'Фото сверху',
    preview: (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f5f7', overflow: 'hidden' }}>
        {/* photo zone */}
        <div style={{ flex: '0 0 52%', position: 'relative', overflow: 'hidden' }}>
          {/* gradient photo bg */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)' }} />
          {/* photo frame icon */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 12, border: '1px solid rgba(255,255,255,0.5)', borderRadius: 1.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', padding: 1 }}>
              {/* Mountain shape */}
              <svg width="14" height="6" viewBox="0 0 14 6" fill="none">
                <path d="M0 6L4 2L7 4L10 1L14 6H0Z" fill="rgba(255,255,255,0.4)" />
                <circle cx="11" cy="1.5" r="1" fill="rgba(255,255,255,0.5)" />
              </svg>
            </div>
          </div>
          {/* top bar on photo */}
          <div style={{ position: 'absolute', top: 4, left: 5, right: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 3.5, color: 'rgba(255,255,255,0.7)' }}>@username</span>
            <span style={{ fontSize: 3, color: 'rgba(255,255,255,0.5)' }}>1/5</span>
          </div>
        </div>
        {/* text zone */}
        <div style={{ flex: 1, padding: '5px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2.5 }}>
          <div style={{ fontSize: 6, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.15 }}>
            Заголовок
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <div style={{ height: 2.5, width: '100%', background: 'rgba(26,26,46,0.2)', borderRadius: 1 }} />
            <div style={{ height: 2.5, width: '70%', background: 'rgba(26,26,46,0.12)', borderRadius: 1 }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'quote',
    label: 'Цитата',
    description: 'Мысль / высказывание',
    preview: (
      <div style={{ width: '100%', height: '100%', padding: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(155deg, #1a1a2e 0%, #0f0c29 40%, #302b63 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* subtle gold glow */}
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* top */}
        <span style={{ fontSize: 4, color: 'rgba(255,255,255,0.35)', position: 'relative', zIndex: 1 }}>@username</span>
        {/* quote content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, gap: 2 }}>
          {/* decorative quote mark */}
          <div style={{ fontSize: 20, lineHeight: 0.7, color: 'rgba(255,255,255,0.12)', fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</div>
          {/* text lines — italic style */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, marginTop: 1 }}>
            <div style={{ height: 2.5, width: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
            <div style={{ height: 2.5, width: '90%', background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
            <div style={{ height: 2.5, width: '70%', background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
          </div>
          {/* author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
            <div style={{ height: 0.5, width: 8, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ height: 2, width: '35%', background: 'rgba(255,255,255,0.25)', borderRadius: 1 }} />
          </div>
        </div>
        <div style={{ height: 1 }} />
      </div>
    ),
  },
];

const TemplatesPanel = ({ onApplyTemplate, currentLayoutType, onLayoutChange }: TemplatesPanelProps) => {
  return (
    <div className="flex flex-col gap-4">

      {/* СЕКЦИЯ 1: Шаблон оформления — идёт первым */}
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

      {/* Разделитель */}
      <div style={{ height: 1, background: 'rgba(26,26,46,0.08)' }} />

      {/* СЕКЦИЯ 2: Тип слайда — идёт вторым */}
      <div>
        <p className="text-[11px] font-medium mb-2" style={{ color: 'rgba(26,26,46,0.5)' }}>Тип слайда</p>
        <div className="grid grid-cols-4 gap-2">
          {LAYOUT_OPTIONS.map((opt) => {
            const isActive = (currentLayoutType || 'default') === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onLayoutChange?.(opt.id)}
                className="flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: isActive ? '2px solid #1a1a2e' : '1.5px solid rgba(200,200,220,0.5)',
                  boxShadow: isActive ? '0 2px 10px rgba(26,26,46,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s',
                }}>
                  {opt.preview}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: isActive ? '#1a1a2e' : 'rgba(26,26,46,0.6)' }}>
                    {opt.label}
                  </span>
                  <span className="text-[7px] text-center leading-tight" style={{ color: 'rgba(26,26,46,0.35)' }}>
                    {opt.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TemplatesPanel;
export { TEMPLATES };
