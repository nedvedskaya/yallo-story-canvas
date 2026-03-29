# Исправить отображение шаблона "Минимализм" на слайде

## Проблема

Из скриншота видно: на слайде после применения шаблона текст белый на светлом фоне (невидимый), нет сетки. Эталон (фото 2): тёмный текст `#1A1A1A`, акцент `#FF4200`, сетка из тонких линий на светлом фоне `#F3F3F3`, счётчик `[ 1/2 ]`.

**Причины:**

1. `SlideFrame.tsx` жёстко задаёт белый цвет для всего текста: `color: '#ffffff'`, `rgba(255,255,255,0.7)` для username/counter, `rgba(255,255,255,0.6)` для footer
2. `SlideOverlay.tsx` рисует сетку белыми линиями (`rgba(255,255,255,0.25)`) — невидимы на `#F3F3F3`
3. Шаблон не включает `overlayType: "grid"`
4. В типе `Slide` нет полей для цвета текста — он всегда белый

## Решение

### 1. Добавить поля цвета текста в Slide

**Файл: `SlideCarousel.tsx**` — добавить в интерфейс `Slide`:

- `titleColor?: string` (по умолчанию `#ffffff`)
- `bodyColor?: string` (по умолчанию `rgba(255,255,255,0.85)`)
- `metaColor?: string` (цвет username, счётчика, footer, стрелки; по умолчанию `rgba(255,255,255,0.7)`)
- `overlayColor?: string` (цвет линий оверлея; по умолчанию `rgba(255,255,255,0.25)`)

### 2. Использовать эти цвета в SlideFrame

**Файл: `slide-render-model.ts**` — в `getTitleStyle` и `getBodyStyle` читать `slide.titleColor` / `slide.bodyColor` вместо хардкода.

**Файл: `SlideFrame.tsx**` — для username, counter, footer, arrow использовать `slide.metaColor` вместо хардкода белых rgba-значений.

### 3. Поддержка цвета оверлея в SlideOverlay

**Файл: `SlideOverlay.tsx**` — добавить проп `color?: string`, использовать его вместо захардкоженного `rgba(255,255,255,...)`. По умолчанию белый (обратная совместимость).

**Файл: `SlideFrame.tsx**` — передавать `slide.overlayColor` в `<SlideOverlay>`.

### 4. Обновить шаблон "Минимализм"

**Файл: `TemplatesPanel.tsx**` — в `apply` добавить:

```
overlayType: "grid",
overlayOpacity: 40,
titleColor: "#1A1A1A",
bodyColor: "#1A1A1A",
metaColor: "#999999",
overlayColor: "rgba(0,0,0,0.08)",
showFooter: true,
footerText: "Надпись",
showArrow: true,
showUsername: true,
showSlideCount: true,
```

## Файлы для изменения

1. `src/components/editor/SlideCarousel.tsx` — поля `titleColor`, `bodyColor`, `metaColor`, `overlayColor` в интерфейсе `Slide`
2. `src/components/editor/slide-render-model.ts` — использовать цвета из slide
3. `src/components/editor/SlideFrame.tsx` — использовать цвета + формат счётчика
4. `src/components/editor/SlideOverlay.tsx` — проп `color`