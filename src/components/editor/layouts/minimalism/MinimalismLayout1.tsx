/**
 * MinimalismLayout1 — первый «зафиксированный» дизайн шаблона Minimalism.
 *
 * Композиция:
 *   - декор (астериск) — управляется SlideFrame через slide.decorShape;
 *   - title + subtitle — прижаты к низу слайда, но с отступом ~2см от нижнего
 *     края, чтобы текст не лип к границе карточки;
 *   - textAlign = slide.hAlign (default left);
 *   - titleSize/bodySize — format-aware (см. getMinimalismSizes).
 *
 * Отличие от MinimalismBase: здесь vAlign игнорируется и всегда используется
 * нижний якорь с фиксированным bottomPadding ≈ 160px в экспорт-пикселях
 * (scale-aware через renderScale). Layouts 2/3/4 продолжают реэкспортить
 * MinimalismBase до появления дизайнов.
 */
import React from "react";
import type { SlideContentProps } from "../../SlideFactory";
import {
  stripHtml,
  caseToTransform,
  hAlignToText,
  getMinimalismSizes,
} from "../shared";
import {
  MINIMALISM_ACCENT,
  MINIMALISM_TITLE,
  MINIMALISM_BODY,
  MINIMALISM_TITLE_FONT,
  MINIMALISM_BODY_FONT,
} from "./tokens";
import { prepareTitleHtml } from "@/lib/title-html";

// Отступ от нижнего края слайда до низа текста (в экспорт-пикселях).
// ~2см при ширине слайда 1080px. Масштабируется в preview через renderScale.
const BOTTOM_PADDING_EXPORT_PX = 160;

const MinimalismLayout1: React.FC<SlideContentProps> = ({
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
  // Body — основной блок. subtitle — отдельный «второй блок», им управляет Layout2.
  // Здесь читаем body первым; fallback на subtitle оставлен для legacy-слайдов,
  // где текст сохранён в старом поле subtitle.
  const subtitle = stripHtml(slide.body || slide.subtitle || "");

  const accentColor = slide.accentColor || MINIMALISM_ACCENT;
  const titleColor = slide.titleColor || MINIMALISM_TITLE;
  const bodyColor = slide.bodyColor || MINIMALISM_BODY;

  const titleFontFamily = slide.titleFont || MINIMALISM_TITLE_FONT;
  const bodyFontFamily = slide.bodyFont || MINIMALISM_BODY_FONT;

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

  return (
    <div
      className="flex flex-col flex-1 min-h-0 w-full"
      style={{
        justifyContent: "flex-end",
        paddingBottom: `${BOTTOM_PADDING_EXPORT_PX * rs}px`,
        pointerEvents: "none",
      }}
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
            dangerouslySetInnerHTML={{
              __html: prepareTitleHtml(slide.title, slide.highlight, accentColor),
            }}
          />
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

export default MinimalismLayout1;
