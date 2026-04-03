

# Plan: 6 fixes for the slide editor

## 1. Unified "Apply to all" button style

**Problem**: Three different panels (Background, Text, Info) have differently styled "Apply to all" buttons.

**Solution**: Standardize all three to use the same compact right-aligned pill button style (already used in TextPanel and InfoPanel). Remove the full-width button from BackgroundPanel and match the style.

**Files**: `BackgroundPanel.tsx`, `TextPanel.tsx`, `InfoPanel.tsx`
- All three get identical style: `px-4 py-1.5 rounded-lg text-xs`, background `rgba(26,26,46,0.08)`, border `1px solid rgba(26,26,46,0.15)`, right-aligned in a flex-end container
- Consistent label: "Применить ко всем" (short form)

## 2. Fix photo-background export (PNG/PDF)

**Problem**: The uploaded screenshot shows the background photo is cut off (only left portion visible) when exported. The `getMediaStyle` export path calculates dimensions incorrectly — `Math.max(containerWidth, containerHeight * 2)` produces oversized values that don't properly cover the container.

**Solution** in `slide-render-model.ts`: Replace the export branch of `getMediaStyle` with proper cover-fit logic:
- Calculate aspect ratio of container
- Scale image to cover the container (like CSS `object-fit: cover`)
- Apply user's bgScale and bgPos as offsets from center

**File**: `slide-render-model.ts` — rewrite the `containerWidth && containerHeight` branch

## 3. Templates preserve user content (photos, videos, text)

**Problem**: `handleApplyTemplate` spreads `tpl.apply` over every slide, which includes `bgImage: undefined` and `bgVideo: undefined`, erasing user's uploaded media.

**Solution** in `Index.tsx`: In `handleApplyTemplate`, remove `bgImage`, `bgVideo`, `bgVideoFile`, `bgScale`, `bgPosX`, `bgPosY`, `bgDarken` from `tpl.apply` if the slide already has media. Also preserve existing `title` and `body` text content (only restyle, don't replace text).

**File**: `Index.tsx` — modify `handleApplyTemplate` to skip media/text-content fields when slide has existing media

## 4. Overlay improvements: remove Noise, improve Blobs and Cells

**Problem**: "Шум" (noise) to be removed. "Блики" (blobs) needs color picker support. "Ячейки" (cells) needs visual improvement.

**Changes**:
- `BackgroundPanel.tsx`: Remove "noise" from `overlayOptions`. Add a color picker for `overlayColor` below the overlay selector (visible when overlay is not "none")
- `SlideOverlay.tsx`: 
  - **Blobs**: Use 3 smaller gradient circles with more varied placement and stronger blur for a softer glow effect
  - **Cells**: Switch from hexagons to a subtler diamond/rhombus pattern with thinner strokes, or improve hex sizing to look more polished

**Files**: `BackgroundPanel.tsx`, `SlideOverlay.tsx`

## 5. Better interval labels in FontSection

**Problem**: Both "Line height" and "Letter spacing" show the same label "Интервал" — confusing.

**Solution** in `FontSection.tsx`:
- Line height label: "Высота строки" (with the existing lines icon)
- Letter spacing label: "Трекинг" (with the existing arrows icon)

**File**: `FontSection.tsx` — change two label strings

## 6. Stories format: adapt font size

**Problem**: When switching to Stories (9:16), the font size stays the same as carousel but the slide is taller/narrower, making text look oversized.

**Solution** in `shared-styles.ts`: Reduce Stories default `titleSize` from 20 to 16 and `bodySize` from 12 to 10. This makes text proportional to the narrower slide width.

**File**: `shared-styles.ts` — update stories row in `FORMAT_TEXT_DEFAULTS`

---

## Technical summary

| # | Files | Change |
|---|-------|--------|
| 1 | BackgroundPanel, TextPanel, InfoPanel | Unify button style |
| 2 | slide-render-model.ts | Fix export media cover calculation |
| 3 | Index.tsx | Template preserves user media/text |
| 4 | BackgroundPanel, SlideOverlay | Remove noise, add overlay color picker, improve blobs/cells |
| 5 | FontSection.tsx | Rename interval labels |
| 6 | shared-styles.ts | Smaller stories font defaults |

