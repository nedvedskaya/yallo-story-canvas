/**
 * Единый формат HTML для рендера заголовка слайда с pill-выделением.
 *
 * Проблема, которую решает модуль:
 *   - handleApplyTemplate оборачивает последнее слово в `<span>` с фоном + padding
 *     + border-radius:999 (канонический pill) — вставляет прямо в slide.title.
 *   - InlineTextEditor через document.execCommand('hiliteColor') оборачивает
 *     выделение в `<span style="background-color: rgb(...)">` — БЕЗ padding/radius,
 *     то есть плоский фон, визуально отличный от канонического pill.
 *   - Бэкенд (use-bot-token.ts) кладёт отдельное поле slide.highlight со
 *     строкой-подстрокой заголовка, без всякого HTML.
 *
 * Раньше MinimalismBase/Layout1 делал `stripHtml(title)` + искал slide.highlight
 * через indexOf — редакторские HTML-span'ы полностью терялись, а botовские
 * slide.highlight-поля работали. Визуал pill шёл только через React-span в
 * renderTitleWithHighlight, синхронизации с toolbar'ом не было.
 *
 * Теперь:
 *   1. prepareTitleHtml() принимает raw title (может быть HTML-текст или plain),
 *      опционально slide.highlight и accentColor, и возвращает sanitized HTML
 *      для рендера через dangerouslySetInnerHTML.
 *   2. Любой `<span>` с атрибутом background / background-color приводится к
 *      каноническому pill-формату (normalizePillSpans) — теперь toolbar и
 *      шаблон выглядят одинаково.
 *   3. Если title plain-текст и задан slide.highlight → оборачиваем подстроку в
 *      канонический pill (injectHighlightSpan).
 *
 * Это гарантирует, что ЛЮБОЙ layout, рендерящий title через prepareTitleHtml,
 * будет показывать pill одинаково — откуда бы он ни пришёл (шаблон / toolbar /
 * API). Для будущих шаблонов (Тетрадь, Бордо) та же утилита работает без изменений.
 */
import { sanitizeHtml } from "./sanitize";

/** Канонический inline-style для pill-span. Синхронизирован с:
 *   - wrapLastWordAsAccent (lib/accent.ts)
 *   - renderTitleWithHighlight (layouts/shared.ts)
 *   - applyHighlightAsPill (InlineTextEditor — после миграции) */
function canonicalPillStyle(bgColor: string): string {
  // Горизонтальный padding уменьшен до 0.15em (было 8px → 14px → 8px → 0.15em).
  // Em-based, потому что при больших размерах шрифта px-padding становится
  // визуально мелким, а при мелких — непропорционально большим. 0.15em ≈ 12%
  // от размера буквы — плашка вплотную к буквам, как в HTML-эталоне из
  // референса Ольги. Вертикальный: 0.08em сверху + 0.12em снизу (baseline).
  return `display:inline-block;background:${bgColor};padding:0.08em 0.15em 0.12em;border-radius:999px;line-height:1`;
}

/** True, если строка выглядит как HTML (есть хотя бы один открывающий тег). */
function looksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*?>/i.test(s);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Оборачивает первое вхождение `highlight` в `plain` в канонический pill-span.
 *  Пробелы в тексте pill-а заменяются на NBSP, чтобы плашка не разрывалась
 *  между строк (важно для длинных highlight'ов в 2+ слова). */
function injectHighlightSpan(plain: string, highlight: string, accentColor: string): string {
  const idx = plain.indexOf(highlight);
  if (idx === -1) return escapeHtml(plain);
  const before = escapeHtml(plain.slice(0, idx));
  const after = escapeHtml(plain.slice(idx + highlight.length));
  const innerNbsp = escapeHtml(highlight).replace(/ /g, "&nbsp;");
  return `${before}<span style="${canonicalPillStyle(accentColor)}">${innerNbsp}</span>${after}`;
}

/** Превращает любой `<span>` с background / background-color в канонический
 *  pill-span. Сохраняет остальное содержимое атрибутов и innerHTML как есть.
 *  Идемпотентно: если span уже каноничен, результат совпадает со входом.
 *  Из span'ов БЕЗ background (обычные color/bold-span'ы от InlineTextEditor)
 *  удаляем inline font-family и font-size — шрифт должен приходить ТОЛЬКО
 *  от h1-обёртки layout-компонента, чтобы шаблон Minimalism выглядел единым. */
function normalizePillSpans(html: string): string {
  // Находим открывающий span-тег с атрибутом style. Извлекаем из style
  // первое вхождение background(-color): <color>. Если нет — зачищаем
  // font-family и font-size из style и возвращаем span без них.
  return html.replace(
    /<span\s+([^>]*?)>/gi,
    (match, attrs: string) => {
      const styleMatch = attrs.match(/style\s*=\s*"([^"]*?)"/i);
      if (!styleMatch) return match;
      const style = styleMatch[1];
      const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+?)(?:;|$)/i);
      if (bgMatch) {
        const bgColor = bgMatch[1].trim();
        return `<span style="${canonicalPillStyle(bgColor)}">`;
      }
      // Нет background — чистим шрифтовые свойства из остального style.
      const cleanedStyle = style
        .replace(/font-family\s*:\s*[^;]+;?/gi, '')
        .replace(/font-size\s*:\s*[^;]+;?/gi, '')
        .trim();
      if (!cleanedStyle) {
        // Весь style состоял из font-family/size — span без стиля
        return '<span>';
      }
      const cleanedAttrs = attrs.replace(
        /style\s*=\s*"[^"]*"/i,
        `style="${cleanedStyle}"`,
      );
      return `<span ${cleanedAttrs}>`;
    },
  );
}

/** Вырезает deprecated <font face="X" size="Y"> теги, которые вставляет
 *  document.execCommand('fontName'). Нужно, чтобы inline-выбор шрифта в
 *  тулбаре InlineTextEditor не перекрывал системный шрифт layout-обёртки
 *  (Marvin Visions для Minimalism). Содержимое между тегами сохраняем. */
function stripFontTags(html: string): string {
  return html
    .replace(/<font\b[^>]*>/gi, '')
    .replace(/<\/font>/gi, '');
}

/**
 * Готовит sanitized HTML заголовка для dangerouslySetInnerHTML.
 *
 * Правила:
 *   - Пусто → пусто.
 *   - Если title уже HTML → нормализуем pill-span'ы, чистим <font>-теги
 *     и санитизируем.
 *   - Если title plain + highlight задан → оборачиваем highlight в pill.
 *   - Если title plain без highlight → escape и отдаём как есть.
 */
export function prepareTitleHtml(
  title: string | undefined,
  highlight: string | undefined,
  accentColor: string,
): string {
  if (!title) return "";

  let html: string;
  if (looksLikeHtml(title)) {
    html = stripFontTags(normalizePillSpans(title));
  } else if (highlight) {
    html = injectHighlightSpan(title, highlight, accentColor);
  } else {
    html = escapeHtml(title);
  }

  return sanitizeHtml(html);
}
