

# Plan: Stories font adaptation + list formatting in text editor

## Problem 1: Text doesn't adapt to Stories format

When switching to Stories (9:16), the font stays the same size because slides have per-slide `titleSize`/`bodySize` values that override the format defaults in `getSlideMetrics()`. The format defaults (16/10 for stories) are only used when `slide.titleSize` is `undefined`, but once any font size is set on a slide, the format change is ignored.

**Fix** in `src/pages/Index.tsx`: When format changes to stories (or any format), reset per-slide `titleSize` and `bodySize` to `undefined` so the format defaults take effect.

```
onSlideFormatChange={(fmt) => {
  setSlideFormat(fmt);
  setSlidesWithHistory(prev => prev.map(s => ({
    ...s,
    titleSize: undefined,
    bodySize: undefined,
    ...(fmt === "stories" ? { showUsername: false, showSlideCount: false } : {}),
  })));
}}
```

## Problem 2: List formatting (bullets/arrows) in text editor

Currently the text editor (`TextEditorModal.tsx`) only supports bold, italic, underline, strikethrough, color, and highlight. There's no way to insert bullet points or arrow lists.

**Fix** in `src/components/editor/TextEditorModal.tsx`: Add two toolbar buttons:
- **Bullet list** (•) — inserts `insertUnorderedList` via `execCommand`, or wraps selected text with `• ` prefix per line
- **Arrow list** (→) — wraps each line of selection with `→ ` prefix

Since `execCommand('insertUnorderedList')` creates `<ul><li>` which may not render well on slides, a simpler approach: add two buttons that prepend `• ` or `→ ` to each line of the current selection/content. This keeps the output as plain styled text with line breaks.

Implementation:
- Add `List` and `ArrowRight` icons from lucide-react
- Two new toolbar buttons after existing formatting buttons
- Each button calls a helper that splits selected text by `<br>` or newlines, prepends the symbol, and replaces the selection

## Files changed

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Reset titleSize/bodySize to undefined on format change |
| `src/components/editor/TextEditorModal.tsx` | Add bullet (•) and arrow (→) list buttons to toolbar |

