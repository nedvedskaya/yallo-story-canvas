
# План: убрать дубли рендера/сохранения и сделать единый источник отображения

## Что уже выявлено
- Дублирование есть: `SlideCarousel.tsx` и `export-utils.ts` оба отдельно описывают один и тот же слайд (типографика, отступы, позиционирование, overlay, медиа).
- В `export-utils.ts` дублируется контентный слой между `buildExportSlide` и `buildContentOverlay`.
- Из-за разных путей рендера текст «съезжает» при экспорте относительно того, что видно в редакторе.

## Что сделаем

1. **Единый рендер слайда (single source of truth)**
   - Добавить общий компонент `SlideFrame.tsx`, который рендерит весь слайд (фон, медиа, overlay, top/bottom bar, title/body, offsets/scales).
   - `SlideCarousel` будет использовать `SlideFrame` вместо локальной разметки.

2. **Единая модель вычислений стилей**
   - Вынести вычисления в общий модуль (например `slide-render-model.ts`):  
     `getMediaStyle`, `getTextStyle`, `getLayoutMetrics`, `hAlign/vAlign maps`.
   - И preview, и export берут параметры только из этого модуля.

3. **Убрать дубли в экспорте**
   - В `DownloadModal.tsx` сделать один pipeline сохранения:
     - `prepareSlide(index)`  
     - `renderStaticCanvas(slide)` для PNG/PDF  
     - `renderVideoWithOverlay(slide)` для видео
   - Общий прогресс/ошибки/скачивание для всех режимов (`png`, `pdf`, `all`), без повторяющихся циклов.

4. **Overlay для видео из того же источника**
   - Для видео-экспорта оверлей строить тем же `SlideFrame` (режим `overlay-only`), а не отдельной вручную собранной разметкой.
   - Это устранит расхождение текста между экраном и видео.

5. **Корректность и проверка一致**
   - Прогнать проверку на 4 форматах (carousel/square/stories/presentation):
     - позиции title/body,
     - переносы строк,
     - размер/интервалы/выделение,
     - медиа (contain/cover, позиция, масштаб, затемнение),
     - совпадение preview vs PNG/PDF и текст поверх видео.

## Файлы для изменений
- `src/components/editor/SlideCarousel.tsx`
- `src/components/editor/DownloadModal.tsx`
- `src/components/editor/export-utils.ts` (рефактор/упрощение)
- `src/components/editor/shared-styles.ts` (если нужно для общих токенов)
- `src/components/editor/SlideFrame.tsx` (новый)
- `src/components/editor/slide-render-model.ts` (новый, если отделяем вычисления)

## Технические детали
- **Do I know what the issue is?** Да. Корневая проблема — два разных рендера одного и того же слайда (preview и export), плюс дубли в самом export-слое.
- Дополнительно учтём мобильные ограничения `MediaRecorder` (Safari): без «тихого» fallback — только явное уведомление о режиме сохранения.
- Цель рефактора: не «подгонять» экспорт, а гарантировать совпадение через один общий рендер-источник.
