/**
 * Highlight utility for type-specific slide components.
 *
 * The backend/LLM returns `highlight` as a verbatim substring of the parent
 * text field (e.g. hook.title, thesis.text). This wraps the first occurrence
 * in a <mark> with the template's accent color so sanitizeHtml (which
 * whitelists <mark>) can render it as a highlighted phrase.
 *
 * Robustness contract:
 *  - Substring not found → return `text` unchanged (no highlight rendered).
 *  - Empty/undefined `phrase` → return `text` unchanged.
 *  - Search is case-sensitive — first exact occurrence only.
 *  - The caller is still responsible for piping the result through
 *    sanitizeHtml() before dangerouslySetInnerHTML.
 */
export function applyHighlight(
  text: string,
  phrase: string | undefined,
  accentColor: string,
): string {
  if (!text || !phrase) return text;
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const after = text.slice(idx + phrase.length);
  // Inline CSS kept short so sanitizeHtml's style passthrough can keep it intact.
  const style = [
    `background:${accentColor}`,
    "color:#0A0A0A",
    "border-radius:8px",
    "padding:1px 8px",
    "display:inline",
    "line-height:inherit",
    "box-decoration-break:clone",
    "-webkit-box-decoration-break:clone",
  ].join(";");

  return `${before}<mark style="${style}">${phrase}</mark>${after}`;
}
