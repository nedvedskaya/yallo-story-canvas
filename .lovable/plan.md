

# Проблема: два отдельных состояния слайдов

SlideCarousel хранит свой собственный `useState(initialSlides)` (строка 69), а Index хранит отдельный `useState<Slide[]>([])`. Когда BackgroundPanel меняет overlay/цвет, он обновляет `slides` в Index через `handleUpdateSlide`, но SlideCarousel рендерит свою копию — изменения не доходят до отображения.

# Решение: единый источник данных

Убрать внутренний state из SlideCarousel. Сделать `slides` и `updateSlide` props, управляемые из Index.

## Файл: `src/pages/Index.tsx`
- Инициализировать `slides` значением `initialSlides` (перенести массив сюда или импортировать)
- Передать `slides` и `handleUpdateSlide` в SlideCarousel как props
- Передать функции добавления/удаления/перемещения слайдов тоже через props (или оставить в carousel, но slides приходят сверху)

## Файл: `src/components/editor/SlideCarousel.tsx`
- Убрать `useState(initialSlides)` и `setSlidesAndNotify`
- Принимать `slides` и `onUpdateSlide` как props
- Все мутации (`addSlide`, `moveSlide`, `duplicateSlide`, `deleteSlide`) вызывают `onSlidesChange` с новым массивом вместо локального setState

Это простое поднятие состояния — после этого любые изменения из BackgroundPanel (цвет, overlay, opacity) сразу отразятся на слайде.

