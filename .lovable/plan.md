

# Plan: Desktop carousel fix + collapsible spacing controls + Telegram Mini App guidance

## 1. Desktop: first slide not editable / not centered

**Problem**: The carousel uses CSS scroll-snap with `scrollIntoView({ inline: "center" })`. On desktop (817px viewport), the first slide can't scroll to center because there's not enough left padding — it stays stuck at the left edge.

**Fix** in `src/components/editor/SlideCarousel.tsx`:
- Add horizontal padding to the scroll container equal to ~50% of the viewport width minus half a slide width. This creates enough space for the first and last slides to scroll to center.
- Replace `px-8` with dynamic padding: `paddingLeft: 'calc(50vw - 160px)'` and `paddingRight: 'calc(50vw - 160px)'` (adjusting for slide width). This ensures any slide, including the first, can be centered.

Specifically, change the scroll container div:
```tsx
// Before:
className="... px-8 ..."

// After: remove px-8, add inline style padding
style={{
  ...existing styles,
  paddingLeft: 'calc(50% - 160px)',
  paddingRight: 'calc(50% - 160px)',
}}
```
The `160px` = half of the default slide width (~320px for carousel). This centers the first/last slides.

## 2. Hide line height & tracking behind "Advanced" toggle

**Problem**: "Высота строки" and "Трекинг" labels are confusing. User wants them hidden under an expandable "extra settings" section, renamed to "Межстрочный интервал" and "Межбуквенный интервал".

**Fix** in `src/components/editor/FontSection.tsx`:
- Add a `useState<boolean>(false)` for `showAdvanced`
- Keep Size and Case rows always visible
- Wrap line-height and letter-spacing rows in a collapsible section
- Add a small "Ещё" / "Скрыть" toggle button below Case
- Rename labels: "Высота строки" → "Межстрочный" and "Трекинг" → "Межбуквенный"

Also reduce default `bodyLineHeight` in templates and initial slides:
- In `src/components/editor/TemplatesPanel.tsx`: change `bodyLineHeight: 1.65` → `1.4` (both templates)
- In `src/components/editor/TextPanel.tsx`: change default `bodyLineHeight` fallback from `1.5` → `1.4` (line 90)

## 3. Telegram Mini App + Timeweb Cloud guidance

This is an informational answer, not a code change. Key points:
- The app is already a client-side SPA — it can run inside Telegram Mini App via `WebApp.init()` from `@twa-dev/sdk`
- Need to add `<script src="https://telegram.org/js/telegram-web-app.js">` to `index.html`
- For Timeweb Cloud DB: add a backend API (e.g. Supabase or a simple Express server hosted on Timeweb) and call it from the frontend
- The current Lovable project can be published and used as the Mini App URL in BotFather

## Files changed

| # | File | Change |
|---|------|--------|
| 1 | `SlideCarousel.tsx` | Add centering padding to scroll container |
| 2 | `FontSection.tsx` | Collapsible advanced section, rename labels |
| 3 | `TemplatesPanel.tsx` | Reduce bodyLineHeight 1.65 → 1.4 |
| 4 | `TextPanel.tsx` | Reduce default bodyLineHeight 1.5 → 1.4 |

