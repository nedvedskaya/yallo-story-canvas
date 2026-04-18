

# План правок

## 1. Адаптивный размер заголовков по количеству слов

**Файл**: новый `src/lib/text-sizing.ts` + `src/components/editor/slide-render-model.ts`

Создать утилиту:
```ts
export function getAdaptiveTitleSize(text: string, format: SlideFormat): { size: number; clamp: string } {
  const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  // Возвращаем clamp(min, vw, max) пропорционально формату
  // 1–3 слова → крупный, 4–6 → средний, 7+ → мелкий
}
```

В `getTitleStyle` (slide-render-model.ts):
- Если `slide.titleSize` НЕ задан пользователем — использовать адаптивный размер из утилиты (масштаб от формата).
- Добавить `overflow: hidden`, `wordBreak: 'break-word'`, `overflowWrap: 'break-word'` в `textStyle` заголовка и тела.
- Убрать жёсткое `metrics.titleSize` как дефолт — брать адаптив.

Размеры по формату (export-resolution px, скейлится автоматически):
- Карусель: 1–3сл → 96, 4–6сл → 72, 7+сл → 56
- Квадрат: 1–3сл → 88, 4–6сл → 64, 7+сл → 50
- Сторис: 1–3сл → 110, 4–6сл → 84, 7+сл → 64
- Презентация: 1–3сл → 84, 4–6сл → 64, 7+сл → 48

Никаких хардкодов в JSX SlideFrame.

## 2. Выравнивание заголовка и тела по левому краю

**Файл**: `src/pages/Index.tsx`, `src/components/editor/TemplatesPanel.tsx`, `src/hooks/use-bot-token.ts`

- `initialSlides[0]`: `hAlign: "left"` (сейчас `center`).
- Поменять `coverApply.hAlign` во всех трёх шаблонах на `"left"` (сейчас `center`).
- В `handleAddSlide` в `Index.tsx`: дефолт уже `"left"` — оставить.
- В `useBotToken` для cover-слайдов (если есть переопределение) — `hAlign: "left"`.

## 3. Превью шаблонов = реальный 1-й слайд

**Файл**: `src/components/editor/TemplatesPanel.tsx`

Перерисовать `preview` каждого шаблона так, чтобы он визуально совпадал с тем, как cover применяется в редакторе:

- **Тетрадь** (cover): тёмный фон `#1A1A1A`, сетка с белой прозрачностью, белый заголовок «Заголовок» Dela Gothic One крупно по левому краю, под ним «Текст слайда» белым, `@username` и `[1/3]` светло-серыми.
- **Минимализм** (cover): белый фон, заголовок «ЗАГОЛОВОК» SONGER Grotesque uppercase крупно по левому краю, тело «Основной текст слайда» под ним.
- **Бордо** (cover): фон `#620107`, белый заголовок «Шрифтовые» Forum крупно слева, белое тело, `@username` и `[1/3]` бледно-белыми.

Все три превью — одна структура (top-bar @username + [1/3], центр — title + body слева, bottom-bar пустой/стрелка), различаются только цветами/шрифтами.

## 4. Перетаскивание стикеров на всех устройствах

**Файл**: `src/components/editor/StickerLayer.tsx`

Текущая реализация уже использует pointer events, но `pointerEvents: 'auto'` стоит на родительском `<div>`, который может перехватывать тапы и блокировать drag по слайдам. Нужно:
- На контейнере `<div>` — `pointerEvents: 'none'` (сквозной).
- На каждом `<img>` — `pointerEvents: 'auto'` (только сам стикер ловит события).
- Убедиться, что `touch-action: none` стоит у `<img>` (уже стоит).
- Добавить `setPointerCapture` у `<img>` (уже есть).

Это позволит:
- Драгать сам стикер пальцем/мышкой.
- Тапать по областям слайда между стикерами (текст, фон).

## 5. Кнопка «Вставить» декоративных элементов

**Файл**: `src/components/editor/BackgroundPanel.tsx`

Текущий `handleStickerPaste` пытается `navigator.clipboard.read()`, что в Safari/iOS возвращает пустой массив или падает без ошибки. Нужно:

- Создать невидимый `<textarea>` при клике «Вставить», сфокусировать его, через `setTimeout` диспатчить `document.execCommand('paste')` или явно открыть промпт «Нажмите Ctrl+V».
- Лучше: при клике «Вставить» показывать toast «Нажмите Ctrl+V (⌘+V), чтобы вставить» и фокусировать невидимый input. Глобальный `paste`-listener уже работает (он есть в коде), но он срабатывает только если фокус не на input/textarea. Нужно гарантировать, что слушатель ловит paste и в фокусированном режиме.
- Обновить листенер `onPaste`: убрать early-return при отсутствии файлов и пробовать `getAsString` для типа `text/html` (в HTML может быть `<img src="data:...">`) — парсить и брать первое изображение.

## 6. Сохранение состояния редактора между сессиями

**Файл**: `src/pages/Index.tsx` + новый `src/hooks/use-persistent-slides.ts`

Создать хук для автосохранения в `localStorage`:

```ts
function usePersistentSlides(initial: Slide[]) {
  const KEY = 'yalo-slides-v1';
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initial;
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(slides)); } catch {}
  }, [slides]);
  return [slides, setSlides] as const;
}
```

Также сохранять/восстанавливать `slideFormat` и `activeSlide` (отдельные ключи).

**Важные нюансы**:
- Если в URL есть `?token=xxx` и `useBotToken` вернул `botSlides` — это **перезаписывает** localStorage (новая генерация важнее старой).
- `bgImage`/`bgVideo` как `blob:` URL не переживают перезагрузку — при восстановлении такие поля удалять и сбрасывать на цвет фона. (data: URL и обычные http URL — оставлять.)
- `bgVideoFile: File` — не сериализуется, его выкидывать.
- Добавить кнопку «Очистить» (опционально, в TopBar) — `localStorage.removeItem(KEY)` + reload. (Можно отложить.)

## Затрагиваемые файлы

| Файл | Изменения |
|---|---|
| `src/lib/text-sizing.ts` (новый) | Утилита `getAdaptiveTitleSize` |
| `src/components/editor/slide-render-model.ts` | Адаптивный размер заголовка + `overflow: hidden`, `wordBreak` |
| `src/pages/Index.tsx` | `hAlign: "left"` в initialSlides, использовать `usePersistentSlides` |
| `src/components/editor/TemplatesPanel.tsx` | `hAlign: "left"` в coverApply, перерисовать preview под cover |
| `src/hooks/use-bot-token.ts` | `hAlign: "left"` для cover (если переопределяется) |
| `src/components/editor/StickerLayer.tsx` | Контейнер `pointerEvents: none`, на img — `auto` |
| `src/components/editor/BackgroundPanel.tsx` | Улучшить paste: фокус-input + ловить `text/html` |
| `src/hooks/use-persistent-slides.ts` (новый) | Автосохранение в localStorage с очисткой blob: URL |

