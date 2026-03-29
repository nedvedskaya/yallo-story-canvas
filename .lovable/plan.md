

# Исправления: ввод текста, раздельное перетаскивание, сброс позиции, drag медиа

## 1. Текст пишется наоборот

**Причина**: В `TextEditorModal.tsx` useEffect на строке 19-24 зависит от `initialHtml`. Когда пользователь печатает, `onInput` → `onSave` → обновляет слайд → `initialHtml` меняется → useEffect срабатывает снова → `editorRef.current.innerHTML = initialHtml` сбрасывает содержимое и курсор на начало. Следующий символ вставляется в начало — текст выглядит задом наперёд.

**Исправление** в `TextEditorModal.tsx`:
- Убрать `initialHtml` из зависимостей useEffect
- Использовать ref-флаг `initializedRef`, чтобы устанавливать innerHTML только при первом открытии (`open` переходит с false на true)

```tsx
const initializedRef = useRef(false);
useEffect(() => {
  if (open && editorRef.current && !initializedRef.current) {
    editorRef.current.innerHTML = initialHtml;
    editorRef.current.focus();
    initializedRef.current = true;
  }
  if (!open) initializedRef.current = false;
}, [open]);
```

## 2. Раздельное перетаскивание заголовка и основного текста

**В `SlideCarousel.tsx`**:
- Добавить в `Slide`: `titleOffsetX/Y`, `bodyOffsetX/Y`, `titleScale`, `bodyScale` (вместо общих `textOffsetX/Y/textScale`)
- Разделить `<div>` обёртку — сделать отдельные draggable-обёртки для `<h2>` и `<p>`
- Каждая обёртка имеет свои touch/mouse handlers
- В drag state добавить поле `target: "title" | "body"` чтобы различать что тащим

## 3. Сброс позиции при смене выравнивания

**В `SlideCarousel.tsx`** (или `SlideToolbar` → `onVAlignChange`):
- При изменении `vAlign` сбрасывать `titleOffsetX/Y`, `bodyOffsetX/Y`, `titleScale`, `bodyScale` к 0/1
- В `onVAlignChange` callback: `onUpdateSlide(id, { vAlign: v, titleOffsetX: 0, titleOffsetY: 0, bodyOffsetX: 0, bodyOffsetY: 0, titleScale: 1, bodyScale: 1 })`
- То же для `hAlign`

## 4. Drag фото/видео не работает на мобильных

**В `SlideCarousel.tsx`**:
- Проблема: touch-события на медиа-слое конфликтуют с горизонтальным scroll каруслели
- Добавить `e.preventDefault()` в `handleMediaTouchMove` чтобы предотвратить скролл при перетаскивании медиа
- Убедиться что `touchAction: 'none'` стоит на медиа-обёртке (уже есть)

## Файлы для изменения

1. `src/components/editor/TextEditorModal.tsx` — убрать `initialHtml` из deps useEffect
2. `src/components/editor/SlideCarousel.tsx` — раздельные offsets для title/body, сброс при выравнивании, fix media drag

