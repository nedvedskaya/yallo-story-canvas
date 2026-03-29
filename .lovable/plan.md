

# Устранение дублирования кода

## Найденные дубликаты

### 1. BackgroundPanel — слайдеры фото/видео (критично)
Блоки «Масштаб / X / Y / Затемнение» для фото (строки 126-154) и видео (строки 170-213) — практически идентичный код. Нужно вынести в общий компонент `MediaControls`.

### 2. SlideCarousel — рендер bgImage и bgVideo
Позиционирование фона (position, left, top, transform, scale) одинаковое для картинки и видео (строки 202-256). Вынести стили в общую функцию `getBgMediaStyle(slide)`.

### 3. glassBtnStyle — дублирование стилей кнопок
В `SlideCarousel.tsx` и `SlideToolbar.tsx` одинаковые glass-стили для кнопок. Вынести в общий файл констант.

### 4. labelStyle / valStyle — повторяющиеся стили подписей
В `BackgroundPanel` и `InfoPanel` одни и те же стили для лейблов. Вынести в общие константы.

## Что НЕ дублируется (и это правильно)
- Панели Фон / Текст / Инфо / Размер — единые для всех форматов, не дублируются под каждый размер
- `FORMAT_TEXT_DEFAULTS` — единая карта в `SlideCarousel`, адаптация берётся из одного места
- `FontSection` — переиспользуется для заголовка и основного текста

## План изменений

### Файл: `src/components/editor/shared-styles.ts` (новый)
- Экспортировать `glassBtnStyle`, `labelStyle`, `valStyle` — общие стили

### Файл: `src/components/editor/MediaControls.tsx` (новый)
- Компонент со слайдерами: Масштаб, X, Y, Затемнение
- Пропсы: `scale, posX, posY, darken, onChange`
- Используется в BackgroundPanel для фото и видео секций

### Файл: `src/components/editor/BackgroundPanel.tsx`
- Заменить два дублированных блока слайдеров на `<MediaControls />`
- Импортировать `labelStyle`, `valStyle` из shared-styles

### Файл: `src/components/editor/SlideCarousel.tsx`
- Вынести общий стиль позиционирования медиа-фона в функцию `getBgMediaStyle(slide)`
- Использовать для img и video
- Импортировать `glassBtnStyle` из shared-styles

### Файл: `src/components/editor/SlideToolbar.tsx`
- Импортировать `glassBtnStyle` из shared-styles вместо локального определения

### Файл: `src/components/editor/InfoPanel.tsx`
- Импортировать `labelStyle` из shared-styles

