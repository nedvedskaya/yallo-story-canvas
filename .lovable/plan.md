

# Исправления: загрузка шрифтов, перетаскивание текста, отступ

## 1. Загрузка шрифтов не работает

**Проблема**: Код загрузки в `FontSection.tsx` выглядит корректно — `FontFace` создается, добавляется в `document.fonts`, вызывается `onAddCustomFont` и `onChange`. Вероятная причина: на мобильных `fileInputRef.current?.click()` не срабатывает (тот же баг что был с color picker). Кнопка `<button onClick={() => fileInputRef.current?.click()}>` через programmatic click не открывает file picker на iOS/Android.

**Решение** в `FontSection.tsx`:
- Заменить `<button>` + hidden `<input>` на `<label>` с визуальным оформлением кнопки, внутри которого `<input type="file" className="hidden">` — на мобильных `<label>` нативно открывает file picker без programmatic click
- Убрать `fileInputRef` и `onClick`, использовать `htmlFor` / вложенный input

## 2. Перетаскивание текста пальцем + pinch-to-zoom размера

**Добавить в `Slide` интерфейс** (`SlideCarousel.tsx`):
- `textOffsetX?: number` (default 0) — смещение текстового блока по X в процентах
- `textOffsetY?: number` (default 0) — смещение текстового блока по Y в процентах  
- `textScale?: number` (default 1) — масштаб текста от pinch-zoom

**В `SlideCarousel.tsx`** — на контентном блоке (title + body):
- Добавить touch-обработчики:
  - `onTouchStart` / `onTouchMove` / `onTouchEnd` для drag (один палец) — обновлять `textOffsetX/Y`
  - Отслеживать 2 пальца для pinch — обновлять `textScale`
- Применять `transform: translate(offsetX, offsetY) scale(textScale)` к обёртке текста
- Вызывать `onUpdateSlide` при `onTouchEnd` чтобы сохранить позицию

**Важно**: drag текста должен работать только когда `TextEditorModal` закрыт (иначе конфликт с редактированием). При `vAlign` смещение добавляется поверх базового выравнивания.

## 3. Отступ между username и заголовком при vAlign="start"

**В `SlideCarousel.tsx`**:
- Добавить `marginTop` / `paddingTop` на top bar (`username + slide count`): `mb-2` или `marginBottom: 8px`
- Это создаст зазор между строкой username и началом контентной области

## Файлы для изменения

1. `src/components/editor/FontSection.tsx` — заменить button+hidden input на label для мобильной совместимости
2. `src/components/editor/SlideCarousel.tsx` — добавить `textOffsetX/Y/textScale` в Slide, touch-обработчики для drag и pinch, отступ после username

