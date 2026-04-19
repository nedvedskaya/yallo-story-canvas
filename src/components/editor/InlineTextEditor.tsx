import { useRef, useEffect, useState, useCallback } from "react";
import { Bold, Italic, Underline, Type, Palette, Highlighter, RotateCcw, Strikethrough, List, ArrowRight } from "lucide-react";

interface InlineTextEditorProps {
  /** HTML value */
  value: string;
  /** Called on every change with new HTML */
  onChange: (html: string) => void;
  placeholder?: string;
  /** Default text-color for the "Цвет" swatch (falls back to red for back-compat).
   *  Should match slide.titleColor / bodyColor so the button visually matches the
   *  active template. Changing slides re-syncs the swatch. */
  defaultTextColor?: string;
  /** Default highlight color for the "Фон" swatch (falls back to light yellow).
   *  Should match slide.accentColor so Minimalism shows blue, etc. */
  defaultHighlightColor?: string;
}

/**
 * Inline rich-text editor for use inside the Text panel.
 * Provides Bold/Italic/Underline/Strikethrough/Light/List/Color/Highlight controls.
 */
const InlineTextEditor = ({ value, onChange, placeholder, defaultTextColor, defaultHighlightColor }: InlineTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const highlightColorInputRef = useRef<HTMLInputElement>(null);

  const [textColor, setTextColor] = useState(defaultTextColor || "#FF4200");
  const [highlightColor, setHighlightColor] = useState(defaultHighlightColor || "#FFF3CD");

  // Re-sync swatches when the active slide/template changes so the buttons
  // reflect the current palette (Minimalism = blue highlight, etc.).
  useEffect(() => {
    if (defaultTextColor) setTextColor(defaultTextColor);
  }, [defaultTextColor]);
  useEffect(() => {
    if (defaultHighlightColor) setHighlightColor(defaultHighlightColor);
  }, [defaultHighlightColor]);
  const selectionRef = useRef<Range | null>(null);
  const isFocusedRef = useRef(false);

  // Sync external value into editor only when not focused (to avoid caret jumping)
  useEffect(() => {
    if (!editorRef.current) return;
    if (isFocusedRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      selectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (selectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(selectionRef.current);
    } else if (editorRef.current) {
      // Place caret at end
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange, restoreSelection]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleLight = () => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("fontSize", false, "2");
    if (editorRef.current) {
      const fonts = editorRef.current.querySelectorAll('font[size="2"]');
      fonts.forEach((font) => {
        const span = document.createElement("span");
        span.style.fontWeight = "300";
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleResetFormatting = () => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("removeFormat");
    if (editorRef.current) {
      const spans = editorRef.current.querySelectorAll("span[style]");
      spans.forEach((span) => {
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) parent.insertBefore(span.firstChild, span);
          parent.removeChild(span);
        }
      });
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleListPrefix = useCallback((symbol: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
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
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange, restoreSelection]);

  const applyTextColor = useCallback(() => {
    exec("foreColor", textColor);
  }, [exec, textColor]);

  const applyHighlight = useCallback(() => {
    exec("hiliteColor", highlightColor);
  }, [exec, highlightColor]);

  const handleTextColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    setTextColor(c);
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("foreColor", false, c);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleHighlightColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.target.value;
    setHighlightColor(c);
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("hiliteColor", false, c);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const btnBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.7)',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
    color: '#4a4a6a',
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => { isFocusedRef.current = true; }}
        onBlur={() => { isFocusedRef.current = false; saveSelection(); }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        data-placeholder={placeholder}
        className="w-full min-h-[64px] max-h-[140px] overflow-y-auto outline-none text-sm p-3"
        style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1.5px solid rgba(200,200,220,0.5)',
          borderRadius: '14px',
          color: '#1a1a2e',
          lineHeight: 1.6,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <IconBtn icon={<Bold size={14} strokeWidth={2.5} />} title="Жирный" onClick={() => exec("bold")} style={btnBase} />
        <IconBtn icon={<Italic size={14} />} title="Курсив" onClick={() => exec("italic")} style={btnBase} />
        <IconBtn icon={<Type size={14} strokeWidth={1} />} title="Тонкий" onClick={handleLight} style={btnBase} />
        <IconBtn icon={<Underline size={14} />} title="Подчёркнутый" onClick={() => exec("underline")} style={btnBase} />
        <IconBtn icon={<Strikethrough size={14} />} title="Зачёркнутый" onClick={() => exec("strikeThrough")} style={btnBase} />

        <div className="w-px h-6 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

        <IconBtn icon={<List size={14} />} title="Список •" onClick={() => handleListPrefix('•')} style={btnBase} />
        <IconBtn icon={<ArrowRight size={14} />} title="Список →" onClick={() => handleListPrefix('→')} style={btnBase} />

        <div className="w-px h-6 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

        <ColorActionBtn
          icon={<Palette size={14} />}
          title="Цвет"
          color={textColor}
          onIconClick={applyTextColor}
          onStripClick={() => { saveSelection(); textColorInputRef.current?.click(); }}
          style={btnBase}
        />

        <ColorActionBtn
          icon={<Highlighter size={14} />}
          title="Фон"
          color={highlightColor}
          onIconClick={applyHighlight}
          onStripClick={() => { saveSelection(); highlightColorInputRef.current?.click(); }}
          style={btnBase}
        />

        <div className="w-px h-6 mx-0.5" style={{ background: 'rgba(200,200,220,0.5)' }} />

        <IconBtn icon={<RotateCcw size={12} />} title="Сброс" onClick={handleResetFormatting} style={btnBase} />
      </div>

      <input ref={textColorInputRef} type="color" value={textColor} onChange={handleTextColorPick}
        className="absolute w-0 h-0 opacity-0 pointer-events-none" />
      <input ref={highlightColorInputRef} type="color" value={highlightColor} onChange={handleHighlightColorPick}
        className="absolute w-0 h-0 opacity-0 pointer-events-none" />
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
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    className="flex items-center justify-center transition-all active:scale-90 active:opacity-80"
    style={{ ...style, width: 30, height: 30 }}
  >
    {icon}
  </button>
);

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
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onIconClick}
      title={title}
      className="flex items-center justify-center transition-all active:scale-90 active:opacity-80"
      style={{ ...style, width: 30, height: 26, color }}
    >
      {icon}
    </button>
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onStripClick}
      title={`Сменить ${title.toLowerCase()}`}
      className="rounded-full transition-all active:scale-90 active:opacity-80"
      style={{ width: 18, height: 4, background: color, border: '1px solid rgba(0,0,0,0.1)' }}
    />
  </div>
);

export default InlineTextEditor;
