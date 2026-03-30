

# 4 исправления

## 1. Удалить перемещение видео/медиа на слайде

**Файл: `src/components/editor/SlideCarousel.tsx`**
- Удалить всё, связанное с media drag: `mediaTouchRef`, `mediaPinchRef`, `mediaDragOffset`, `mediaPinchScale`, `mediaMouseRef` (строки 94-98)
- Удалить `handleMediaTouchStart`, `handleMediaTouchMove`, `handleMediaTouchEnd` (строки 200-227)
- Удалить `handleMediaMouseDown` и его useEffect (строки 230-252)
- Убрать передачу `mediaOverrides`, `onMediaTouchStart/Move/End`, `onMediaMouseDown` в SlideFrame (строки 344-362)

**Файл: `src/components/editor/SlideFrame.tsx`**
- Убрать пропсы `mediaOverrides`, `onMediaTouchStart/Move/End`, `onMediaMouseDown`
- На контейнерах медиа убрать `cursor: grab`, `touchAction: none`, обработчики событий — оставить просто `pointerEvents: none`

## 2. Текст двигается при свайпе слайдов на мобильном

Проблема: touch-события на тексте перехватываются drag-логикой текста, мешая горизонтальному свайпу карусели.

**Файл: `src/components/editor/SlideCarousel.tsx`**
- В `handleTextTouchStart`: добавить проверку — не начинать drag, если `isSheetOpen`
- В `handleTextTouchMove`: если горизонтальное смещение > вертикального и drag ещё не начат (< 10px суммарно), не перехватывать событие, позволив карусели свайпиться. Убрать `e.stopPropagation()` из touch-move текста
- Альтернативно (проще и надёжнее): полностью отключить drag текста на touch при неактивном редакторе, оставить только pinch-to-scale. Клик по тексту → открытие редактора. Перетаскивание текста оставить только для мыши (десктоп)

**Рекомендуемый подход**: убрать однопальцевый drag текста на touch полностью. На мобильном перемещение текста неинтуитивно и мешает свайпу. Оставить: pinch-to-scale (2 пальца), клик → редактор, mouse drag (десктоп).

## 3. Задержка применения шрифта и параметров

**Файл: `src/components/editor/FontSection.tsx`**
- Сейчас `onChange` вызывается при каждом изменении, но Slider может дебаунсить. Проверить что Slider onChange вызывает `onSave` мгновенно
- Убедиться что `setSlidesWithHistory` в Index.tsx не делает лишних вычислений

**Файл: `src/pages/Index.tsx`**
- В `handleUpdateSlide`: контрастные цвета пересчитываются при каждом `bgColor` изменении через `getContrastColors`. Это нормально. Но `setSlidesWithHistory` создает копию через `pushUndo` на каждый тик слайдера → много undo-записей
- Для слайдеров (size, lineHeight, letterSpacing) добавить `skipHistory.current = true` во время перетаскивания, `false` на отпускание. Передать `onCommit` callback в FontSection/TextPanel

**Файл: `src/components/editor/FontSection.tsx`**
- Для Slider: использовать `onValueChange` для live preview (без undo), `onValueCommit` для финального сохранения (с undo)
- Передать в `onChange` два режима: `onChange(updates)` для live, `onCommit?.(updates)` для финального

## 4. Username и нумерация слишком крупные + автоскрытие для Stories

**Файл: `src/components/editor/shared-styles.ts`**
- Уменьшить `usernameSize` и `footerSize` для всех форматов:
```ts
carousel:     { ..., usernameSize: 8, footerSize: 7 },
square:       { ..., usernameSize: 8, footerSize: 7 },
stories:      { ..., usernameSize: 8, footerSize: 7 },
presentation: { ..., usernameSize: 7, footerSize: 6 },
```

**Файл: `src/pages/Index.tsx`**
- В обработчике смены формата (`onSlideFormatChange`): когда формат переключается на `stories`, автоматически скрывать username и нумерацию на всех слайдах:
```ts
const handleFormatChange = (format: SlideFormat) => {
  setSlideFormat(format);
  if (format === "stories") {
    setSlidesWithHistory(prev => prev.map(s => ({
      ...s, showUsername: false, showSlideCount: false
    })));
  }
};
```

**Файл: `src/components/editor/BottomSheet.tsx`**
- Передать `slideFormat` в SizePanel callback, чтобы вызвать авто-скрытие

## Файлы для изменения

1. `src/components/editor/SlideCarousel.tsx` — удалить media drag, исправить text drag на touch
2. `src/components/editor/SlideFrame.tsx` — убрать media drag пропсы и обработчики
3. `src/components/editor/FontSection.tsx` — onValueCommit для слайдеров
4. `src/components/editor/shared-styles.ts` — уменьшить usernameSize/footerSize
5. `src/pages/Index.tsx` — автоскрытие username/count при Stories, skipHistory для live slider
6. `src/components/editor/TextPanel.tsx` — пробросить onCommit
