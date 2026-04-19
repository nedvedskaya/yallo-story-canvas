/**
 * HookContent — первый слайд карусели в стиле Minimalism.
 *
 * Layout-контракт (из claude.design эталона):
 *   - Заголовок: Marvin Visions → Space Grotesk fallback, 88px на 1080-ширине,
 *     weight 700, line-height 1.1, letter-spacing -0.015em, цвет #0A0A0A.
 *   - Хайлайт: pill-span с фоном slide.accentColor (обычно #CDE0FA),
 *     border-radius 999px, padding 0.08em 14px 0.12em, margin-left -14px.
 *     Чёрный текст внутри (#0A0A0A).
 *   - Подзаголовок: Inter 400, 28px на 1080-ширине, цвет slide.bodyColor (#666),
 *     margin-top 20px.
 *
 * Масштабирование: все размеры в px × scale, где scale = 1 для превью
 * (ширина контейнера ~96px в TemplatesPanel, либо 1080px слайд) и
 * exportWidth / previewWidth для экспорта. Метрики рассчитываются от
 * slide-render-model (хотя Hook имеет свои фикс-размеры и их не трогает).
 *
 * Хайлайт рендерится React-нодами: ищем первое вхождение slide.highlight в
 * slide.title, разбиваем на before / <span> / after. Если не нашли — title
 * рендерится как есть, без подсветки.
 */
import React from "react";
import type { SlideContentProps } from "../SlideFactory";

/** Разбивает title на React-ноды с pill-span на месте highlight. */
function renderTitleWithHighlight(
  title: string,
  highlight: string | undefined,
  accentColor: string,
  titleColor: string,
  renderScale: number,
): React.ReactNode {
  if (!title) return null;
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx === -1) return title;

  const before = title.slice(0, idx);
  const after = title.slice(idx + highlight.length);

  // Pill-плашка. margin-left: -14px * renderScale — чтобы текст внутри плашки
  // визуально выровнялся с остальными строками (плашка «выезжает» влево
  // на размер padding-а). Цвет текста внутри pill — titleColor, чтобы выделенное
  // слово совпадало по цвету с остальным заголовком (а не было белым по умолчанию).
  const pad = 14 * renderScale;
  const pillStyle: React.CSSProperties = {
    display: "inline-block",
    background: accentColor,
    color: titleColor,
    borderRadius: 999,
    padding: `0.08em ${pad}px 0.12em`,
    marginLeft: -pad,
    lineHeight: 1,
  };

  // Внутри pill-плашки пробелы заменяем на NBSP, чтобы слова не разрывались
  // между строк и плашка оставалась единым цельным блоком (в эталоне —
  // "запоминаются&nbsp;сразу,").
  const pillText = highlight.replace(/ /g, "\u00A0");

  return (
    <>
      {before}
      <span style={pillStyle}>{pillText}</span>
      {after}
    </>
  );
}

const HookContent: React.FC<SlideContentProps> = ({
  slide,
  metrics,
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
  const title = slide.title || "";
  const subtitle = slide.subtitle || slide.body || "";
  const highlight = slide.highlight;

  const accentColor = slide.accentColor || "#CDE0FA";
  const titleColor = slide.titleColor || "#0A0A0A";
  const bodyColor = slide.bodyColor || "#666666";

  // Font stack: если в slide задан titleFont — используем его, иначе
  // Marvin Visions → Space Grotesk → Inter (fallback chain).
  const titleFontFamily =
    slide.titleFont ||
    "'Marvin Visions', 'Space Grotesk', 'Inter', sans-serif";
  const bodyFontFamily = slide.bodyFont || "'Inter', sans-serif";

  // Размеры — фиксированы под 1080×1350 эталон и масштабируются через
  // metrics.renderScale = (previewW / exportW) * scale. Это превращает
  // design-spec px в корректные px и в превью (≈290px контейнер), и в
  // экспорте (1080px). Сам `scale` prop слишком грубый — он =1 в превью.
  const rs = metrics.renderScale;
  const titleFontSize = 88 * rs;
  const subtitleFontSize = 28 * rs;
  const subtitleMarginTop = 20 * rs;

  return (
    <div style={{ width: "100%" }}>
      {/* Title — без dangerouslySetInnerHTML, highlight = React-нода */}
      <div
        onTouchStart={onTitleTouchStart}
        onTouchMove={onTitleTouchMove}
        onTouchEnd={onTitleTouchEnd}
        onMouseDown={onTitleMouseDown}
        style={{
          touchAction: "none",
          cursor: editorOpen ? "text" : "grab",
          pointerEvents: "auto",
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
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            color: titleColor,
            textAlign: "left",
          }}
        >
          {renderTitleWithHighlight(title, highlight, accentColor, titleColor, rs)}
        </h1>
      </div>

      {/* Subtitle */}
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
            pointerEvents: "auto",
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
              lineHeight: 1.4,
              color: bodyColor,
              textAlign: "left",
            }}
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};

export default HookContent;
