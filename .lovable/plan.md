

# Исправления: углы, размеры, выравнивание, шрифты

## 1. Острые углы слайдов

**Файл: `SlideCarousel.tsx`**
- Внешний контейнер: `borderRadius: '20px'` → `'0px'`
- Внутренний слайд: `borderRadius: '16px'` → `'0px'`
- Медиа-слои (bgImage/bgVideo): `borderRadius: '16px'` → `'0px'`

**Файл: `DownloadModal.tsx`**
- В `captureSlides` при рендере html2canvas углы уже берутся из DOM — после изменения выше экспорт тоже будет с острыми углами

## 2. Размер шрифта для Stories — уменьшить

**Файл: `SlideCarousel.tsx`**
- `FORMAT_TEXT_DEFAULTS.stories`: `titleSize: 26 → 20`, `bodySize: 15 → 12`

## 3. Максимальный размер шрифта 48px

**Файл: `FontSection.tsx`**
- Слайдер размера: `max={24}` → `max={48}`

## 4. Выравнивание текста — корректное для всех форматов

**Файл: `SlideCarousel.tsx`**

Проблема: при `vAlign="start"` текст прижимается к верху, но перекрывает username. При `vAlign="end"` текст перекрывает footer/стрелку. Нужно сделать так:

- **Top bar** (username + slide count) — всегда `position: relative` вверху, не absolute
- **Footer bar** (подвал + стрелка) — всегда `position: relative` внизу, не absolute
- **Контент** (title + body) — находится между ними, flex-grow, с `justifyContent` по vAlign

Переписать content layer:
```
<div className="relative z-10 flex flex-col h-full w-full">
  {/* Top bar — всегда наверху */}
  <div>username + slide count</div>
  
  {/* Content — flex-1, justifyContent по vAlign */}
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: vAlignToJustify[slide.vAlign] }}>
    <div>title + body</div>
  </div>
  
  {/* Footer — всегда внизу */}
  <div>footer + arrow</div>
</div>
```

Убрать всю логику `position: absolute` для top bar и footer — они всегда relative. Контент занимает оставшееся пространство и выравнивается по vAlign внутри него.

## 5. Загрузка шрифтов не работает

**Файл: `FontSection.tsx`**

Проблема: `customFonts` хранится в локальном state компонента. При переключении табов (Заголовок/Основной текст) компонент перемонтируется и state теряется. Кроме того, шрифт применяется (`onChange({ font })`), но `fontFamily` в `family` — `'FontName'` без fallback, и может не совпадать с тем что зарегистрировано.

Исправление:
- Поднять `customFonts` state из `FontSection` в `TextPanel` и передавать как проп
- Убедиться что `FontFace` конструктор получает правильное имя
- Добавить fallback: `family: \`'${fontName}', sans-serif\``

## Файлы для изменения

1. `src/components/editor/SlideCarousel.tsx` — углы 0, stories размеры, выравнивание
2. `src/components/editor/FontSection.tsx` — max 48, принимать customFonts как проп
3. `src/components/editor/TextPanel.tsx` — хранить customFonts, передавать в FontSection

