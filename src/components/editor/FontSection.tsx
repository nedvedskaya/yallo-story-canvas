import { Slider } from "@/components/ui/slider";

export interface FontSettings {
  font: string;
  size: number;
  case: "none" | "uppercase" | "lowercase";
  lineHeight: number;
  letterSpacing: number;
}

export const FONT_LIST = [
  { name: "Inter", family: "Inter, sans-serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Syne", family: "'Syne', sans-serif" },
  { name: "Unbounded", family: "'Unbounded', sans-serif" },
  { name: "DM Serif Display", family: "'DM Serif Display', serif" },
  { name: "Clash Display", family: "'Clash Display', sans-serif" },
  { name: "Cabinet Grotesk", family: "'Cabinet Grotesk', sans-serif" },
  { name: "Satoshi", family: "'Satoshi', sans-serif" },
  { name: "General Sans", family: "'General Sans', sans-serif" },
  { name: "Boska", family: "'Boska', serif" },
  { name: "Chillax", family: "'Chillax', sans-serif" },
  { name: "Melodrama", family: "'Melodrama', serif" },
  { name: "Swear Display", family: "'Swear Display', serif" },
  { name: "Neue Montreal", family: "'Neue Montreal', sans-serif" },
  { name: "Coolvetica", family: "'Coolvetica', sans-serif" },
  { name: "Postertoaster", family: "'Postertoaster', sans-serif" },
  { name: "Abraxas", family: "'Abraxas', serif" },
  { name: "HeadingNow", family: "'HeadingNow Trial', sans-serif" },
  { name: "SouthGhetto", family: "'SouthGhetto', sans-serif" },
  { name: "Marvin Visions", family: "'Marvin Visions', sans-serif" },
];

interface FontSectionProps {
  label: string;
  settings: FontSettings;
  onChange: (updates: Partial<FontSettings>) => void;
}

const FontSection = ({ label, settings, onChange }: FontSectionProps) => {
  const selectedFontObj = FONT_LIST.find(f => f.family === settings.font) || FONT_LIST[0];

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold" style={{ color: 'rgba(26,26,46,0.6)' }}>{label}</span>

      {/* Font picker */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FONT_LIST.map((f) => (
          <button
            key={f.name}
            onClick={() => onChange({ font: f.family })}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-all active:scale-95"
            style={{
              fontFamily: f.family,
              background: settings.font === f.family ? 'rgba(26,26,46,0.1)' : 'rgba(255,255,255,0.35)',
              border: settings.font === f.family ? '1.5px solid rgba(26,26,46,0.3)' : '1px solid rgba(255,255,255,0.6)',
              color: '#1a1a2e',
              whiteSpace: 'nowrap',
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Size */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-16 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>Размер</span>
        <Slider min={8} max={100} step={1} value={[settings.size]} onValueChange={([v]) => onChange({ size: v })} className="flex-1" />
        <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.size}</span>
      </div>

      {/* Case */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-16 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>Регистр</span>
        <div className="flex gap-1">
          {([["none", "Aa"], ["uppercase", "AA"], ["lowercase", "aa"]] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => onChange({ case: val })}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: settings.case === val ? 'rgba(26,26,46,0.1)' : 'rgba(255,255,255,0.35)',
                border: settings.case === val ? '1.5px solid rgba(26,26,46,0.3)' : '1px solid rgba(255,255,255,0.6)',
                color: '#1a1a2e',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Line height */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-16 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>Интерлиньяж</span>
        <Slider min={0.8} max={3} step={0.05} value={[settings.lineHeight]} onValueChange={([v]) => onChange({ lineHeight: v })} className="flex-1" />
        <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.lineHeight.toFixed(1)}</span>
      </div>

      {/* Letter spacing */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-16 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>Трекинг</span>
        <Slider min={-5} max={20} step={0.5} value={[settings.letterSpacing]} onValueChange={([v]) => onChange({ letterSpacing: v })} className="flex-1" />
        <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.letterSpacing}</span>
      </div>
    </div>
  );
};

export default FontSection;
