import { useRef, useEffect, useState, useCallback } from "react";
import { Bold, Italic, Underline, Type, Palette, Highlighter, X } from "lucide-react";

interface TextEditorModalProps {
  open: boolean;
  field: "title" | "body";
  initialHtml: string;
  accentColor?: string;
  onSave: (html: string) => void;
  onClose: () => void;
}

const ACCENT_COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#FF922B", "#CC5DE8", "#20C997", "#F06595",
];

const TextEditorModal = ({ open, field, initialHtml, onSave, onClose }: TextEditorModalProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_COLORS[3]);

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

  const handleBold = () => exec("bold");
  const handleItalic = () => exec("italic");
  const handleUnderline = () => exec("underline");

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

  const handleFontColor = () => exec("foreColor", selectedAccent);

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

  const handleSave = () => {
    const html = editorRef.current?.innerHTML || "";
    onSave(html);
    onClose();
  };

  if (!open) return null;

  const glassPanel: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1.5px solid rgba(200, 200, 220, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const toolBtnStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.7)',
    borderRadius: '14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
    color: '#4a4a6a',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)' }} />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-md mx-3 mb-[calc(80px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={glassPanel}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-base font-semibold" style={{ color: '#1a1a2e' }}>
            {field === "title" ? "Заголовок" : "Основной текст"}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-all active:scale-90"
            style={{
              ...toolBtnStyle,
              width: 32,
              height: 32,
              borderRadius: '10px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Editor area */}
        <div className="px-5 pb-4">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full min-h-[110px] max-h-[200px] overflow-y-auto outline-none text-base p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1.5px solid rgba(200, 200, 220, 0.5)',
              borderRadius: '16px',
              color: '#1a1a2e',
              lineHeight: 1.6,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
              fontWeight: 300,
            }}
          />
        </div>

        {/* Formatting toolbar */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-4">
            {/* Text formatting group */}
            <div className="flex items-center gap-1.5">
              <ToolBtn icon={<Bold size={18} strokeWidth={2.5} />} label="Жирный" onClick={handleBold} style={toolBtnStyle} />
              <ToolBtn icon={<Italic size={18} />} label="Курсив" onClick={handleItalic} style={toolBtnStyle} />
              <ToolBtn icon={<Type size={18} strokeWidth={1} />} label="Тонкий" onClick={handleLight} style={toolBtnStyle} />
              <ToolBtn icon={<Underline size={18} />} label="Подчёркнутый" onClick={handleUnderline} style={toolBtnStyle} />
            </div>

            {/* Separator */}
            <div className="w-px h-10 mx-0.5" style={{ background: 'rgba(200, 200, 220, 0.5)' }} />

            {/* Color tools */}
            <div className="flex items-center gap-1.5">
              <ToolBtn
                icon={<Palette size={18} />}
                label="Цвет текста"
                onClick={handleFontColor}
                style={{ ...toolBtnStyle, color: selectedAccent }}
              />
              <ToolBtn
                icon={<Highlighter size={18} />}
                label="Фон текста"
                onClick={handleHighlight}
                style={{ ...toolBtnStyle, color: selectedAccent }}
              />
            </div>
          </div>

          {/* Accent color picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium" style={{ color: 'rgba(26,26,46,0.5)' }}>Акцент</span>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedAccent(c)}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: selectedAccent === c ? 30 : 26,
                    height: selectedAccent === c ? 30 : 26,
                    background: c,
                    border: selectedAccent === c
                      ? '3px solid rgba(26,26,46,0.7)'
                      : '2px solid rgba(255,255,255,0.8)',
                    boxShadow: selectedAccent === c
                      ? '0 0 0 2px rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.15)'
                      : '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
              color: '#4a4a6a',
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
    className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90"
    style={{
      ...style,
      width: 52,
      height: 52,
      padding: '6px 2px',
    }}
  >
    {icon}
    <span className="text-[8px] font-medium leading-none" style={{ color: 'rgba(26,26,46,0.5)' }}>{label}</span>
  </button>
);

export default TextEditorModal;
