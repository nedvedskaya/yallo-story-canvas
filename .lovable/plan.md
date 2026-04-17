# План правок

## 1. Сохранение переносов строк (Enter) в заголовке и тексте

**Проблема**: В `TextEditorModal` пользователь жмёт Enter и видит абзацы, но на слайде `<p>` / `<h2>` рендерит всё сплошной строкой — `white-space` не сохраняет переносы, а `<br>`/`<div>` от contentEditable иногда теряются при санитайзе.

**Решение**:

- В `src/lib/sanitize.ts` добавить тег `div` и `p` в `ALLOWED_TAGS` (DOMPurify по умолчанию пропускает `<br>`, но `contentEditable` в Chrome вставляет `<div>` на каждый Enter).
- В `src/components/editor/slide-render-model.ts` (`getTitleStyle` и `getBodyStyle`) добавить `whiteSpace: 'pre-wrap'` в `textStyle` — это сохранит явные `\n` и пробелы.
- В режиме «обычный текст» (без списка) в `SlideFrame.tsx` оставить `<p>` / `<h2>` — но `pre-wrap` + `<br>` от редактора обеспечат корректные пустые строки между абзацами.

## 2. Перетаскивание стикеров + кнопка «Вставить»

**Проблема №1 — драг не работает**: В `SlideFrame.tsx` в JSX `<StickerLayer>` пропс `stickerInteractive` берётся из родителя, но в `Index.tsx`/`SlideCarousel` он, скорее всего, передаётся как `false` для активного слайда (или вовсе не передаётся). Нужно проверить и установить `stickerInteractive={true}` для активного слайда в превью.

**Проблема №2 — «Вставить» не работает**: `navigator.clipboard.read()` требует HTTPS + permissions + поддержку браузера. Нужно показать toast при ошибке/пустом буфере и добавить fallback через глобальный `paste`-listener (когда панель открыта — слушать `document.addEventListener('paste', ...)` и брать `e.clipboardData.items`).

**Решение**:

- В `BackgroundPanel.tsx` улучшить `handleStickerPaste`: использовать `e.clipboardData` через временное окно или сразу повесить `document.paste` listener при открытии секции.
- Гарантировать что в `SlideCarousel`/`SlideFrame` для активного слайда передаётся `stickerInteractive={true}`, `onUpdateSticker`, `onDeleteSticker`.
- Стикер `StickerLayer` уже использует pointer events для drag — это работает и для пальца, и для мыши; нужно лишь пробросить хендлеры.

## 3. Синхронизация размера в панели «Текст» с реальным размером

**Проблема**: В `TextPanel.tsx` слайдер «Размер» показывает `currentSlide.titleSize ?? 24`. Когда `titleSize === undefined` (по умолчанию), показывается фиктивные 24, а на слайде используется значение из `FORMAT_DESIGN[format].titleSize` (для карусели — 68, отмасштабированное в превью).

**Решение**:

- В `TextPanel.tsx` при `titleSize == null` брать значение из `FORMAT_DESIGN[currentFormat].titleSize` (нужно прокинуть `slideFormat` пропсом из `Index.tsx` → `BottomSheet` → `TextPanel`).
- То же для `bodySize`. Слайдер будет показывать реальный текущий размер. Когда пользователь двигает слайдер — записывается `titleSize` (override), которое потом отображается на слайде.
- Опционально расширить диапазон слайдера до `8–120` (сейчас `8–48`), т.к. по дизайн-системе заголовок карусели — 68px.

## 4. Выделение первого слайда (cover) во всех шаблонах

**Идея**: Первый слайд должен быть «обложкой» — крупнее, ярче, с акцентом.

**Решение**:

- Расширить интерфейс `SlideTemplate` полем `coverApply?: Partial<Slide>` — переопределения только для первого слайда.
- Для каждого шаблона задать `coverApply`:
  - **Тетрадь**:  фон первого слайда сделать немного темнее, остальные слайды оставить как есть, белый заголовок крупнее (`titleSize: 96`), `vAlign: "center"`, `hAlign: "center"`.
  - **Минимализм**: цвет фона оставить без изменений, заголовок 100px по центру.
  - **Бордо**: фон 1 слайда тёмно-бордовый #620107, последующие слайды фон #e5e3d7, усилить размер до 120px по центру + декоративная курсивная подпись. цвет заголовка #010003, цвет основного шрифта #49453e, цвет выделения #630208
- В `Index.tsx` в `handleApplyTemplate` применять `coverApply` только к первому слайду (index 0), `apply` — ко всем остальным.
- Для нового пустого редактора (initialSlides) — оставить как сейчас (минимализм), но сделать первый слайд по cover-варианту минимализма.

---

## Затрагиваемые файлы


| Файл                                                         | Изменения                                                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `src/lib/sanitize.ts`                                        | Добавить `div`, `p` в `ALLOWED_TAGS`                                                     |
| `src/components/editor/slide-render-model.ts`                | `whiteSpace: 'pre-wrap'` в title/body styles                                             |
| `src/components/editor/BackgroundPanel.tsx`                  | Улучшить `handleStickerPaste` + paste-listener                                           |
| `src/components/editor/SlideCarousel.tsx` / `SlideFrame.tsx` | Включить `stickerInteractive` для активного слайда                                       |
| `src/components/editor/TextPanel.tsx`                        | Брать дефолт размера из `FORMAT_DESIGN`, расширить диапазон слайдера                     |
| `src/components/editor/BottomSheet.tsx`                      | Прокинуть `slideFormat` в `TextPanel`                                                    |
| `src/pages/Index.tsx`                                        | Прокинуть `slideFormat`; применять `coverApply` к первому слайду; обновить initialSlides |
| `src/components/editor/TemplatesPanel.tsx`                   | Добавить `coverApply` в каждый из 3 шаблонов                                             |
