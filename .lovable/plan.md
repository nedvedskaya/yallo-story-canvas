# Вкладка "Текст" — полная реализация

## Обзор

Создать панель TextPanel с настройками шрифтов для заголовка и основного текста. Все изменения мгновенно отражаются на слайде. Настройки шрифтов вынесены в общий компонент, чтобы не дублировать код.

## Шрифты

Кастомные шрифты (1-7: Abraxas, HeadingNow Trial, Postertoaster, SouthGhetto, Marvin Visions, SONGER Grotesque, Coolvetica) — потребуют файлов `.woff2`. Файлы прислала в чат.

Google Fonts (8-20): Playfair Display, Syne, Unbounded, DM Serif Display доступны напрямую. Neue Montreal, Clash Display, Cabinet Grotesk, Satoshi, General Sans, Swear Display, Melodrama, Boska, Chillax — это шрифты с foundry Fontshare/другие, не Google Fonts. Подключим доступные через Google Fonts link, остальные через Fontshare CDN где возможно.

## Новые поля в Slide

```text
titleFont, titleSize, titleCase, titleLineHeight, titleLetterSpacing
bodyFont, bodySize, bodyCase, bodyLineHeight, bodyLetterSpacing
```

## Структура файлов

### 1. `src/components/editor/FontSection.tsx` — общий компонент

Переиспользуется для заголовка и основного текста. Содержит:

- **Шрифт**: горизонтальный скролл с иконками-превью (название шрифта написано этим шрифтом)
- **Размер**: слайдер 0-100
- **Регистр**: 3 иконки — `Aa` (как есть), `AA` (uppercase), `aa` (lowercase)
- **Межстрочный интервал**: слайдер
- **Межбуквенный интервал**: слайдер

### 2. `src/components/editor/TextPanel.tsx` — панель для BottomSheet

- Секция "Шрифт заголовка" с `<FontSection>`
- Секция "Шрифт основного текста" с `<FontSection>`
- Switch "Применить ко всем слайдам"
- Кнопки "Отменить" / "Сохранить"

### 3. `src/components/editor/SlideCarousel.tsx`

- Применить `fontFamily`, `fontSize`, `textTransform`, `lineHeight`, `letterSpacing` к `<h2>` и `<p>` из полей слайда

### 4. `src/components/editor/BottomSheet.tsx`

- При `activeTab === "text"` рендерить `<TextPanel>` вместо заглушки

### 5. `src/pages/Index.tsx`

- Добавить дефолтные значения текстовых полей в `initialSlides`
- Добавить `handleApplyTextToAll`

### 6. `index.html`

- Подключить Google Fonts и Fontshare CDN через `<link>`

### 7. `src/index.css`

- `@font-face` для кастомных шрифтов (fallback)

## Ключевой принцип

FontSection — один компонент, используемый дважды (для title и body). Все callbacks идут через единый `onUpdateSlide`, изменения мгновенно видны на слайде.