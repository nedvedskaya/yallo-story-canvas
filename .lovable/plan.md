

# План реализации

## 1. Стикеры / декоративные элементы поверх слайда

**Суть**: Пользователь может добавлять картинки (стикеры, иконки, декор) поверх слайда — независимо от фона. Элементы можно перетаскивать, масштабировать и удалять.

### Архитектура

Расширить интерфейс `Slide` новым полем:
```text
stickers: Array<{
  id: string;
  src: string;        // blob URL или data URL
  x: number;          // % от ширины
  y: number;          // % от высоты
  scale: number;      // множитель размера
  rotation: number;   // градусы
  width: number;      // базовая ширина в px
  height: number;     // базовая высота в px
}>
```

### Новые файлы
- **`StickersPanel.tsx`** — панель в BottomSheet (новая вкладка "Элементы" в меню или подраздел BackgroundPanel). Кнопка загрузки изображения + галерея добавленных стикеров. Возможность удалить стикер из списка.
- **`StickerLayer.tsx`** — рендер-слой в SlideFrame (z-index между overlay и контентом). Каждый стикер — `<img>` с `position: absolute`, поддержка drag (touch + mouse) и pinch-to-zoom для масштабирования.

### Изменения в существующих файлах

| Файл | Изменение |
|------|-----------|
| `SlideCarousel.tsx` | Добавить `stickers` в интерфейс `Slide` |
| `SlideFrame.tsx` | Рендерить `StickerLayer` между overlay и контентом (z-5) |
| `BottomMenu.tsx` | Добавить пункт меню "Элементы" (иконка Sticker/Image) |
| `BottomSheet.tsx` | Рендерить `StickersPanel` для новой вкладки |
| `Index.tsx` | Прокинуть обработчики добавления/удаления/обновления стикеров |
| `export-utils.ts` / `DownloadModal.tsx` | Учитывать стикеры при экспорте |

### Взаимодействие
- Drag для перемещения (touch + mouse, аналогично titleOffset)
- Двойной тап — удаление или меню
- Жест pinch — масштабирование (на мобильных)
- Вставка из буфера обмена (Ctrl+V / долгое нажатие "Вставить")

---

## 2. Шаблон "Бордо"

**Суть**: Новый шаблон на основе референсов. Два визуальных режима:
- **Слайд 1 (обложка)**: тёмно-бордовый фон (`#3C1518` или `#4A1A1F`), крупная типографика с миксом serif + cursive
- **Остальные слайды**: светлый бежевый фон (`#F0EAE0`), тёмный текст, бордовые акценты

### Анализ референсов

**Изображение 1** (тёмное):
- Фон: глубокий бордо ~`#3C1518`
- Заголовок: крупный белый serif шрифт + курсивные подписи
- Мета-текст: мелкий, верхние углы
- Стрелка и кнопки: бордо с розоватым оттенком

**Изображение 2** (светлое):
- Фон: тёплый беж ~`#F0EAE0`
- Заголовок: жирный чёрный sans-serif uppercase + бордовый cursive
- Нижние бейджи: бордовые пилюли с белым текстом
- Текст-список: uppercase, spacing

### Подбор шрифтов из имеющихся
- Заголовок (крупный serif): **Forum** (ближе всего к элегантному serif на референсе)
- Курсивный акцент: **Bella Script CYR** (аналог каллиграфического стиля "graphic design")
- Тело: **Inter** (чистый sans-serif для списков и мелкого текста)

### Реализация

**Файл**: `TemplatesPanel.tsx` — добавить третий шаблон в массив `TEMPLATES`:

```text
{
  id: "bordo",
  name: "Бордо",
  accentColor: "#F0EAE0",   // бежевый акцент на последнем слове
  accentMode: "color",
  apply: {
    bgColor: "#3C1518",
    bgType: "color",
    overlayType: "none",
    overlayOpacity: 0,
    titleColor: "#FFFFFF",
    bodyColor: "rgba(255,255,255,0.8)",
    metaColor: "rgba(255,255,255,0.5)",
    titleFont: "'Forum', serif",
    titleSize: 28,
    titleLineHeight: 1.15,
    titleCase: "none",
    bodyFont: "'Inter', sans-serif",
    bodySize: 14,
    bodyLineHeight: 1.5,
    bodyCase: "none",
    hAlign: "left",
    vAlign: "center",
    showUsername: true,
    showSlideCount: true,
    showArrow: true,
    showFooter: false,
  },
  preview: <...> // Миниатюра с бордовым фоном, белым заголовком Forum,
                  // курсивной строкой Bella Script бежевого цвета
}
```

**Preview JSX**: Бордовый фон, сверху мета-данные, по центру — крупный "Бордо" шрифтом Forum + курсивная строка Bella Script, внизу стрелка.

---

## Порядок реализации

1. Добавить шаблон "Бордо" в `TemplatesPanel.tsx` (быстро, без новых компонентов)
2. Расширить `Slide` интерфейс полем `stickers`
3. Создать `StickerLayer.tsx` (рендер + drag)
4. Создать `StickersPanel.tsx` (загрузка + управление)
5. Интегрировать в `SlideFrame`, `BottomMenu`, `BottomSheet`, `Index.tsx`
6. Поддержка экспорта стикеров в `DownloadModal`

