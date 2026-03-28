

# Адаптация: слайд видим при открытой панели

## Проблема
На экране 390x656px BottomSheet с `maxHeight: 50vh` (~328px) + нижнее меню (~72px) перекрывают почти весь слайд.

## Решение — оба подхода

### 1. Компактная панель (BottomSheet)
- Уменьшить `maxHeight` с `50vh` до `35vh`
- Сетку 3x2 заменить на горизонтальный скролл (1 ряд) — `flex overflow-x-auto`
- Убрать handle-полоску и уменьшить внутренние отступы (`px-4 pb-4 pt-2`)
- Список (size/info) — тоже компактнее: `py-2` вместо `py-3`

### 2. Уменьшение слайда при открытой панели (Index + SlideCarousel)
- Передать `isSheetOpen` (boolean) из Index в SlideCarousel
- Когда `isSheetOpen === true`:
  - Слайд уменьшается: `scale(0.65)` и сдвигается вверх `translateY(-15%)`
  - Верхние кнопки управления скрываются
  - Toolbar под слайдом скрывается
- Анимация через `transition-all duration-300`

## Файлы
- **`src/components/editor/BottomSheet.tsx`** — компактная высота, горизонтальный скролл
- **`src/pages/Index.tsx`** — передать `isSheetOpen={!!activeTab}` в SlideCarousel
- **`src/components/editor/SlideCarousel.tsx`** — принять `isSheetOpen`, применить scale/translate при открытой панели

