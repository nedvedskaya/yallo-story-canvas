import { useRef, useEffect, useState, useCallback } from "react";
import { Bold, Italic, Underline, Type, Palette, Highlighter, X, RotateCcw } from "lucide-react";

interface TextEditorModalProps {
  open: boolean;
  field: "title" | "body";
  initialHtml: string;
  accentColor?: string;
  onSave: (html: string) => void;
  onClose: () => void;
}

const ACCENT_PRESETS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#FF922B", "#CC5DE8", "#20C997", "#F06595",
  "#ffffff", "#000000",
];

const TextEditorModal = ({ open, field, initialHtml, onSave, onClose }: TextEditorModalProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_PRESETS[3]);

  useEffect(() => {
    if (open && editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
      editorRef.current.focus();
    }
  }, [open, initialHtml]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleLight = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontWeight = "300";
    range.surroundContents(span);
    sel.removeAllRanges();
    editorRef.current?.focus();
  };

  const handleHighlight = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = selectedAccent;
    span.style.borderRadius = "3px";
    span.style.padding = "0 2px";
    range.surroundContents(span);
    sel.removeAllRanges();
    editorRef.current?.focus();
  };

  const handleResetFormatting = () => {
    exec("removeFormat");
    // Also remove background highlights
    const sel = window.getSelection();
    if (editorRef.current) {
      const spans = editorRef.current.querySelectorAll("span[style]");
      spans.forEach((span) => {
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) parent.insertBefore(span.firstChild, span);
          parent.removeChild(span);
        }
      });
    }
    editorRef.current?.focus();
  };

  const handleSave = () => {
    onSave(editorRef.current?.innerHTML || "");
    onClose();
  };

  if (!open) return null;

  const labelStyle: React.CSSProperties = { color: "rgba(26,26,46,0.5)" };
  const btnBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.7)',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
    color: '#4a4a6a',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(2px)' }} />

      <div
        className="relative w-full max-w-md mx-3 mb-[calc(76px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1.5px solid rgba(200, 200, 220, 0.5)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
            {field === "title" ? "Заголовок" : "Основной текст"}
          </span>
          <button onClick={onClose} className="flex items-center justify-center transition-all active:scale-90"
            style={{ ...btnBase, width: 30, height: 30 }}>
            <X size={14} />
          </button>
        </div>

        {/* Editor */}
        <div className="px-4 pb-3">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full min-h-[80px] max-h-[160px] overflow-y-auto outline-none text-sm p-3"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1.5px solid rgba(200,200,220,0.5)',
              borderRadius: '14px',
              color: '#1a1a2e',
              lineHeight: 1.6,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
            }}
          />
        </div>

        {/* Toolbar — compact */}
        <div className="px-4 pb-3 flex flex-col gap-2.5">
          {/* Format buttons row */}
          <div className="flex items-center gap-1.5">
            <ToolBtn icon={<Bold size={15} strokeWidth={2.5} />} label="Жирный" onClick={() => exec("bold")} style={btnBase} />
            <ToolBtn icon={<Italic size={15} />} label="Курсив" onClick={() => exec("italic")} style={btnBase} />
            <ToolBtn icon={<Type size={15} strokeWidth={1} />} label="Тонкий" onClick={handleLight} style={btnBase} />
            <ToolBtn icon={<Underline size={15} />} label="Подчёрк." onClick={() => exec("underline")} style={btnBase} />

            <div className="w-px h-8 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

            <ToolBtn icon={<Palette size={15} />} label="Цвет" onClick={() => exec("foreColor", selectedAccent)} style={{ ...btnBase, color: selectedAccent }} />
            <ToolBtn icon={<Highlighter size={15} />} label="Фон" onClick={handleHighlight} style={{ ...btnBase, color: selectedAccent }} />

            <div className="w-px h-8 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

            <ToolBtn icon={<RotateCcw size={14} />} label="Сброс" onClick={handleResetFormatting} style={btnBase} />
          </div>

          {/* Color picker row */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium flex-shrink-0" style={labelStyle}>Акцент</span>
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedAccent(c)}
                  className="flex-shrink-0 rounded-full transition-all"
                  style={{
                    width: 22, height: 22,
                    background: c,
                    border: selectedAccent === c ? '2.5px solid rgba(26,26,46,0.7)' : c === '#ffffff' ? '1.5px solid rgba(200,200,220,0.6)' : '1.5px solid rgba(255,255,255,0.7)',
                    boxShadow: selectedAccent === c ? '0 0 0 1.5px rgba(255,255,255,0.6)' : '0 1px 3px rgba(0,0,0,0.08)',
                    transform: selectedAccent === c ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
              {/* Custom color picker */}
              <button
                onClick={() => colorInputRef.current?.click()}
                className="flex-shrink-0 rounded-full transition-all active:scale-90 flex items-center justify-center"
                style={{
                  width: 22, height: 22,
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              />
              <input
                ref={colorInputRef}
                type="color"
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value)}
                className="sr-only"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="px-4 pb-4 pt-1">
          <button
            onClick={handleSave}
            className="w-full py-2.5 text-[11px] font-medium transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(26,26,46,0.85)',
              color: '#fff',
              borderRadius: '12px',
              border: 'none',
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

const ToolBtn = ({
  icon, label, onClick, style,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  style: React.CSSProperties;
}) => (
  <button
    onClick={onClick}
    title={label}
    className="flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
    style={{ ...style, width: 40, height: 40, padding: '4px 2px' }}
  >
    {icon}
    <span className="text-[7px] font-medium leading-none" style={{ color: 'rgba(26,26,46,0.45)' }}>{label}</span>
  </button>
);

export default TextEditorModal;
