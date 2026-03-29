

# Автоконтраст: светлые/тёмные элементы в зависимости от фона

## Идея

Добавить утилиту определения яркости цвета фона. Когда пользователь меняет `bgColor`, автоматически пересчитывать `titleColor`, `bodyColor`, `metaColor`, `overlayColor` — светлые для тёмного фона, тёмные для светлого.

## Как работает

1. **Утилита `getContrastColors(bgColor: string)`** — парсит hex или gradient (берёт первый цвет), вычисляет relative luminance по формуле W3C. Возвращает набор цветов:
   - Светлый фон (luminance > 0.5): `titleColor: "#1A1A1A"`, `bodyColor: "#1A1A1A"`, `metaColor: "#999999"`, `overlayColor: "rgba(0,0,0,0.08)"`
   - Тёмный фон (luminance ≤ 0.5): `titleColor: "#ffffff"`, `bodyColor: "rgba(255,255,255,0.85)"`, `metaColor: "rgba(255,255,255,0.7)"`, `overlayColor: "rgba(255,255,255,0.25)"`

2. **Автоприменение при смене цвета** — в `handleUpdateSlide` (Index.tsx): если `updates` содержит `bgColor` и пользователь НЕ задал цвета текста вручную, автоматически добавить контрастные цвета из утилиты.

3. **Автоприменение в BackgroundPanel** — при выборе цвета/градиента через `update({ bgColor })` также передавать контрастные цвета.

## Файлы для изменения

1. **`src/lib/utils.ts`** — добавить `getContrastColors(bgColor)` и вспомогательную `getLuminance(hex)`
2. **`src/pages/Index.tsx`** — в `handleUpdateSlide`: если приходит `bgColor`, автоматически добавлять контрастные цвета
3. **`src/components/editor/BackgroundPanel.tsx`** — при смене цвета вызывать `update` с контрастными цветами в одном объекте

## Технические детали

```text
getLuminance("#667eea"):
  1. parse hex → r,g,b (0-255)
  2. linearize: c/255, if c<=0.03928 → c/12.92, else ((c+0.055)/1.055)^2.4
  3. L = 0.2126*R + 0.7152*G + 0.0722*B
  4. L > 0.5 → "light", else → "dark"

Для gradient: извлечь первый #hex из строки regex /#[0-9a-fA-F]{6}/
```

