

# Исправления: экспорт PNG, качество медиа, drag текста

## 1. PNG экспорт не работает + индикатор загрузки

**Проблема**: `html2canvas` плохо работает на мобильных с `video`, `blob:` URL и сложными стилями. ZIP-архив может не скачиваться на iOS (link.click() не всегда срабатывает).

**Решение** в `DownloadModal.tsx`:
- Добавить прогресс-бар: state `progress` (0-100), обновлять после каждого слайда
- На iOS/мобильных использовать `window.open(URL.createObjectURL(blob))` вместо `link.click()` как fallback
- Для видео-слайдов: перед захватом ставить текущий кадр на `canvas` вручную через `video.currentTime` + `ctx.drawImage(video, ...)`
- Показывать текст "Подготовка слайда 1 из N..." во время загрузки
- Добавить toast-уведомление после успешного скачивания

## 2. Сохранение качества фото и видео при экспорте

**В `DownloadModal.tsx`**:
- В `captureSlides`: использовать `scale: Math.max(2, formatInfo.width / el.offsetWidth)` — минимум 2x для ретины
- Для PNG: `canvas.toDataURL("image/png")` уже без сжатия — ОК
- Для PDF: использовать `"PNG"` формат (без JPEG сжатия) — уже так

## 3. Drag текста не должен открывать редактор

**Проблема**: `onClick` на `<h2>` / `<p>` вызывает `openEditor()` даже после drag. Нужно различать клик и drag.

**Решение** в `SlideCarousel.tsx`:
- Добавить ref `textDragMovedRef = useRef(false)`
- В `handleTextTouchMove` и mouse move: если `|dx| + |dy| > 5` — установить `textDragMovedRef.current = true`
- В `handleTextTouchStart` и `handleTextMouseDown`: сбросить `textDragMovedRef.current = false`
- В `onClick` на `<h2>` / `<p>`: проверять `if (textDragMovedRef.current) return;` — если был drag, не открывать редактор

## 4. Перетаскивание заголовка двигает основной текст и наоборот

**Проблема**: `dragOffset` и `pinchScale` — общие state для title и body. Когда тянем body, `dragOffset` обновляется, и title тоже проверяет `dragOffset !== null && textDragTarget.current === "title"` — но `textDragTarget.current` может не совпадать с реальным target из-за race condition между touch events.

**Решение** в `SlideCarousel.tsx`:
- Разделить state: `titleDragOffset` / `bodyDragOffset` и `titlePinchScale` / `bodyPinchScale` вместо общих `dragOffset` / `pinchScale`
- В handlers обновлять только соответствующий state в зависимости от `textDragTarget.current`
- В `transform` на title-обёртке читать только `titleDragOffset`, на body — только `bodyDragOffset`
- Это устраняет cross-contamination между title и body drag

## Файлы для изменения

1. `src/components/editor/DownloadModal.tsx` — прогресс-бар, fallback скачивания, качество
2. `src/components/editor/SlideCarousel.tsx` — раздельные drag state, флаг textDragMoved для предотвращения открытия редактора

