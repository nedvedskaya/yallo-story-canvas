import { useRef, useEffect, useState, useCallback } from "react";
import { Bold, Italic, Underline, Type, Palette, Highlighter, X, RotateCcw, Strikethrough } from "lucide-react";

interface TextEditorModalProps {
  open: boolean;
  field: "title" | "body";
  initialHtml: string;
  accentColor?: string;
  onSave: (html: string) => void;
  onClose: () => void;
}

const TextEditorModal = ({ open, field, initialHtml, onSave, onClose }: TextEditorModalProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [accentColor, setAccentColor] = useState("#4D96FF");
  const [hexInput, setHexInput] = useState("#4D96FF");

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
    exec("fontSize", "2");
    // Find the font elements created by fontSize and replace with span
    if (editorRef.current) {
      const fonts = editorRef.current.querySelectorAll('font[size="2"]');
      fonts.forEach((font) => {
        const span = document.createElement("span");
        span.style.fontWeight = "300";
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
    }
    editorRef.current?.focus();
  };

  const handleHighlight = () => {
    exec("hiliteColor", accentColor);
  };

  const handleResetFormatting = () => {
    exec("removeFormat");
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

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    setAccentColor(c);
    setHexInput(c);
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setAccentColor(val);
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
  }, [onSave]);

  if (!open) return null;

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

        {/* Toolbar */}
        <div className="px-4 pb-3 flex flex-col gap-2.5">
          {/* Format icons — no labels */}
          <div className="flex items-center gap-1.5">
            <IconBtn icon={<Bold size={16} strokeWidth={2.5} />} title="Жирный" onClick={() => exec("bold")} style={btnBase} />
            <IconBtn icon={<Italic size={16} />} title="Курсив" onClick={() => exec("italic")} style={btnBase} />
            <IconBtn icon={<Type size={16} strokeWidth={1} />} title="Тонкий" onClick={handleLight} style={btnBase} />
            <IconBtn icon={<Underline size={16} />} title="Подчёркнутый" onClick={() => exec("underline")} style={btnBase} />
            <IconBtn icon={<Strikethrough size={16} />} title="Зачёркнутый" onClick={() => exec("strikeThrough")} style={btnBase} />

            <div className="w-px h-7 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

            <IconBtn icon={<Palette size={16} />} title="Цвет текста" onClick={() => exec("foreColor", accentColor)} style={{ ...btnBase, color: accentColor }} />
            <IconBtn icon={<Highlighter size={16} />} title="Фон текста" onClick={handleHighlight} style={{ ...btnBase, color: accentColor }} />

            <div className="w-px h-7 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

            <IconBtn icon={<RotateCcw size={14} />} title="Сброс" onClick={handleResetFormatting} style={btnBase} />
          </div>

          {/* Accent color — like BackgroundPanel */}
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium flex-shrink-0" style={{ color: 'rgba(26,26,46,0.5)' }}>Акцентный цвет</p>
            <div className="relative w-6 h-6 flex-shrink-0">
              <div className="w-6 h-6 rounded-full" style={{
                background: accentColor,
                border: '2px solid rgba(255,255,255,0.8)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }} />
              <input ref={colorInputRef} type="color" value={accentColor} onChange={handleColorPickerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              maxLength={7}
              className="w-20 rounded-lg px-2 py-1 text-xs font-mono outline-none"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(200,200,220,0.5)',
                color: '#1a1a2e',
              }}
            />
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
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

const IconBtn = ({
  icon, title, onClick, style,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  style: React.CSSProperties;
}) => (
  <button
    onClick={onClick}
    title={title}
    className="flex items-center justify-center transition-all active:scale-90"
    style={{ ...style, width: 34, height: 34 }}
  >
    {icon}
  </button>
);

export default TextEditorModal;
