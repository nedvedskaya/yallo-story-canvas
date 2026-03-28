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

const TextEditorModal = ({ open, field, initialHtml, accentColor: _ac, onSave, onClose }: TextEditorModalProps) => {
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

  const handleFontColor = () => {
    exec("foreColor", selectedAccent);
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

  const handleSave = () => {
    const html = editorRef.current?.innerHTML || "";
    onSave(html);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md mx-2 mb-2 animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(200,200,220,0.5)",
          borderRadius: "20px",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>
            {field === "title" ? "Заголовок" : "Основной текст"}
          </span>
          <button onClick={onClose} className="p-1 rounded-full" style={{ color: "rgba(26,26,46,0.5)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Editor area */}
        <div className="px-5 pb-3">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full min-h-[100px] max-h-[200px] overflow-y-auto outline-none text-sm p-3 rounded-xl"
            style={{
              background: "rgba(26,26,46,0.04)",
              border: "1px solid rgba(26,26,46,0.1)",
              color: "#1a1a2e",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Formatting toolbar */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1 mb-3">
            <ToolBtn icon={<Bold size={16} />} label="Жирный" onClick={handleBold} />
            <ToolBtn icon={<Italic size={16} />} label="Курсив" onClick={handleItalic} />
            <ToolBtn icon={<Type size={16} strokeWidth={1.2} />} label="Тонкий" onClick={handleLight} />
            <ToolBtn icon={<Underline size={16} />} label="Подчёркнутый" onClick={handleUnderline} />
            <div className="w-px h-6 mx-1" style={{ background: "rgba(26,26,46,0.1)" }} />
            <ToolBtn icon={<Palette size={16} />} label="Цвет текста" onClick={handleFontColor} activeColor={selectedAccent} />
            <ToolBtn icon={<Highlighter size={16} />} label="Фон текста" onClick={handleHighlight} activeColor={selectedAccent} />
          </div>

          {/* Accent color picker */}
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "rgba(26,26,46,0.5)" }}>Акцент</span>
            <div className="flex gap-1.5">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedAccent(c)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{
                    background: c,
                    border: selectedAccent === c ? "2.5px solid #1a1a2e" : "2px solid rgba(255,255,255,0.8)",
                    boxShadow: selectedAccent === c ? "0 0 0 1px rgba(26,26,46,0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
                    transform: selectedAccent === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon, label, onClick, activeColor }: { icon: React.ReactNode; label: string; onClick: () => void; activeColor?: string }) => (
  <button
    onClick={onClick}
    title={label}
    className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all active:scale-95"
    style={{
      background: "rgba(26,26,46,0.05)",
      border: "1px solid rgba(26,26,46,0.08)",
      color: activeColor || "#1a1a2e",
    }}
  >
    {icon}
    <span className="text-[9px]" style={{ color: "rgba(26,26,46,0.5)" }}>{label}</span>
  </button>
);

export default TextEditorModal;
