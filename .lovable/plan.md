# Улучшение панелей редактора: навигация, компактность, слайдеры, палитра

## 1. Раздел «Текст» — табы «Заголовок» / «Основной текст»

**Файл: `TextPanel.tsx**`

- Добавить state `activeSection: "title" | "body"` (по умолчанию `"title"`)
- Сверху 2 кнопки-табы в стиле как в BackgroundPanel (Цвет/Фото/Видео)
- При выборе таба показывать только один `FontSection` + switch «Применить ко всем»
- Убрать разделитель и второй `FontSection` — теперь они переключаются табами

**Файл: `FontSection.tsx**`

- Добавить кнопку «+ добавить шрифт» в конце списка шрифтов
- При нажатии — hidden `<input type="file" accept=".ttf,.otf,.woff,.woff2">`
- Загруженный шрифт регистрируется через `FontFace API` и добавляется в список
- Хранить пользовательские шрифты в state (внутри FontSection или поднять в TextPanel)
- Изменить диапазон слайдера размера: `min={8} max={24}` вместо `max={100}`

## 2. Панели показываются целиком без прокрутки

**Файлы: `BackgroundPanel.tsx`, `TextPanel.tsx`, `InfoPanel.tsx**`

- Убрать `overflow-y-auto max-h-[28vh] scrollbar-hide` / `max-h-[30vh]`
- Контент будет занимать сколько нужно, а `BottomSheet` ограничит maxHeight

**Файл: `BottomSheet.tsx**`

- Увеличить `maxHeight` с `35vh` до `45vh` чтобы всё помещалось
- Добавить `overflow-y-auto` на контейнер контента если содержимое всё-таки не влезет

## 3. Слайдеры — удобная работа с телефона

**Файл: `src/components/ui/slider.tsx**`

- Увеличить Thumb до `h-6 w-6` (было `h-5 w-5`) для удобного нажатия пальцем
- Добавить `touch-action: none` на Thumb (уже есть на Root)
- Track оставить `h-2` — визуально компактно, а зона касания на Thumb достаточная

## 4. Акцентный цвет — исправить работу палитры на телефоне

**Файл: `BackgroundPanel.tsx**`

- Заменить `<input type="color" className="sr-only">` + `button onClick -> click()` на прямой `<input type="color">` стилизованный как кружок
- На мобильных `sr-only` + programmatic click не всегда открывает native color picker
- Использовать `opacity: 0` + absolute positioning поверх кнопки-кружка вместо `sr-only`

**Файл: `TextEditorModal.tsx**`

- Та же проблема с `colorInputRef` — применить тот же подход: `<input type="color">` с `opacity: 0` поверх кнопки

## Файлы для изменения

1. `src/components/editor/TextPanel.tsx` — табы, убрать max-h
2. `src/components/editor/FontSection.tsx` — загрузка шрифтов, диапазон размера
3. `src/components/editor/BackgroundPanel.tsx` — убрать max-h, починить color picker
4. `src/components/editor/InfoPanel.tsx` — убрать max-h
5. `src/components/editor/BottomSheet.tsx` — увеличить maxHeight, overflow на контенте
6. `src/components/ui/slider.tsx` — увеличить Thumb
7. `src/components/editor/TextEditorModal.tsx` — починить color picker