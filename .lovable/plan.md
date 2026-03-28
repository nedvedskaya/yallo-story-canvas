# Вкладка "Фон" — полная переработка

## Что сейчас

BottomSheet для вкладки "background" показывает простой горизонтальный скролл с текстовыми кнопками . Также есть отдельный BackgroundModal — его логику нужно интегрировать в BottomSheet.

## Что нужно сделать

Когда пользователь нажимает "Фон" в нижнем меню, BottomSheet показывает специальный контент с 3 секциями:

### Секция 1 — Тип фона

Три tab-кнопки: **Цвет** / **Фото** / **Видео**

- Цвет: показывает сетку градиентных/цветовых пресетов (из BackgroundModal)
- Фото: кнопка загрузки фото (загрузка фото из галереи)
- Видео: кнопка загрузки видео (загрузка видео из галереи до 1 минуты)

### Секция 2 — Акцентный цвет

Круглый превью выбранного цвета (28px). По нажатию — открывается color picker (native `<input type="color">`) + текстовое поле для ввода HEX-кода. Цвет применяется к фону слайда.

### Секция 3 — Элементы

Горизонтальный скролл кнопок-чипов:

- Без элементов, Точки, Линии, Сетка, Ячейки, Блики, Шум

Под ними — слайдер прозрачности (0–100) с подписью "Прозрачность".

Под слайдером — Switch "Применить ко всем слайдам".

## Технические изменения

### Файл: `src/components/editor/BottomSheet.tsx`

- Для `activeTab === "background"` рендерить специальный компонент `BackgroundPanel` вместо дефолтного контента
- Передать props: `currentSlide`, `onUpdateSlide`, `slides`, `onUpdateAllSlides`

### Новый файл: `src/components/editor/BackgroundPanel.tsx`

- State: `bgTab` (color/photo/video), `accentColor`, `overlayType`, `overlayOpacity`, `applyToAll`
- Использует Slider из `@/components/ui/slider` и Switch из `@/components/ui/switch`
- Color picker: скрытый `<input type="color">` + HEX input
- Все в компактном вертикальном layout со scroll

### Файл: `src/components/editor/SlideCarousel.tsx`

- Добавить в Slide интерфейс: `overlayType`, `overlayOpacity` (string, number)
- Рендерить overlay поверх фона слайда (SVG-паттерны или CSS для точек/линий/сетки/ячеек/бликов/шума)
- Передать `slides`, `updateSlide`, `currentSlide` через props в BottomSheet → BackgroundPanel

### Файл: `src/pages/Index.tsx`

- Пробросить slide-данные и callbacks из SlideCarousel в BottomSheet

### Файл: `src/components/editor/BackgroundModal.tsx`

- Удалить (логика переедет в BackgroundPanel)