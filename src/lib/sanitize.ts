import DOMPurify from "dompurify";

/**
 * Sanitize HTML for safe rendering via dangerouslySetInnerHTML.
 * Allows only safe formatting tags from the contentEditable editor.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b", "i", "u", "s", "em", "strong", "span", "br", "font",
      "strike", "sub", "sup", "div", "p", "mark",
    ],
    ALLOWED_ATTR: ["style", "color", "size"],
    ALLOW_DATA_ATTR: false,
  });
}
