

# Сохранение слайдов напрямую в фотогалерею на мобильном

## Проблема

Сейчас PNG экспорт упаковывает всё в ZIP → `navigator.share()` шарит ZIP-файл → iOS/Android предлагает сохранить в "Файлы", а не в фотогалерею. Картинки в ZIP не распознаются как изображения. PDF тоже сохраняется через `pdf.save()` (скрытый `<a>` клик), что на мобильном ненадёжно.

## Решение

На мобильных устройствах — **не создавать ZIP для PNG**. Вместо этого шарить изображения напрямую через `navigator.share({ files: [...] })`, где каждый файл — это `File` с типом `image/png`. iOS и Android распознают PNG-файлы и предлагают "Сохранить в фото".

Для PDF — вместо `pdf.save()` использовать `navigator.share()` с PDF-blob.

## Файл: `src/components/editor/DownloadModal.tsx`

### Изменение 1: `downloadPNG` — на мобильном шарить PNG напрямую без ZIP

```ts
const downloadPNG = async () => {
  // ... render slides ...
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  
  if (isMobile && navigator.share) {
    // Создать File[] из canvas → PNG blob
    const files: File[] = [];
    for (let i = 0; i < slides.length; i++) {
      const canvas = await captureSlide(slides[i], i);
      const blob = await new Promise<Blob>((res) => 
        canvas.toBlob(b => res(b!), "image/png")
      );
      files.push(new File([blob], `slide-${i+1}.png`, { type: "image/png" }));
    }
    await navigator.share({ files });
  } else {
    // Десктоп: ZIP как раньше
    const zip = new JSZip();
    // ...
  }
};
```

Когда `navigator.share` получает файлы с `type: "image/png"`, iOS покажет опцию "Сохранить изображение" (в фотогалерею), а Android — "Сохранить в Галерею".

### Изменение 2: `downloadPDF` — на мобильном шарить PDF через share API

```ts
const downloadPDF = async () => {
  // ... render PDF ...
  const pdfBlob = pdf.output("blob");
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  
  if (isMobile && navigator.share) {
    const file = new File([pdfBlob], "slides.pdf", { type: "application/pdf" });
    await navigator.share({ files: [file] });
  } else {
    pdf.save("slides.pdf");
  }
};
```

### Изменение 3: Обработка ошибок share

Если `navigator.share()` выбрасывает ошибку (пользователь отменил или не поддерживается), делать fallback на ZIP/download как сейчас.

## Один файл для изменения

`src/components/editor/DownloadModal.tsx` — переписать `downloadPNG` и `downloadPDF` с mobile-first подходом через `navigator.share` для прямого сохранения в галерею.

