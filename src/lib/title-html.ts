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
  return `display:inline-block;background:${bgColor};padding:0.08em 14px 0.12em;border-radius:999px;line-height:1`;
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
 *  Идемпотентно: если span уже каноничен, результат совпадает со входом. */
function normalizePillSpans(html: string): string {
  // Находим открывающий span-тег с атрибутом style. Извлекаем из style
  // первое вхождение background(-color): <color>. Если его нет — span не
  // меняем (это может быть color-span от foreColor).
  return html.replace(
    /<span\s+([^>]*?)>/gi,
    (match, attrs: string) => {
      const styleMatch = attrs.match(/style\s*=\s*"([^"]*?)"/i);
      if (!styleMatch) return match;
      const style = styleMatch[1];
      const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+?)(?:;|$)/i);
      if (!bgMatch) return match;
      const bgColor = bgMatch[1].trim();
      return `<span style="${canonicalPillStyle(bgColor)}">`;
    },
  );
}

/**
 * Готовит sanitized HTML заголовка для dangerouslySetInnerHTML.
 *
 * Правила:
 *   - Пусто → пусто.
 *   - Если title уже HTML → нормализуем pill-span'ы и санитизируем.
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
    html = normalizePillSpans(title);
  } else if (highlight) {
    html = injectHighlightSpan(title, highlight, accentColor);
  } else {
    html = escapeHtml(title);
  }

  return sanitizeHtml(html);
}
