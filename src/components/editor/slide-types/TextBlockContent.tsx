/**
 * TextBlockContent — canonical fallback layout (title + body, optional bullet list).
 *
 * This is an exact port of the content layer that lived inside SlideFrame before
 * the SlideFactory split. Slides without a `type` (or with `type === 'text_block'`)
 * render through this, guaranteeing back-compat with pre-type-system generations.
 *
 * Kept pure: no state, no refs, no data fetching. Parent owns drag handlers.
 */
import React from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { V_ALIGN_TO_JUSTIFY, getTitleStyle, getBodyStyle } from "../slide-render-model";
import type { SlideContentProps } from "../SlideFactory";

/** Parse body text into list items (mirror of SlideFrame.parseListItems). */
function parseListItems(body: string): string[] {
  return body
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      if ((line.match(/[•→]/g) || []).length > 1) {
        return line.split(/(?=[•→])/).map((s) => s.trim()).filter(Boolean);
      }
      return [line];
    })
    .map((line) => line.replace(/^[•→]\s*/, ""));
}

const TextBlockContent: React.FC<SlideContentProps> = ({
  slide,
  metrics,
  titleOverrides,
  bodyOverrides,
  editorOpen,
  onTitleTouchStart,
  onTitleTouchMove,
  onTitleTouchEnd,
  onTitleMouseDown,
  onTitleClick,
  onBodyTouchStart,
  onBodyTouchMove,
  onBodyTouchEnd,
  onBodyMouseDown,
  onBodyClick,
}) => {
  const title = getTitleStyle(slide, metrics, titleOverrides);
  const body = getBodyStyle(slide, metrics, bodyOverrides);

  const isList = slide.hasList || /[•→]/.test(slide.body);
  const listItems = isList ? parseListItems(slide.body) : [];

  return (
    <div
      className="flex flex-col flex-1 min-h-0"
      style={{ justifyContent: V_ALIGN_TO_JUSTIFY[slide.vAlign] || "center" }}
    >
      <div>
        {/* Title */}
        <div
          onTouchStart={onTitleTouchStart}
          onTouchMove={onTitleTouchMove}
          onTouchEnd={onTitleTouchEnd}
          onMouseDown={onTitleMouseDown}
          style={{
            ...title.wrapperStyle,
            touchAction: "none",
            cursor: editorOpen ? "text" : "grab",
            pointerEvents: "auto",
          }}
        >
          <h2
            onClick={onTitleClick}
            className="outline-none cursor-pointer"
            style={title.textStyle}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.title) }}
          />
        </div>
        {/* Body */}
        <div
          onTouchStart={onBodyTouchStart}
          onTouchMove={onBodyTouchMove}
          onTouchEnd={onBodyTouchEnd}
          onMouseDown={onBodyMouseDown}
          style={{
            ...body.wrapperStyle,
            touchAction: "none",
            cursor: editorOpen ? "text" : "grab",
            marginTop: `${metrics.titleBodyGap}px`,
            pointerEvents: "auto",
          }}
        >
          {isList ? (
            <ul
              onClick={onBodyClick}
              className="outline-none cursor-pointer"
              style={{
                ...body.textStyle,
                fontSize: `${metrics.bulletSize}px`,
                lineHeight: metrics.bulletLineHeight,
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: `${metrics.bulletGap}px`,
                maxWidth: `${metrics.bulletMaxWidth * 100}%`,
              }}
            >
              {listItems.map((line, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: `${metrics.bulletIndent}px`,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      opacity: 0.7,
                      lineHeight: metrics.bulletLineHeight,
                    }}
                  >
                    •
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(line) }} />
                </li>
              ))}
            </ul>
          ) : (
            <p
              onClick={onBodyClick}
              className="outline-none cursor-pointer"
              style={body.textStyle}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.body) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TextBlockContent;
