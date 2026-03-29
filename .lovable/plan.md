# Добавить шаблон «Минимализм»

## Дизайн (из референса)

- Белый фон `#FFFFFF`, без сетки (`overlayType: "none"`)
- Заголовок: жирный, чёрный `#1A1A1A`, шрифт заголовка Songer, uppercase
- Акцент: фиолетовый `#7C5CFC` — **выделение фоном** (highlight), не цветом текста
- Тело: обычный Inter, `#1A1A1A`
- Мета: `#999999`
- Стрелка внизу справа, username и счётчик вверху
- Без футера

## Отличие от «Тетрадь»


| &nbsp;  | Тетрадь         | Минимализм               |
| ------- | --------------- | ------------------------ |
| Фон     | #F3F3F3 + grid  | #FFFFFF, без overlay     |
| Акцент  | оранжевый текст | фиолетовый highlight-фон |
| Регистр | none            | uppercase                |


## Изменения

**Файл: `src/components/editor/TemplatesPanel.tsx**`

Добавить второй объект в массив `TEMPLATES`:

```ts
{
  id: "minimalism-clean",
  name: "Минимализм",
  accentColor: "#7C5CFC",
  apply: {
    bgColor: "#FFFFFF",
    bgImage: undefined,
    bgVideo: undefined,
    bgType: "color",
    overlayType: "none",
    overlayOpacity: 0,
    titleColor: "#1A1A1A",
    bodyColor: "#1A1A1A",
    metaColor: "#999999",
    overlayColor: "rgba(0,0,0,0.08)",
    showFooter: false,
    footerText: "",
    showArrow: true,
    showUsername: true,
    showSlideCount: true,
    bgDarken: 0,
    titleFont: "'Dela Gothic One', sans-serif",
    titleSize: 28,
    titleLineHeight: 1.15,
    titleLetterSpacing: 0,
    titleCase: "uppercase",
    bodyFont: "'Inter', sans-serif",
    bodySize: 14,
    bodyLineHeight: 1.65,
    bodyLetterSpacing: 0,
    bodyCase: "none",
    hAlign: "left",
    vAlign: "center",
  },
  preview: /* мини-карточка: белый фон, чёрный заголовок uppercase,
              слово «СЛАЙДА» с фиолетовым фоном-выделением,
              тело текстом, стрелка внизу */
}
```

Превью будет без сетки, с чистым белым фоном и фиолетовым highlight на ключевом слове.