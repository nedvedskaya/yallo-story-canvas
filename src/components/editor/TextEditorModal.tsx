import { useRef, useEffect, useState, useCallback } from "react";
import { Bold, Italic, Underline, Type, Palette, Highlighter, X, RotateCcw, Strikethrough, List, ArrowRight } from "lucide-react";

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
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const highlightColorInputRef = useRef<HTMLInputElement>(null);
  
  const [textColor, setTextColor] = useState("#FF4200");
  const [highlightColor, setHighlightColor] = useState("#FFF3CD");
  const selectionRef = useRef<Range | null>(null);

  useEffect(() => {
    if (open && editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
      editorRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [open, initialHtml]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      selectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (selectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(selectionRef.current);
    }
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
  }, [onSave]);

  const handleLight = () => {
    exec("fontSize", "2");
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
    if (editorRef.current) onSave(editorRef.current.innerHTML);
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
      onSave(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };
  const handleListPrefix = useCallback((symbol: string) => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = range.toString();
    if (text) {
      const lines = text.split(/\n/);
      const prefixed = lines.map(l => {
        const trimmed = l.replace(/^[•→]\s*/, '');
        return trimmed ? `${symbol} ${trimmed}` : l;
      }).join('\n');
      range.deleteContents();
      const frag = document.createDocumentFragment();
      prefixed.split('\n').forEach((line, i, arr) => {
        frag.appendChild(document.createTextNode(line));
        if (i < arr.length - 1) frag.appendChild(document.createElement('br'));
      });
      range.insertNode(frag);
    } else {
      document.execCommand('insertText', false, `${symbol} `);
    }
    editorRef.current.focus();
    if (editorRef.current) onSave(editorRef.current.innerHTML);
  }, [onSave]);


  const applyTextColor = useCallback(() => {
    exec("foreColor", textColor);
    if (editorRef.current) onSave(editorRef.current.innerHTML);
  }, [exec, textColor, onSave]);

  // Apply highlight with current highlightColor
  const applyHighlight = useCallback(() => {
    exec("hiliteColor", highlightColor);
    if (editorRef.current) onSave(editorRef.current.innerHTML);
  }, [exec, highlightColor, onSave]);

  const handleTextColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    setTextColor(c);
    restoreSelection();
    document.execCommand("foreColor", false, c);
    editorRef.current?.focus();
    if (editorRef.current) onSave(editorRef.current.innerHTML);
  };

  const handleHighlightColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    setHighlightColor(c);
    restoreSelection();
    document.execCommand("hiliteColor", false, c);
    editorRef.current?.focus();
    if (editorRef.current) onSave(editorRef.current.innerHTML);
  };

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
        className="relative w-full max-w-md mx-3 mb-[calc(12px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-4 duration-200"
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
            onInput={handleInput}
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
        <div className="px-4 pb-4 flex items-center gap-1.5">
          <IconBtn icon={<Bold size={16} strokeWidth={2.5} />} title="Жирный" onClick={() => exec("bold")} style={btnBase} />
          <IconBtn icon={<Italic size={16} />} title="Курсив" onClick={() => exec("italic")} style={btnBase} />
          <IconBtn icon={<Type size={16} strokeWidth={1} />} title="Тонкий" onClick={handleLight} style={btnBase} />
          <IconBtn icon={<Underline size={16} />} title="Подчёркнутый" onClick={() => exec("underline")} style={btnBase} />
          <IconBtn icon={<Strikethrough size={16} />} title="Зачёркнутый" onClick={() => exec("strikeThrough")} style={btnBase} />

          <div className="w-px h-7 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

          <IconBtn icon={<List size={16} />} title="Список •" onClick={() => handleListPrefix('•')} style={btnBase} />
          <IconBtn icon={<ArrowRight size={16} />} title="Список →" onClick={() => handleListPrefix('→')} style={btnBase} />

          <div className="w-px h-7 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

          {/* Text color: icon applies last color, strip opens picker */}
          <ColorActionBtn
            icon={<Palette size={16} />}
            title="Цвет текста"
            color={textColor}
            onIconClick={applyTextColor}
            onStripClick={() => { saveSelection(); textColorInputRef.current?.click(); }}
            style={btnBase}
          />

          {/* Highlight: icon applies last color, strip opens picker */}
          <ColorActionBtn
            icon={<Highlighter size={16} />}
            title="Фон текста"
            color={highlightColor}
            onIconClick={applyHighlight}
            onStripClick={() => { saveSelection(); highlightColorInputRef.current?.click(); }}
            style={btnBase}
          />

          <div className="w-px h-7 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

          <IconBtn icon={<RotateCcw size={14} />} title="Сброс" onClick={handleResetFormatting} style={btnBase} />
        </div>

        {/* Hidden color pickers */}
        <input ref={textColorInputRef} type="color" value={textColor} onChange={handleTextColorPick}
          className="absolute w-0 h-0 opacity-0 pointer-events-none" />
        <input ref={highlightColorInputRef} type="color" value={highlightColor} onChange={handleHighlightColorPick}
          className="absolute w-0 h-0 opacity-0 pointer-events-none" />
      </div>
    </div>
  );
};

/* Simple icon button */
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

/* Color action button: icon + colored strip underneath */
const ColorActionBtn = ({
  icon, title, color, onIconClick, onStripClick, style,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  onIconClick: () => void;
  onStripClick: () => void;
  style: React.CSSProperties;
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <button
      onClick={onIconClick}
      title={title}
      className="flex items-center justify-center transition-all active:scale-90"
      style={{ ...style, width: 34, height: 30, color }}
    >
      {icon}
    </button>
    <button
      onClick={onStripClick}
      title={`Сменить ${title.toLowerCase()}`}
      className="rounded-full transition-all active:scale-90"
      style={{ width: 20, height: 4, background: color, border: '1px solid rgba(0,0,0,0.1)' }}
    />
  </div>
);

export default TextEditorModal;
