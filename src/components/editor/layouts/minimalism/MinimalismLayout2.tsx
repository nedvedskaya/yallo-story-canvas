/**
 * MinimalismLayout2 — фото-плейсхолдер + title/subtitle снизу.
 *
 * Эталон (v2 от 19 Apr): /Яло/минимализм/layout2.html + скриншот «Внимание —
 * это не охват» от Ольги. Отличия от v1:
 *   - убран декоративный цветок-астериск (SlideFrame теперь показывает
 *     decorShape только на layout 1);
 *   - title шрифт = Space Grotesk 700 (Marvin Visions не поддерживает
 *     кириллицу корректно, поэтому насилует текст в CAPS; здесь нужен
 *     читаемый bold sans-serif);
 *   - title размер уменьшен до ~52px@1080 (в v1 было 73px — дисбаланс
 *     с фото-блоком);
 *   - photo-placeholder кликабельный: по клику открывается диалог выбора
 *     файла, выбранный blob записывается в slide.image_url через onSlidePatch.
 *
 * Поведение drag/pinch/click заголовка/подписи — идентично Layout1/Base.
 * Если пользователь задал slide.titleFont/titleSize вручную — уважаем их
 * (override только для дефолтов).
 */
import React, { useRef } from "react";
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

// Export-px константы из HTML-эталона (1080×1350).
const PHOTO_HEIGHT_EXPORT_PX = 620;
const PHOTO_RADIUS_EXPORT_PX = 24;
const PHOTO_TO_TEXT_GAP_EXPORT_PX = 40;
const UPLOAD_ICON_SIZE_EXPORT_PX = 96;

// Layout 2 использует единые токены шаблона Minimalism: titleFont=Marvin Visions,
// bodyFont=Inter, размеры из getMinimalismSizes(format). Никаких layout-override'ов
// — так заголовок/основной текст всех слайдов Minimalism выглядят одинаково.

const MinimalismLayout2: React.FC<SlideContentProps> = ({
  slide,
  format,
  metrics,
  titleOverrides,
  bodyOverrides,
  subtitleOverrides,
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
  onSubtitleTouchStart,
  onSubtitleTouchMove,
  onSubtitleTouchEnd,
  onSubtitleMouseDown,
  onSubtitleClick,
  onSlidePatch,
}) => {
  // Теперь body и subtitle — независимые блоки. Пустая строка в subtitle (типа "")
  // означает «пользователь явно добавил второй блок, но ещё не набрал текст» —
  // показываем плейсхолдер чтобы был visual affordance для drag/click. undefined =
  // «нет второго блока» → не рендерим.
  const body = stripHtml(slide.body || "");
  const hasSubtitle = typeof slide.subtitle === "string";
  const subtitle = stripHtml(slide.subtitle || "");

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
  const sOx = subtitleOverrides?.offsetX ?? (slide.subtitleOffsetX ?? 0);
  const sOy = subtitleOverrides?.offsetY ?? (slide.subtitleOffsetY ?? 0);
  const sSc = subtitleOverrides?.scale ?? (slide.subtitleScale ?? 1);

  // photo-блок: диагональная штриховка.
  const hatchStyle: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 ${22 * rs}px, rgba(0,0,0,0.05) ${22 * rs}px ${44 * rs}px)`,
  };

  // Клик по заглушке → открыть диалог выбора файла → blob URL → patch slide.
  // editorOpen подавляет upload (в этом режиме клик = текстовый фокус).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canUpload = !!onSlidePatch && !editorOpen;
  const handlePhotoClick = () => {
    if (!canUpload) return;
    fileInputRef.current?.click();
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSlidePatch) return;
    // Ревоук предыдущего blob (если это он), чтобы не копить в памяти.
    if (slide.image_url?.startsWith("blob:")) {
      try { URL.revokeObjectURL(slide.image_url); } catch { /* noop */ }
    }
    onSlidePatch({ image_url: URL.createObjectURL(file) });
    // Сбрасываем value чтобы при повторной загрузке того же файла сработал onChange.
    e.target.value = "";
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 w-full"
      style={{ pointerEvents: "none", paddingTop: `${40 * rs}px` }}
    >
      {/* Photo placeholder — rectangular, rounded, hatched.
          onClick открывает file picker → загрузка в slide.image_url. */}
      <div
        role={canUpload ? "button" : undefined}
        aria-label={canUpload ? "Загрузить фото" : undefined}
        onClick={handlePhotoClick}
        style={{
          width: "100%",
          height: `${PHOTO_HEIGHT_EXPORT_PX * rs}px`,
          background: "#EDEDED",
          borderRadius: `${PHOTO_RADIUS_EXPORT_PX * rs}px`,
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
          pointerEvents: canUpload ? "auto" : "none",
          cursor: canUpload ? "pointer" : "default",
        }}
      >
        {slide.image_url ? (
          // Используем div с background-image вместо <img objectFit:cover>,
          // потому что html2canvas 1.4.1 не поддерживает object-fit и растягивает
          // <img> на width×height, ломая пропорции фото в PNG/PDF-экспорте.
          // background-size:cover html2canvas рендерит корректно.
          <div
            role="img"
            aria-label=""
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${slide.image_url}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoChange}
        />
      </div>

      {/* Text block — под фото, tight gap */}
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
              lineHeight: slide.titleLineHeight ?? 1.1,
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

        {body && (
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
              {body}
            </p>
          </div>
        )}

        {/* Второй независимый текстовый блок. Показывается только если пользователь
            явно добавил его через кнопку «+ Добавить основной текст» в TextPanel
            (slide.subtitle становится строкой, включая пустую). Имеет собственный
            transform (sOx/sOy/sSc) → можно таскать отдельно от body. */}
        {hasSubtitle && (
          <div
            onTouchStart={onSubtitleTouchStart}
            onTouchMove={onSubtitleTouchMove}
            onTouchEnd={onSubtitleTouchEnd}
            onMouseDown={onSubtitleMouseDown}
            style={{
              touchAction: "none",
              cursor: editorOpen ? "text" : "grab",
              marginTop: `${subtitleMarginTop}px`,
              transform: `translate(${sOx}px, ${sOy}px) scale(${sSc})`,
              transformOrigin: "center center",
            }}
          >
            <p
              onClick={onSubtitleClick}
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
                // Пустой subtitle: показываем полупрозрачный плейсхолдер чтобы был
                // visual affordance (иначе пустой <p> схлопнется в 0px и пользователь
                // потеряет кликабельную зону).
                opacity: subtitle ? 1 : 0.4,
              }}
            >
              {subtitle || "Второй текст"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalismLayout2;
