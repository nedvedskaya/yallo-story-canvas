import { useState } from "react";

export type SlideFormat = "carousel" | "square" | "stories" | "presentation";

export interface FormatOption {
  id: SlideFormat;
  label: string;
  dimensions: string;
  ratio: string;
  width: number;
  height: number;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: "carousel", label: "Карусель", dimensions: "1080×1350", ratio: "3:4", width: 1080, height: 1350 },
  { id: "square", label: "Квадрат", dimensions: "1080×1080", ratio: "1:1", width: 1080, height: 1080 },
  { id: "stories", label: "Сторис", dimensions: "1080×1920", ratio: "9:16", width: 1080, height: 1920 },
  { id: "presentation", label: "Презентация", dimensions: "1920×1080", ratio: "16:9", width: 1920, height: 1080 },
];

interface SizePanelProps {
  currentFormat: SlideFormat;
  onSave: (format: SlideFormat) => void;
  onClose: () => void;
}

const SizePanel = ({ currentFormat, onSave, onClose }: SizePanelProps) => {
  const [draft, setDraft] = useState<SlideFormat>(currentFormat);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[28vh] scrollbar-hide">
      <div className="grid grid-cols-2 gap-2">
        {FORMAT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setDraft(opt.id)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all active:scale-[0.97]"
            style={{
              background: draft === opt.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
              border: draft === opt.id ? "1.5px solid rgba(200,200,220,0.6)" : "1px solid rgba(255,255,255,0.6)",
              boxShadow: draft === opt.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {/* Mini aspect ratio preview */}
            <div
              className="flex-shrink-0 rounded-md"
              style={{
                width: opt.width > opt.height ? 36 : 36 * (opt.width / opt.height),
                height: opt.height > opt.width ? 36 : 36 * (opt.height / opt.width),
                background: draft === opt.id
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "rgba(26,26,46,0.08)",
                border: "1px solid rgba(26,26,46,0.1)",
              }}
            />
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{opt.label}</span>
              <span className="text-[9px]" style={{ color: 'rgba(26,26,46,0.45)' }}>
                {opt.dimensions} · {opt.ratio}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-xl py-2 text-[11px] font-medium transition-all active:scale-[0.97]"
        style={{ background: "rgba(26,26,46,0.85)", color: "#fff" }}
      >
        Сохранить
      </button>
    </div>
  );
};

export default SizePanel;
