

# Исправления: компактный InfoPanel + корректный экспорт PNG/PDF

## Проблема экспорта

Из скриншота видно: PDF сохраняется с искажениями — текст слипается, пробелы пропадают, layout не совпадает с редактором. Причина: `html2canvas` захватывает слайды в их маленьком экранном размере (например, 240px шириной) и масштабирует до 1080px. При этом:
- CSS transforms (drag offset, pinch scale) рендерятся некорректно
- `backdrop-filter`, `blur` не поддерживаются html2canvas
- Шрифты и межсловные пробелы искажаются при масштабировании

## Решение

### 1. InfoPanel — компактнее

**Файл: `InfoPanel.tsx`**
- Уменьшить gap между элементами: `gap-3` → `gap-2`
- Убрать разделители (`<div className="h-px">`) — они занимают место
- Сделать строки тоньше: padding поменьше, font-size 10px вместо 11px

### 2. Экспорт PNG/PDF — рендер через офф-скрин контейнер

**Файл: `DownloadModal.tsx`** — полная переработка `captureSlides`

Вместо захвата маленьких превью-слайдов, создать **скрытый контейнер** (`position: fixed; left: -9999px`) с точными размерами экспорта (например, 1080×1350 для карусели). Для каждого слайда:

1. Создать `<div>` точно `formatInfo.width × formatInfo.height` пикселей
2. Отрисовать в нём содержимое слайда напрямую: фон, изображение/видео, текст, overlay — используя те же стили что и в SlideCarousel, но в натуральном размере
3. Захватить через `html2canvas` с `scale: 1` (уже в нужном размере)
4. Удалить контейнер

Это гарантирует pixel-perfect экспорт, потому что html2canvas рендерит DOM в натуральном размере без масштабирования.

**Конкретно:**
- Вынести функцию `renderSlideToDOM(slide, formatInfo, slideIndex, totalSlides)` которая создает DOM-элемент с точными размерами и стилями
- Эта функция воспроизводит layout из SlideCarousel: bgColor, bgImage/bgVideo, overlay, text с font/size/offset/scale, username, footer, arrow
- Для видео — рисовать текущий кадр как `<img>` (через canvas.drawImage)
- Текст позиционировать с учётом titleOffsetX/Y, bodyOffsetX/Y, titleScale, bodyScale

### 3. Общая функция стилей для слайда

**Файл: `shared-styles.ts`** — добавить функцию `getSlideContentStyles(slide, fmt)` которую используют и SlideCarousel для отображения, и DownloadModal для экспорта. Это гарантирует идентичный рендер.

## Файлы для изменения

1. `src/components/editor/InfoPanel.tsx` — компактнее
2. `src/components/editor/DownloadModal.tsx` — офф-скрин рендер вместо захвата превью
3. `src/components/editor/shared-styles.ts` — общие стили для слайда

