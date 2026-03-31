

# Исправить экспорт PNG и PDF на мобильных

## Проблема 1: PNG не скачивается на мобильном

`triggerDownload()` вызывается после длинной цепочки `await` (рендер → html2canvas → ZIP). К этому моменту браузер считает user gesture утраченным:
- iOS Safari: `window.open()` блокируется popup-блокером
- Android Chrome: `<a>.click()` может быть проигнорирован

**Решение**: Создать промежуточный `<a>` элемент сразу при клике пользователя (пока gesture ещё активен), а после завершения async-работы присвоить ему `href` и вызвать `click()`. Альтернативно — использовать `navigator.share()` API на мобильных (поддерживается и iOS и Android), что не требует user gesture в момент вызова для blob-файлов.

## Проблема 2: PDF сохраняется криво

`getPreviewWidth()` берёт ширину текущего видимого слайда через `document.querySelector("[data-slide-id]")`. На мобильном:
- Модальное окно скачивания перекрывает слайд
- Слайд может быть скрыт/сжат
- Возвращается неверная ширина (или fallback 220-290px)

Масштаб `scale = exportWidth / previewWidth` получается неправильным → все размеры текста, отступы, оверлеи искажаются.

**Решение**: Заменить динамический `getPreviewWidth()` на фиксированные значения per-format. Размеры в `FORMAT_TEXT_DEFAULTS` рассчитаны под конкретные превью-ширины, которые фиксированы в CSS.

## Файлы для изменения

### `src/components/editor/DownloadModal.tsx`

1. **`getPreviewWidth()`** — заменить DOM-запрос на фиксированные значения:
```ts
function getPreviewWidth(format: SlideFormat): number {
  switch (format) {
    case "stories": return 220;
    case "square": return 270;
    case "presentation": return 380;
    default: return 290; // carousel
  }
}
```

2. **`triggerDownload()`** — использовать `navigator.share()` на мобильных как основной метод, с fallback на `<a>`:
```ts
async function triggerDownload(blob: Blob, filename: string) {
  // Мобильные: используем share API если доступен
  if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      const file = new File([blob], filename, { type: blob.type });
      await navigator.share({ files: [file] });
      return;
    } catch {}
  }
  // Fallback: download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
```

Два изменения в одном файле. Убирает зависимость от DOM-состояния и решает проблему скачивания на мобильных.

