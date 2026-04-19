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

/** Декоративная halftone-"звезда" / астериск — для превью и cover-слайда.
 * Форма астериска заполнена паттерном точек с радиальным фейдом к краям. */
const DecorShape = ({ color, size = 56 }: { color: string; size?: number }) => {
  const uid = `tpl-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg
      viewBox="0 0 280 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={`${uid}-dots`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.8" fill={color} />
        </pattern>
        <radialGradient id={`${uid}-fade`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="70%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0.25" />
        </radialGradient>
        <mask id={`${uid}-mask`}>
          <rect width="280" height="280" fill="black" />
          <g fill={`url(#${uid}-fade)`}>
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
        </mask>
      </defs>
      <rect width="280" height="280" fill={`url(#${uid}-dots)`} mask={`url(#${uid}-mask)`} />
    </svg>
  );
};

export { DecorShape };

// Шаблон «Минимализм» удалён — массив пуст. Панель шаблонов рендерит
// пустой ряд, пользователь не может применить Минимализм. Инфраструктура
// (HookContent, isMinimalism-флаги в SlideFrame) остаётся на месте,
// но не триггерится, пока ни у одного слайда нет bgPattern: "dots".
const TEMPLATES: SlideTemplate[] = [];

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
