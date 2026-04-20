/**
 * MinimalismLayout3 — title по центру вертикали + body ниже с underline-mark,
 * декоративное halftone-облако в правом-нижнем углу.
 *
 * HTML-эталон: /Яло/минимализм/layout3.html
 *   - title 72px Marvin Visions, центр по вертикали (top 460px от 1350);
 *   - body 28px Inter, ниже title, с underline-подчёркиванием через CSS
 *     text-decoration-color: var(--underline) — для слов в <span class="mark">;
 *   - halftone — SVG-арка из точек, bottom-right, rotate(-45deg), точки
 *     крупнее к углу (эффект градиента размера).
 *
 * Упрощение vs HTML: здесь underline применяется ко ВСЕМУ highlight-контенту
 * (т.к. prepareTitleHtml кладёт pill-span с фоном). В layout3 highlight-семантика
 * другая (underline, не pill), но чтобы не плодить альтернативный рендер для
 * одного шаблона — оставляю pill. Если Ольге нужен именно underline —
 * добавим слайд-настройку highlightStyle: 'pill' | 'underline'.
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

// Layout 3 использует единые токены шаблона Minimalism — размеры из
// getMinimalismSizes(format) как у Layout 1/2/4. Принцип: заголовок/основной
// текст одинакового размера по всей карусели.
//
// Halftone-декор (арка точек bottom-right) больше НЕ живёт внутри Layout 3.
// Он вынесен в SlideFrame как переиспользуемый декоративный элемент,
// управляемый полем slide.decorDots ('halftone' | 'none'). handleApplyTemplate
// в Index.tsx выставляет decorDots='halftone' по дефолту для Layout 3 слайдов.
// Пользователь включает/выключает через BG-панель → «Декоративные элементы».

const MinimalismLayout3: React.FC<SlideContentProps> = ({
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
  // body — основной блок (subtitle теперь = независимый «второй блок», Layout2).
  // fallback на subtitle оставлен для legacy-слайдов.
  const subtitle = stripHtml(slide.body || slide.subtitle || "");

  const accentColor = slide.accentColor || MINIMALISM_ACCENT;
  const titleColor = slide.titleColor || MINIMALISM_TITLE;
  // Layout3 body color из HTML = var(--text) #0A0A0A (не #666 как Layout1).
  const bodyColor = slide.bodyColor || MINIMALISM_TITLE;

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
      style={{ justifyContent: "center", pointerEvents: "none", position: "relative" }}
    >
      {/* Title — центр вертикали (justifyContent: center на родителе) */}
      <div style={{ width: "100%", pointerEvents: "auto", position: "relative", zIndex: 2 }}>
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
                maxWidth: `${720 * rs}px`,
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

export default MinimalismLayout3;
