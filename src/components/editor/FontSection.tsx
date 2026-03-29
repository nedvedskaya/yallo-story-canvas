import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";

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
  { name: "Abraxas", family: "'Abraxas', serif" },
  { name: "HeadingNow", family: "'HeadingNow Trial', sans-serif" },
  { name: "SouthGhetto", family: "'SouthGhetto', sans-serif" },
  { name: "Marvin Visions", family: "'Marvin Visions', sans-serif" },
  { name: "SONGER", family: "'SONGER Grotesque', sans-serif" },
  { name: "Coolvetica", family: "'Coolvetica', sans-serif" },
];

interface FontSectionProps {
  label: string;
  settings: FontSettings;
  onChange: (updates: Partial<FontSettings>) => void;
  customFonts?: CustomFont[];
  onAddCustomFont?: (font: CustomFont) => void;
}

const FontSection = ({ label, settings, onChange, customFonts = [], onAddCustomFont }: FontSectionProps) => {

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

    // Reset input via event target
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
        {/* Add custom font — label for mobile compatibility */}
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
        <Slider min={8} max={48} step={1} value={[settings.size]} onValueChange={([v]) => onChange({ size: v })} className="flex-1" />
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
        <span className="text-[11px] w-16 flex-shrink-0 flex items-center gap-1" style={{ color: 'rgba(26,26,46,0.5)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          Интервал
        </span>
        <Slider min={0.8} max={3} step={0.05} value={[settings.lineHeight]} onValueChange={([v]) => onChange({ lineHeight: v })} className="flex-1" />
        <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.lineHeight.toFixed(1)}</span>
      </div>

      {/* Letter spacing */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] w-16 flex-shrink-0 flex items-center gap-1" style={{ color: 'rgba(26,26,46,0.5)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20V4m10 16V4"/><path d="M3 8l4-4 4 4M13 8l4-4 4 4"/></svg>
          Интервал
        </span>
        <Slider min={-5} max={20} step={0.5} value={[settings.letterSpacing]} onValueChange={([v]) => onChange({ letterSpacing: v })} className="flex-1" />
        <span className="text-[11px] w-6 text-right" style={{ color: 'rgba(26,26,46,0.5)' }}>{settings.letterSpacing}</span>
      </div>
    </div>
  );
};

export default FontSection;
