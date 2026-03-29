

# Исправление двух багов в экспорте

## Баг 1: `cleanupContainer` создаёт новый React root вместо закрытия оригинального

**Файл: `DownloadModal.tsx`, строки 103-109**

Сейчас `cleanupContainer` делает `createRoot(container)` — это создаёт **второй** root на том же DOM-узле, а оригинальный root из `renderSlideToDOM` (строка 59) никогда не закрывается. React выдаёт предупреждение, рендер может сломаться при повторных вызовах.

**Исправление**: `renderSlideToDOM` должен возвращать и контейнер, и root. `cleanupContainer` должен вызывать `root.unmount()` на **оригинальном** root.

## Баг 2: Видео-слайды в PNG/PDF — чёрный кадр

**Файл: `DownloadModal.tsx`, функция `captureSlide`**

При экспорте видео-слайда в PNG/PDF, `SlideFrame` рендерит `<video>` элемент. Но **`html2canvas` не умеет захватывать содержимое `<video>`** — вместо кадра будет чёрный прямоугольник.

**Исправление**: Перед захватом видео-слайда — извлечь кадр из видео через canvas (`captureVideoFrame`), подставить его как `bgImage` в слайд (временно убрав `bgVideo`), и рендерить `SlideFrame` с изображением вместо видео.

## Конкретные изменения

**`DownloadModal.tsx`**:

1. Изменить `renderSlideToDOM` — возвращать `{ container, root }` вместо просто `container`
2. Изменить `cleanupContainer` — принимать `root` и вызывать `root.unmount()`
3. Обновить все вызовы `renderSlideToDOM` и `cleanupContainer` под новую сигнатуру
4. В `captureSlide`: если у слайда есть `bgVideo`, перед рендером захватить кадр через `loadVideoFrame()` из `export-utils.ts`, создать копию слайда с `bgImage = frame, bgVideo = undefined` и рендерить её

