/**
 * MinimalismLayout4 — title + subtitle + quote-card с акцент-эмодзи в углу.
 *
 * Эталон (v2 от 19 Apr): /Яло/минимализм/layout4.html + скриншот «Внимание —
 * это не охват» + quote «Охват можно купить…». Отличия от v1:
 *   - убран Marvin Visions в title (не поддерживает кириллицу нормально),
 *     вместо него Space Grotesk 700 как в Layout2 → читаемый bold sans-serif;
 *   - title уменьшен до ~80px@1080 (в v1 было 96px — слишком крупно);
 *   - эмодзи в акцент-dot настраиваемый (slide.markEmoji, дефолт 🔥).
 *     Если markEmoji=='' — сам кружок всё равно рендерится (акцент-пятно),
 *     просто без эмодзи внутри.
 *
 * Три текстовых поля:
 *   - slide.title  → заголовок;
 *   - slide.subtitle → "текст перед плашкой" (серый intro между title и card);
 *   - slide.body → текст внутри quote-card (с поддержкой <b> акцентной фразы).
 *
 * Text-панель (см. TextPanel.tsx) показывает отдельный редактор для subtitle,
 * когда slide.layout === 4, чтобы пользователь мог редактировать оба блока.
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

/** Шрифт title для Layout4 — Space Grotesk 700 (cyrillic-compatible).
 *  Override только если пользователь не менял titleFont вручную. */
const LAYOUT4_TITLE_FONT = "'Space Grotesk', 'Inter', sans-serif";

/** Layout4-специфичные размеры. v1 был 0.92× базы (96px@1080) — крупно;
 *  по скриншоту Ольги реально ~80px@1080 → 0.77×. */
function getLayout4Sizes(base: ReturnType<typeof getMinimalismSizes>) {
  return {
    titleSize: Math.round(base.titleSize * 0.77),
    bodySize: Math.round(base.bodySize * 0.70),
    titleBodyGap: Math.round(base.titleBodyGap * 0.9),
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
  // subtitle = intro-текст перед плашкой; quote = контент внутри плашки.
  const subtitle = stripHtml(slide.subtitle || "");
  const quote = stripHtml(slide.body || "");
  // Эмодзи для акцент-dot. undefined → дефолт 🔥; пустая строка → кружок без эмодзи.
  const markEmoji = slide.markEmoji ?? "🔥";

  const accentColor = slide.accentColor || MINIMALISM_ACCENT;
  const titleColor = slide.titleColor || MINIMALISM_TITLE;
  const bodyColor = slide.bodyColor || MINIMALISM_BODY;

  const titleFontFamily =
    slide.titleFont && slide.titleFont !== MINIMALISM_TITLE_FONT
      ? slide.titleFont
      : LAYOUT4_TITLE_FONT;
  const bodyFontFamily = slide.bodyFont || MINIMALISM_BODY_FONT;

  const rs = metrics.renderScale;
  const base = getMinimalismSizes(format);
  const sizes = getLayout4Sizes(base);
  const titleFontSize = (slide.titleSize ?? sizes.titleSize) * rs;
  const subtitleFontSize = (slide.bodySize ?? sizes.bodySize) * rs;
  const subtitleMarginTop = sizes.titleBodyGap * rs;
  const quoteFontSize = Math.round(sizes.bodySize * 0.92) * rs;

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
              letterSpacing: `${slide.titleLetterSpacing ?? -0.02}em`,
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

        {/* Subtitle — intro-текст перед плашкой */}
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

        {/* Quote-card — скруглённая серая плашка с акцент-эмодзи справа-снизу */}
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
                paddingRight: `${76 * rs}px`,
                textAlign,
              }}
              // Позволяем <b>жирному</b> из InlineTextEditor работать.
              dangerouslySetInnerHTML={{
                __html: prepareTitleHtml(slide.body || "", undefined, accentColor),
              }}
            />
            {/* Акцент-dot: кружок с (опциональным) эмодзи в правом-нижнем углу */}
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
              {markEmoji}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalismLayout4;
