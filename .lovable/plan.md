

# Исправить экспорт видео-слайдов

## Проблема

В двух местах кода при загрузке видео для экспорта устанавливается `crossOrigin = "anonymous"` на элементе `<video>`. Когда источник видео — blob URL (`blob:...`, создан через `URL.createObjectURL`), атрибут `crossOrigin` мешает загрузке или вызывает tainted canvas, из-за чего `captureVideoFrame` возвращает пустую строку, а `recordVideoSlide` падает с ошибкой.

## Решение

### Файл 1: `src/components/editor/export-utils.ts`

В `loadVideoFrame` — убрать `v.crossOrigin = "anonymous"` для blob URL:

```ts
if (!src.startsWith("blob:")) v.crossOrigin = "anonymous";
```

### Файл 2: `src/components/editor/DownloadModal.tsx`

В `recordVideoSlide` (строка 161) — аналогично:

```ts
if (!slide.bgVideo!.startsWith("blob:")) video.crossOrigin = "anonymous";
```

Два изменения в двух файлах. Картинки уже работают, так как у `<img>` в `renderSlideToDOM` нет проблемы с blob URL.

