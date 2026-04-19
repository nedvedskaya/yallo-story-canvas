/**
 * MinimalismLayout2 — фото-плейсхолдер сверху + title/subtitle снизу.
 *
 * HTML-эталон: /Яло/минимализм/layout2.html
 *   - rectangular photo zone (1:1.5), borderRadius 24, светло-серый #EDEDED с
 *     диагональной штриховкой #D6D6D6, иконка upload + подпись-размер;
 *   - title 72px Marvin Visions внизу, subtitle Inter 22px.
 *
 * Отличие от Layout1: текст внизу, но НЕ прижат к краю — сверху большой
 * photo-блок, под ним компактный текст. Photo рендерим как SVG-плейсхолдер
 * (без user-image пока — Ольга не просила интеграцию со slide.bgImage).
 *
 * Поведение drag/pinch/click — идентично Layout1/Base.
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

// Export-px константы из HTML-эталона (1080×1350). renderScale применяется
// ко всем размерам в рендере, чтобы превью и экспорт совпадали.
const PHOTO_HEIGHT_EXPORT_PX = 620;
const PHOTO_RADIUS_EXPORT_PX = 24;
const PHOTO_TO_TEXT_GAP_EXPORT_PX = 40;
const UPLOAD_ICON_SIZE_EXPORT_PX = 96;

// Layout2 использует собственные размеры title/body (меньше, чем Layout1/Base),
// чтобы уравновесить photo-блок сверху. Значения из HTML-эталона.
function getLayout2Sizes(base: ReturnType<typeof getMinimalismSizes>) {
  return {
    titleSize: Math.round(base.titleSize * 0.70), // 104→73, 116→81, 108→76
    bodySize: Math.round(base.bodySize * 0.60),   // 40→24, 46→28, 38→23
    titleBodyGap: Math.round(base.titleBodyGap * 0.75),
  };
}

const MinimalismLayout2: React.FC<SlideContentProps> = ({
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
  const subtitle = stripHtml(slide.subtitle || slide.body || "");

  const accentColor = slide.accentColor || MINIMALISM_ACCENT;
  const titleColor = slide.titleColor || MINIMALISM_TITLE;
  const bodyColor = slide.bodyColor || MINIMALISM_BODY;

  const titleFontFamily = slide.titleFont || MINIMALISM_TITLE_FONT;
  const bodyFontFamily = slide.bodyFont || MINIMALISM_BODY_FONT;

  const rs = metrics.renderScale;
  const base = getMinimalismSizes(format);
  const sizes = getLayout2Sizes(base);
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

  // photo-блок: диагональная штриховка через repeating-linear-gradient.
  // rgba(0,0,0,0.02) слишком прозрачна на preview — усиливаем до 0.05 чтобы
  // hatching читалось и в скейле превью.
  const hatchStyle: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 ${22 * rs}px, rgba(0,0,0,0.05) ${22 * rs}px ${44 * rs}px)`,
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 w-full"
      style={{ pointerEvents: "none", paddingTop: `${60 * rs}px` }}
    >
      {/* Photo placeholder — rectangular, rounded, hatched. Если юзер задал
          slide.image_url от бота — показываем его вместо плейсхолдера. */}
      <div
        style={{
          width: "100%",
          height: `${PHOTO_HEIGHT_EXPORT_PX * rs}px`,
          background: "#EDEDED",
          borderRadius: `${PHOTO_RADIUS_EXPORT_PX * rs}px`,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
          pointerEvents: "none",
        }}
      >
        {slide.image_url ? (
          <img
            src={slide.image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <>
            <div className="absolute inset-0" style={hatchStyle} aria-hidden />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BFBFBF"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${UPLOAD_ICON_SIZE_EXPORT_PX * rs}px`,
                height: `${UPLOAD_ICON_SIZE_EXPORT_PX * rs}px`,
              }}
            >
              <rect x={3} y={4} width={18} height={16} rx={2} />
              <circle cx={9} cy={10} r={1.6} />
              <path d="M21 16l-5-5-9 9" />
            </svg>
            <span
              style={{
                position: "absolute",
                bottom: `${24 * rs}px`,
                left: `${28 * rs}px`,
                fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                fontSize: `${12 * rs}px`,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#BFBFBF",
              }}
            >
              photo · 920 × 620
            </span>
          </>
        )}
      </div>

      {/* Text block — под фото, gap ~40px */}
      <div
        style={{
          width: "100%",
          marginTop: `${PHOTO_TO_TEXT_GAP_EXPORT_PX * rs}px`,
          pointerEvents: "auto",
        }}
      >
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
              lineHeight: slide.titleLineHeight ?? 1.06,
              letterSpacing: `${slide.titleLetterSpacing ?? -0.015}em`,
              textTransform: caseToTransform(slide.titleCase),
              color: titleColor,
              textAlign,
              textWrap: "balance" as React.CSSProperties["textWrap"],
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
                lineHeight: slide.bodyLineHeight ?? 1.45,
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

export default MinimalismLayout2;
