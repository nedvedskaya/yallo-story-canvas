import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Plus, ChevronDown } from "lucide-react";

export interface FontSettings {
  font: string;
  size: number;
  case: "none" | "uppercase" | "lowercase";
  lineHeight: number;
  letterSpacing: number;
}

export interface CustomFont {
  name: string;
  family: string;
}

export const FONT_LIST = [
  { name: "Inter", family: "'Inter', sans-serif" },
  { name: "Abraxas", family: "'Abraxas', serif" },
  { name: "HeadingNow", family: "'HeadingNow Trial', sans-serif" },
  { name: "SouthGhetto", family: "'SouthGhetto', sans-serif" },
  { name: "Marvin Visions", family: "'Marvin Visions', sans-serif" },
  { name: "SONGER", family: "'SONGER Grotesque', sans-serif" },
  { name: "Coolvetica", family: "'Coolvetica', sans-serif" },
  { name: "BeerMoney", family: "'BeerMoney', sans-serif" },
  { name: "Bella Script", family: "'Bella Script CYR', cursive" },
  { name: "Druk Wide", family: "'Druk Wide Cyr', sans-serif" },
  { name: "Evolventa", family: "'Evolventa', sans-serif" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Le Murmure", family: "'Le Murmure', sans-serif" },
  { name: "Moniqa", family: "'Moniqa', sans-serif" },
  { name: "Oks Free", family: "'Oks Free', sans-serif" },
  { name: "Forum", family: "'Forum', serif" },
  { name: "Cera Pro", family: "'Cera Pro', sans-serif" },
  { name: "Gilroy", family: "'Gilroy', sans-serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif" },
];

interface FontSectionProps {
  label: string;
  settings: FontSettings;
  onChange: (updates: Partial<FontSettings>) => void;
  onCommit?: (updates: Partial<FontSettings>) => void;
  customFonts?: CustomFont[];
  onAddCustomFont?: (font: CustomFont) => void;
}

const FontSection = ({ label, settings, onChange, onCommit, customFonts = [], onAddCustomFont }: FontSectionProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allFonts = [...FONT_LIST, ...customFonts];

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, "");
    const fontFamily = `'${fontName}'`;

    try {
      const buffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      onAddCustomFont?.({ name: fontName, family: `${fontFamily}, sans-serif` });
      onChange({ font: `${fontFamily}, sans-serif` });
    } catch (err) {
      console.error("Failed to load font:", err);
    }

    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold" style={{ color: 'rgba(26,26,46,0.6)' }}>{label}</span>

      {/* Font picker */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {allFonts.map((f) => (
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
        <label
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.35)',
            border: '1px dashed rgba(26,26,46,0.25)',
            color: 'rgba(26,26,46,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={12} /> Шрифт
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            onChange={handleFontUpload}
          />
        </label>
      </div>

      {/* Size */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-16 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>Размер</span>
        <Slider min={8} max={48} step={1} value={[settings.size]} onValueChange={([v]) => onChange({ size: v })} onValueCommit={([v]) => onCommit?.({ size: v })} className="flex-1" />
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

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-[11px] font-medium transition-all self-start"
        style={{ color: 'rgba(26,26,46,0.4)' }}
      >
        <ChevronDown
          size={12}
          className="transition-transform duration-200"
          style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
        {showAdvanced ? 'Скрыть' : 'Ещё'}
      </button>

      {showAdvanced && (
        <>
          {/* Line height */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] w-24 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>
              Межстрочный
            </span>
            <Slider min={0.8} max={3} step={0.05} value={[settings.lineHeight]} onValueChange={([v]) => onChange({ lineHeight: v })} onValueCommit={([v]) => onCommit?.({ lineHeight: v })} className="flex-1" />
            <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.lineHeight.toFixed(1)}</span>
          </div>

          {/* Letter spacing */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] w-24 flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>
              Межбуквенный
            </span>
            <Slider min={-5} max={20} step={0.5} value={[settings.letterSpacing]} onValueChange={([v]) => onChange({ letterSpacing: v })} onValueCommit={([v]) => onCommit?.({ letterSpacing: v })} className="flex-1" />
            <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.letterSpacing}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FontSection;
