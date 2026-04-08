# Plan: Label overflow fix + clean initial state + onboarding tutorial

## 1. Slider labels clipped behind thumb

**File**: `src/components/editor/FontSection.tsx`

The labels "Межстрочный" and "Межбуквенный" use `w-16` (64px) which is too narrow — text gets hidden behind the slider thumb.

**Fix**: Change `w-16` → `w-24` (96px) on the advanced labels (lines 163, 173) that contain longer text. Keep `w-16` for short labels like "Размер" and "Регистр" — those fit fine. Also remove the SVG icons from the labels to save space and reduce visual clutter.

## 2. Remove 3 example slides, start with 1 blank slide

**File**: `src/pages/Index.tsx`

Replace the 3 `initialSlides` with a single blank slide:

```ts
const initialSlides: Slide[] = [
  {
    id: 1, username: "@username", title: "Заголовок",
    body: "Текст слайда",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bgType: "color", hAlign: "left", vAlign: "center",
    overlayType: "none", overlayOpacity: 50,
    bgScale: 100, bgPosX: 50, bgPosY: 50, bgDarken: 0,
  },
];
```

Set `nextId = 2`.

## 3. Onboarding tutorial (step-by-step overlay)

**New file**: `src/components/editor/OnboardingOverlay.tsx`  
  
`Когда пользователь нажимает на логотип с левой стороны наверху, то включается функуция обучения (об этом должна быть пометка)`

A lightweight 5-step tooltip overlay using absolute positioning:

1. **Слайд** — "Нажми на текст, чтобы изменить его. Перетаскивай элементы, чтобы расположить как тебе нужно"
2. **Шаблоны** — "Выбери любой готовый шаблон, который тебе нравится"
3. **Фон** — "Загрузи фото или видео, либо выбери подходящий цвет фона"
4. **Текст** — "Меняй шрифт, размер и цвет заголовка и основного текста"
5. **Экспорт** — "Экспортируй слайд в PNG, PDF или видео"

Implementation:

- Each step highlights a target area with a dark semi-transparent backdrop (using CSS `clip-path` to cut a hole around the target)
- Arrow pointer + tooltip card positioned near the highlighted element
- "Далее" / "Готово" button to advance steps
- Store `onboarding_done` in `localStorage` to show only once
- Add a `?` button in TopBar to re-trigger onboarding

**Files changed**:


| File                    | Change                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `FontSection.tsx`       | Widen advanced labels from `w-16` to `w-24`, remove SVG icons                       |
| `Index.tsx`             | 1 blank slide instead of 3, `nextId = 2`                                            |
| `OnboardingOverlay.tsx` | New — 5-step tutorial overlay with highlights                                       |
| `Index.tsx`             | Import + render OnboardingOverlay, add `data-onboarding` attributes to key elements |
| `TopBar.tsx`            | Add `?` help button to re-launch onboarding                                         |
