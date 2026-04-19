/**
 * MinimalismBase — временный базовый layout-компонент, который используется
 * всеми четырьмя Minimalism-layouts до того, как Ольга отдаст HTML-эталоны.
 *
 * Задача: иметь работающий рендер title/subtitle/highlight с правильной
 * типографикой (Marvin Visions, format-aware размеры, pill-хайлайт),
 * drag/pinch/click wiring и никакой layout-специфичной визуальной композиции
 * (нет декора, нет колонок, нет тёмной инверсии).
 *
 * Как только приходит HTML для Layout N — заменяется содержимое
 * MinimalismLayoutN.tsx на свой уникальный рендер, и этот стуб перестаёт
 * использоваться для данного N.
 *
 * Поведение:
 *   - textAlign = slide.hAlign (default left)
 *   - vAlign управляется через flex justifyContent контейнера
 *   - титул и подзаголовок draggable + pinch-scalable
 *   - клик по title/body → onTitleClick/onBodyClick (вкладки Text-панели)
 *   - размеры шрифтов берутся из getMinimalismSizes(format), scale-aware
 *   - highlight — pill-span (renderTitleWithHighlight)
 */
import React from "react";
import type { SlideContentProps } from "../../SlideFactory";
import {
  stripHtml,
  caseToTransform,
  renderTitleWithHighlight,
  hAlignToText,
  getMinimalismSizes,
} from "../shared";

const MinimalismBase: React.FC<SlideContentProps> = ({
  slide,
  format,
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
  const title = stripHtml(slide.title || "");
  const subtitle = stripHtml(slide.subtitle || slide.body || "");
  const highlight = slide.highlight;

  const accentColor = slide.accentColor || "#CDE0FA";
  const titleColor = slide.titleColor || "#0A0A0A";
  const bodyColor = slide.bodyColor || "#666666";

  const titleFontFamily =
    slide.titleFont ||
    "'Marvin Visions', 'Space Grotesk', 'Inter', sans-serif";
  const bodyFontFamily = slide.bodyFont || "'Inter', sans-serif";

  // Format-aware размеры (см. MINIMALISM_SIZES в shared.ts). Если пользователь
  // уже подменил slide.titleSize/bodySize вручную — уважаем это. В preview
  // умножаем на renderScale, в export он будет 1 * exportScale.
  const rs = metrics.renderScale;
  const sizes = getMinimalismSizes(format);
  const titleFontSize = (slide.titleSize ?? sizes.titleSize) * rs;
  const subtitleFontSize = (slide.bodySize ?? sizes.bodySize) * rs;
  const subtitleMarginTop = sizes.titleBodyGap * rs;

  const textAlign = hAlignToText(slide.hAlign);

  const tOx = titleOverrides?.offsetX ?? (slide.titleOffsetX ?? 0);
  const tOy = titleOverrides?.offsetY ?? (slide.titleOffsetY ?? 0);
  const tSc = titleOverrides?.scale ?? (slide.titleScale ?? 1);
  const bOx = bodyOverrides?.offsetX ?? (slide.bodyOffsetX ?? 0);
  const bOy = bodyOverrides?.offsetY ?? (slide.bodyOffsetY ?? 0);
  const bSc = bodyOverrides?.scale ?? (slide.bodyScale ?? 1);

  // Вертикальное выравнивание: управляется slide.vAlign, доступно пользователю
  // через SlideToolbar. Default = center.
  const justifyContent =
    slide.vAlign === "end" ? "flex-end"
      : slide.vAlign === "start" ? "flex-start"
      : "center";

  return (
    <div
      className="flex flex-col flex-1 min-h-0 w-full"
      style={{ justifyContent, pointerEvents: "none" }}
    >
      <div style={{ width: "100%", pointerEvents: "auto" }}>
        <div
          onTouchStart={onTitleTouchStart}
          onTouchMove={onTitleTouchMove}
          onTouchEnd={onTitleTouchEnd}
          onMouseDown={onTitleMouseDown}
          style={{
            touchAction: "none",
            cursor: editorOpen ? "text" : "grab",
            transform: `translate(${tOx}px, ${tOy}px) scale(${tSc})`,
            transformOrigin: "center center",
          }}
        >
          <h1
            onClick={onTitleClick}
            className="outline-none cursor-pointer"
            style={{
              margin: 0,
              fontFamily: titleFontFamily,
              fontWeight: 700,
              fontSize: `${titleFontSize}px`,
              lineHeight: slide.titleLineHeight ?? 1.05,
              letterSpacing: `${slide.titleLetterSpacing ?? -0.02}em`,
              textTransform: caseToTransform(slide.titleCase),
              color: titleColor,
              textAlign,
            }}
          >
            {renderTitleWithHighlight(title, highlight, accentColor, titleColor, rs)}
          </h1>
        </div>

        {subtitle && (
          <div
            onTouchStart={onBodyTouchStart}
            onTouchMove={onBodyTouchMove}
            onTouchEnd={onBodyTouchEnd}
            onMouseDown={onBodyMouseDown}
            style={{
              touchAction: "none",
              cursor: editorOpen ? "text" : "grab",
              marginTop: `${subtitleMarginTop}px`,
              transform: `translate(${bOx}px, ${bOy}px) scale(${bSc})`,
              transformOrigin: "center center",
            }}
          >
            <p
              onClick={onBodyClick}
              className="outline-none cursor-pointer"
              style={{
                margin: 0,
                fontFamily: bodyFontFamily,
                fontWeight: 400,
                fontSize: `${subtitleFontSize}px`,
                lineHeight: slide.bodyLineHeight ?? 1.4,
                letterSpacing: `${slide.bodyLetterSpacing ?? 0}em`,
                textTransform: caseToTransform(slide.bodyCase),
                color: bodyColor,
                textAlign,
              }}
            >
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalismBase;
