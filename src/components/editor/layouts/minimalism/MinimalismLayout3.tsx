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

// Layout3 размеры: title чуть меньше Layout1, body крупнее (ведущий читающий
// текст).
function getLayout3Sizes(base: ReturnType<typeof getMinimalismSizes>) {
  return {
    titleSize: Math.round(base.titleSize * 0.70),
    bodySize: Math.round(base.bodySize * 0.72),
    titleBodyGap: base.titleBodyGap,
  };
}

// Генерация точек halftone-арки. Логика 1-в-1 из layout3.html (см. там JS).
// Выдаёт массив `{cx, cy, r}` в коорд. системе 1100×700.
interface Dot { cx: number; cy: number; r: number; }
function generateHalftoneDots(): Dot[] {
  const W = 1100, H = 700;
  const cx = W / 2;
  const step = 60;
  const rowStep = step * 0.9;
  const maxR = 14;
  const minR = 2.0;
  const cols = 17;
  const archRows = 9;
  const tailRows = 7;
  const rows = archRows + tailRows;
  const gridW = (cols - 1) * step;
  const gridH = (archRows - 1) * rowStep;
  const startX = cx - gridW / 2;
  const baseY = H / 2 - gridH / 2 + 110;
  const arcAmp = 220;
  const dots: Dot[] = [];
  const ang = (-45 * Math.PI) / 180;
  const cosA = Math.cos(ang);
  const sinA = Math.sin(ang);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const rowOffset = (row % 2) * (step / 2);
      const px = startX + col * step + rowOffset;
      const tx = (px - cx) / (gridW / 2);
      const lift = (1 - tx * tx) * arcAmp;
      const py = baseY + row * rowStep - lift;
      const ncol = (col - (cols - 1) / 2) / ((cols - 1) / 2);
      const absCol = Math.abs(ncol);
      if (absCol > 1.05) continue;
      if (py < -20 || py > H + 20 || px < -20 || px > W + 20) continue;
      const dxR = px - W / 2;
      const dyR = py - H / 2;
      const rx = dxR * cosA - dyR * sinA;
      const ry = dxR * sinA + dyR * cosA;
      const score = rx + ry;
      let t = (score + 400) / 900;
      t = Math.max(0, Math.min(1, t));
      const tipFade = 1 - Math.pow(absCol, 2) * 0.35;
      let r = minR + (maxR - minR) * t * tipFade;
      if (r < minR) r = minR;
      dots.push({ cx: px, cy: py, r });
    }
  }
  return dots;
}

// Pre-compute — одна и та же сетка для всех рендеров, на export-pixel-grid.
const HALFTONE_DOTS = generateHalftoneDots();

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
  const subtitle = stripHtml(slide.subtitle || slide.body || "");

  const accentColor = slide.accentColor || MINIMALISM_ACCENT;
  const titleColor = slide.titleColor || MINIMALISM_TITLE;
  // Layout3 body color из HTML = var(--text) #0A0A0A (не #666 как Layout1).
  const bodyColor = slide.bodyColor || MINIMALISM_TITLE;
  const halftoneColor = accentColor;

  const titleFontFamily = slide.titleFont || MINIMALISM_TITLE_FONT;
  const bodyFontFamily = slide.bodyFont || MINIMALISM_BODY_FONT;

  const rs = metrics.renderScale;
  const base = getMinimalismSizes(format);
  const sizes = getLayout3Sizes(base);
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
      {/* Halftone decor — абсолютно внизу-справа, rotate -45.
          SVG viewBox 1100×700; ширина = 110% контент-слоя, съезжает за правый
          и нижний край (SlideFrame root имеет overflow:hidden — кадрируется). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: `${-180 * rs}px`,
          bottom: `${-180 * rs}px`,
          width: `${1100 * rs}px`,
          height: `${700 * rs}px`,
          transform: "rotate(-45deg)",
          transformOrigin: "center center",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 1100 700"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <g fill={halftoneColor}>
            {HALFTONE_DOTS.map((d, i) => (
              <circle key={i} cx={d.cx.toFixed(2)} cy={d.cy.toFixed(2)} r={d.r.toFixed(2)} />
            ))}
          </g>
        </svg>
      </div>

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
