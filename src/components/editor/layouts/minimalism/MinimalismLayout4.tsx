/**
 * MinimalismLayout4 — title + subtitle + quote-card ниже с акцент-dot (🔥)
 * в правом-нижнем углу карточки.
 *
 * HTML-эталон: /Яло/минимализм/layout4.html
 *   - title 96px Space Grotesk/Marvin Visions 700, text-wrap: balance;
 *   - subtitle Inter 30px 400, color #666;
 *   - quote block: скруглённая карточка (radius 28) #F0F0F0, padding 32×36,
 *     внутри text 26px Inter 400 (с поддержкой <b> для акцентной фразы) и
 *     круглая "mark" с эмодзи в правом-нижнем углу;
 *   - цвет mark = accentColor.
 *
 * Контент quote — из slide.body (полностью plain-text). Если slide.body пустой,
 * quote-блок не рендерится. Эмодзи в mark — 🔥 (жёстко из эталона); можно
 * сделать настраиваемым через slide.markEmoji, но пока Ольга этого не просила.
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

// Layout4 использует subtitle для «подписи» под заголовком (как Layout1/Base),
// а slide.body — для quote-текста. Если только одно из этих полей — показываем
// только его.
function getLayout4Sizes(base: ReturnType<typeof getMinimalismSizes>) {
  return {
    titleSize: Math.round(base.titleSize * 0.92),
    bodySize: Math.round(base.bodySize * 0.75),
    titleBodyGap: Math.round(base.titleBodyGap * 1.15),
  };
}

const MinimalismLayout4: React.FC<SlideContentProps> = ({
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
  // Для layout4 subtitle = slide.subtitle (подзаголовок под title),
  // quote = slide.body (цитата в карточке). Разделение осмысленно, потому что
  // это композиция из двух текстовых блоков.
  const subtitle = stripHtml(slide.subtitle || "");
  const quote = stripHtml(slide.body || "");

  const accentColor = slide.accentColor || MINIMALISM_ACCENT;
  const titleColor = slide.titleColor || MINIMALISM_TITLE;
  const bodyColor = slide.bodyColor || MINIMALISM_BODY;

  const titleFontFamily = slide.titleFont || MINIMALISM_TITLE_FONT;
  const bodyFontFamily = slide.bodyFont || MINIMALISM_BODY_FONT;

  const rs = metrics.renderScale;
  const base = getMinimalismSizes(format);
  const sizes = getLayout4Sizes(base);
  const titleFontSize = (slide.titleSize ?? sizes.titleSize) * rs;
  const subtitleFontSize = (slide.bodySize ?? sizes.bodySize) * rs;
  const subtitleMarginTop = sizes.titleBodyGap * rs;
  const quoteFontSize = 26 * rs;

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
      style={{ justifyContent: "center", pointerEvents: "none" }}
    >
      <div style={{ width: "100%", pointerEvents: "auto" }}>
        {/* Title */}
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
              letterSpacing: `${slide.titleLetterSpacing ?? -0.025}em`,
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

        {/* Subtitle под заголовком */}
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
                lineHeight: slide.bodyLineHeight ?? 1.35,
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

        {/* Quote-блок — скруглённая серая карточка с акцент-dot в углу */}
        {quote && (
          <div
            onClick={onBodyClick}
            style={{
              position: "relative",
              marginTop: `${44 * rs}px`,
              background: "#F0F0F0",
              borderRadius: `${28 * rs}px`,
              padding: `${32 * rs}px ${36 * rs}px`,
              maxWidth: "100%",
              cursor: editorOpen ? "text" : "pointer",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: bodyFontFamily,
                fontWeight: 400,
                fontSize: `${quoteFontSize}px`,
                lineHeight: 1.4,
                color: "#2A2A2A",
                paddingRight: `${64 * rs}px`,
                textAlign,
              }}
            >
              {quote}
            </p>
            {/* Акцент-mark — круг с эмодзи 🔥 в правом-нижнем углу */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: `${22 * rs}px`,
                bottom: `${18 * rs}px`,
                width: `${56 * rs}px`,
                height: `${56 * rs}px`,
                borderRadius: "50%",
                background: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: `${30 * rs}px`,
                lineHeight: 1,
              }}
            >
              🔥
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalismLayout4;
