

# Три исправления

## 1. Палитра цвета текста в разделе «Текст»

**Файл: `src/components/editor/TextPanel.tsx`**

Добавить цветовой пикер (круг + HEX-ввод, как в BackgroundPanel) для цвета заголовка и основного текста:
- В табе «Заголовок» — пикер для `titleColor`
- В табе «Основной текст» — пикер для `bodyColor`

Формат идентичен акцентному цвету в BackgroundPanel: круглый превью цвета с наложенным `<input type="color">` + текстовое поле HEX.

## 2. Глюч при переключении шаблонов (сырой HTML в заголовке)

**Файл: `src/pages/Index.tsx`**, строка 119

Проблема: regex для удаления старых highlight-спанов `/<span style="background:[^"]*;[^"]*">` матчит только одну точку с запятой. Реальный стиль содержит 4 свойства (`background:...;color:...;padding:...;border-radius:...`), поэтому regex не срабатывает, старые спаны не удаляются, и при повторном применении шаблона HTML ломается.

Исправление — заменить обе очистки на универсальный regex:
```ts
const clean = updated.title
  .replace(/<span style="[^"]*">([^<]*)<\/span>/g, '$1');
```
Один regex убирает все inline-style спаны. Тот же фикс в `handleAddSlide` (строки ~143-148).

## 3. Undo/Redo кнопки в TopBar

**Файл: `src/pages/Index.tsx`** — добавить стек истории состояний слайдов:
- `undoStack: Slide[][]` и `redoStack: Slide[][]`
- Каждое изменение `slides` пушит предыдущее состояние в `undoStack`
- `handleUndo`: pop из undoStack → push текущее в redo → setSlides
- `handleRedo`: pop из redoStack → push текущее в undo → setSlides
- Передать `onUndo`, `onRedo`, `canUndo`, `canRedo` в TopBar

**Файл: `src/components/editor/TopBar.tsx`** — добавить кнопки ← → слева от «Скачать»:
- Две иконки `Undo2` и `Redo2` из lucide-react
- Disabled-стиль когда стек пуст

## Файлы для изменения

1. `src/components/editor/TextPanel.tsx` — цветовой пикер
2. `src/pages/Index.tsx` — фикс regex + undo/redo стек
3. `src/components/editor/TopBar.tsx` — кнопки undo/redo

