/**
 * Утилиты для «акцента» — подсветки последнего слова в заголовке.
 *
 * Два визуальных режима:
 *   - "highlight" — pill-плашка (background: accentColor, border-radius 999px,
 *     padding 0.08em 14px 0.12em). Цвет текста наследуется от titleColor, что
 *     совпадает с рендером pill в Minimalism-layouts (см. renderTitleWithHighlight
 *     в layouts/shared.ts).
 *   - "color" — простая перекраска последнего слова в accentColor (без фона).
 *
 * Раньше эта логика была дублирована 4 раза inline в Index.tsx (handleApplyTemplate
 * и handleAddSlide × 2 ветки). Если дизайнер меняет padding/border-radius плашки,
 * теперь правится в одном месте (здесь и в layouts/shared.ts:PILL_PADDING_X /
 * PILL_RADIUS, которые используются при React-рендере уже hydrated pill).
 */

export type AccentMode = "highlight" | "color";

/** Padding пилюли по горизонтали (em-like, px-часть синхронизирована с
 *  renderTitleWithHighlight в layouts/shared.ts — pad = 14px * renderScale). */
const PILL_PADDING = "0.08em 14px 0.12em";
const PILL_RADIUS = "999px";

/** Оборачивает последнее слово строки в `<span>` с акцентным стилем.
 *  Принимает plain-текст (без HTML-тегов). Если нужно — сначала прогони
 *  через stripHtml из layouts/shared.ts.
 *
 *  Возвращает HTML-строку (для slide.title, который рендерится через
 *  dangerouslySetInnerHTML или парсится layout-компонентом). */
export function wrapLastWordAsAccent(
  text: string,
  accentColor: string,
  mode: AccentMode,
): string {
  if (!text) return text;
  const pattern = /(\S+)(\s*)$/;
  if (mode === "highlight") {
    return text.replace(
      pattern,
      `<span style="display:inline-block;background:${accentColor};padding:${PILL_PADDING};border-radius:${PILL_RADIUS};line-height:1">$1</span>$2`,
    );
  }
  return text.replace(
    pattern,
    `<span style="color:${accentColor}">$1</span>$2`,
  );
}
