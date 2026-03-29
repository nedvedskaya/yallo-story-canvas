

# Доработки: перетаскивание на всех устройствах, масштаб медиа, TextEditorModal

## 1. Перетаскивание текста — добавить поддержку мыши (десктоп)

**Файл: `SlideCarousel.tsx`**

Сейчас drag/pinch текста работает только через `onTouchStart/Move/End`. Нужно добавить `onMouseDown/Move/Up` для десктопа:
- `onMouseDown` — запоминает начальную позицию и текущий offset
- `onMouseMove` (на window) — вычисляет dx/dy и обновляет `dragOffset`
- `onMouseUp` (на window) — сохраняет через `onUpdateSlide` и убирает listener

## 2. Перетаскивание фото/видео пальцем и мышью на слайде

**Файл: `SlideCarousel.tsx`**

Добавить drag для медиа-фона (bgImage/bgVideo) аналогично тексту:
- На `<div className="absolute inset-0 z-[2]">` (обёртка bgImage/bgVideo) повесить touch и mouse обработчики
- Drag перемещает `bgPosX`/`bgPosY` (пересчитывая смещение пикселей в проценты)
- Pinch двумя пальцами меняет `bgScale`
- Сохранять через `onUpdateSlide`

## 3. Масштаб фото/видео — уменьшить минимум

**Файл: `MediaControls.tsx`**
- Изменить `min={50}` → `min={10}` на слайдере масштаба, чтобы фото можно было уменьшить сильнее оригинала

## 4. TextEditorModal — убрать кнопку «Сохранить», автосохранение

**Файл: `TextEditorModal.tsx`**
- Убрать кнопку «Сохранить» (строки 183-196)
- Добавить `onInput` на contentEditable div — при каждом изменении вызывать `onSave(editorRef.current.innerHTML)`
- Крестик (X) просто вызывает `onClose()` без сброса — данные уже сохранены
- Убрать `handleSave` функцию

## 5. Скрывать нижнее меню при открытом TextEditorModal

**Файл: `SlideCarousel.tsx` + `Index.tsx`**

Нужно пробросить состояние `editorOpen` наверх, чтобы `BottomMenu` скрывался:
- В `SlideCarousel` добавить проп `onEditorOpenChange?: (open: boolean) => void` и вызывать при открытии/закрытии
- В `Index.tsx` добавить state `textEditorOpen` и передать в `BottomMenu`
- В `BottomMenu` — уже есть `if (activeTab) return null;` — добавить аналогично `if (textEditorOpen) return null;`

Альтернативно: передавать `mb` для TextEditorModal — сейчас он позиционируется `mb-[calc(76px+env(safe-area-inset-bottom))]` (место под меню). Если меню скрыто, уменьшить до `mb-[env(safe-area-inset-bottom)]`.

## Файлы для изменения

1. `src/components/editor/SlideCarousel.tsx` — mouse drag для текста, drag для медиа, проп editorOpen
2. `src/components/editor/MediaControls.tsx` — min масштаба 10
3. `src/components/editor/TextEditorModal.tsx` — убрать «Сохранить», автосохранение onInput
4. `src/pages/Index.tsx` — state textEditorOpen, передать в BottomMenu
5. `src/components/editor/BottomMenu.tsx` — скрывать при textEditorOpen

