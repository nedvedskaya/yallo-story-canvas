

# Исправить экспорт видео-слайдов — комплексный анализ

## Обнаруженные проблемы

После детального анализа кода `downloadAll` (строки 344-413) выявлено **3 причины**, почему видео не скачиваются:

### Причина 1: Chrome/Safari блокируют множественные автоматические скачивания

Текущий код скачивает PNG-архив отдельно, затем каждое видео отдельным вызовом `triggerDownload()` с задержкой 500мс. Chrome расценивает это как "автоматическое скачивание множества файлов" и блокирует все файлы после первого. На iOS Safari `window.open()` блокируется, потому что вызывается после длинной цепочки `await` — браузер считает что user gesture уже истёк.

### Причина 2: `recordVideoSlide` молча возвращает null

Функция `recordVideoSlide` использует `MediaRecorder` + `captureStream(30)`. На многих устройствах/браузерах это не работает (особенно мобильные). Когда `getSupportedVideoMime()` возвращает null или запись падает, функция возвращает null без уведомления пользователю.

### Причина 3: Fallback fetch blob URL может не работать

Когда `recordVideoSlide` возвращает null, fallback делает `fetch(slide.bgVideo)` — но blob URL (`blob:...`) может быть уже отозван или fetch может молча упасть. Ошибка ловится пустым `catch {}`.

## Решение: Всё в один ZIP

Вместо скачивания видео отдельными файлами — **упаковать всё в один ZIP**: и PNG, и видео. Это решает проблему блокировки множественных скачиваний на всех браузерах.

### Файл: `src/components/editor/DownloadModal.tsx`

**Изменение 1:** В `downloadAll` — вместо отдельных скачиваний, добавлять видео-blob прямо в JSZip:

```ts
// Вместо раздельного скачивания:
const zip = new JSZip();
pngSlides.forEach(s => zip.file(`slide-${s.index + 1}.png`, s.data, { base64: true }));
videoSlides.forEach(vs => zip.file(`slide-${vs.index + 1}.${vs.ext}`, vs.blob));
const blob = await zip.generateAsync({ type: "blob" });
triggerDownload(blob, "slides.zip");
```

**Изменение 2:** Улучшить fallback для видео — если `recordVideoSlide` вернул null, копировать blob напрямую (не через fetch):

```ts
// Вместо fetch(slide.bgVideo) для blob URL:
if (slide.bgVideo.startsWith("blob:")) {
  // Blob URL — получить через XMLHttpRequest (более надёжно)
  const xhr = new XMLHttpRequest();
  xhr.open("GET", slide.bgVideo);
  xhr.responseType = "blob";
  // ...
}
```

Или ещё проще: хранить оригинальный File-объект видео и добавлять его в ZIP напрямую.

**Изменение 3:** Добавить `console.log` / `console.error` в ключевые точки для отладки:
- При проверке `getSupportedVideoMime()`
- При ошибке `recordVideoSlide`
- При ошибке fallback fetch

**Изменение 4:** Показывать пользователю toast если видео-запись не поддерживается, но оригинал сохранён.

### Файл: `src/components/editor/BackgroundPanel.tsx`

Сохранять оригинальный File-объект при загрузке видео, чтобы при экспорте не зависеть от blob URL:

- Добавить `bgVideoFile?: File` в интерфейс `BgDraft` и `Slide`
- При загрузке видео: `update({ bgVideo: url, bgVideoFile: file })`

### Файл: `src/components/editor/SlideCarousel.tsx`

- Добавить `bgVideoFile?: File` в интерфейс `Slide`

## Итого: файлы для изменения

1. `src/components/editor/SlideCarousel.tsx` — добавить `bgVideoFile?: File` в Slide
2. `src/components/editor/BackgroundPanel.tsx` — сохранять File при загрузке видео
3. `src/components/editor/DownloadModal.tsx` — упаковка всего в один ZIP + fallback через File + логирование

