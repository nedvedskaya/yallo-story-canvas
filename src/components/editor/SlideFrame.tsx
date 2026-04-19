/**
 * SlideFrame — unified slide renderer.
 * Used by SlideCarousel for preview and DownloadModal for export.
 */
import React from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import SlideOverlay from "./SlideOverlay";
import StickerLayer from "./StickerLayer";
import type { Slide } from "./SlideCarousel";
import type { SlideFormat } from "./SizePanel";
import {
  H_ALIGN_TO_TEXT,
  V_ALIGN_TO_JUSTIFY,
  getSlideMetrics,
  getMediaStyle,
  getTitleStyle,
  getBodyStyle,
} from "./slide-render-model";

export interface SlideFrameProps {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  format: SlideFormat;
  /** Scale factor: 1 for preview, exportWidth/previewWidth for export */
  scale?: number;
  /** Override width/height for export (px). If not set, uses 100% */
  width?: number;
  height?: number;
  titleOverrides?: { offsetX?: number; offsetY?: number; scale?: number };
  bodyOverrides?: { offsetX?: number; offsetY?: number; scale?: number };
  onTitleTouchStart?: (e: React.TouchEvent) => void;
  onTitleTouchMove?: (e: React.TouchEvent) => void;
  onTitleTouchEnd?: () => void;
  onTitleMouseDown?: (e: React.MouseEvent) => void;
  onTitleClick?: () => void;
  onBodyTouchStart?: (e: React.TouchEvent) => void;
  onBodyTouchMove?: (e: React.TouchEvent) => void;
  onBodyTouchEnd?: () => void;
  onBodyMouseDown?: (e: React.MouseEvent) => void;
  onBodyClick?: () => void;
  editorOpen?: boolean;
  videoRefCallback?: (el: HTMLVideoElement | null) => void;
  videoMuted?: boolean;
  overlayOnly?: boolean;
  dataSlideId?: number;
  onUpdateSticker?: (id: string, updates: Partial<{x:number;y:number;scale:number;rotation:number}>) => void;
  onDeleteSticker?: (id: string) => void;
  stickerInteractive?: boolean;
  watermark?: string;
}

/** Parse body text into list items */
function parseListItems(body: string): string[] {
  return body
    .split(/\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .flatMap(line => {
      if ((line.match(/[•→]/g) || []).length > 1) {
        return line.split(/(?=[•→])/).map(s => s.trim()).filter(Boolean);
      }
      return [line];
    })
    .map(line => line.replace(/^[•→]\s*/, ''));
}

const SlideFrame = React.forwardRef<HTMLDivElement, SlideFrameProps>(({
  slide, slideIndex, totalSlides, format, scale = 1,
  width, height,
  titleOverrides, bodyOverrides,
  onTitleTouchStart, onTitleTouchMove, onTitleTouchEnd, onTitleMouseDown, onTitleClick,
  onBodyTouchStart, onBodyTouchMove, onBodyTouchEnd, onBodyMouseDown, onBodyClick,
  editorOpen, videoRefCallback, videoMuted = true, overlayOnly = false, dataSlideId,
  onUpdateSticker, onDeleteSticker, stickerInteractive = false,
  watermark,
}, ref) => {
  const metrics = getSlideMetrics(slide, format, scale);
  const isExport = !!(width && height);
  const mediaStyle = getMediaStyle(slide, undefined, isExport ? width : undefined, isExport ? height : undefined);
  const title = getTitleStyle(slide, metrics, titleOverrides);
  const body = getBodyStyle(slide, metrics, bodyOverrides);

  const isList = slide.hasList || /[•→]/.test(slide.body);
  const listItems = isList ? parseListItems(slide.body) : [];

  const rootStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    position: 'relative',
    overflow: 'hidden',
    background: overlayOnly ? 'transparent' : slide.bgColor,
    borderRadius: '0px',
    textAlign: H_ALIGN_TO_TEXT[slide.hAlign] as React.CSSProperties['textAlign'],
    paddingTop: `${metrics.paddingTop}px`,
    paddingBottom: `${metrics.paddingBottom}px`,
    paddingLeft: `${metrics.paddingLeft}px`,
    paddingRight: `${metrics.paddingRight}px`,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div ref={ref} style={rootStyle} data-slide-id={dataSlideId}>
      {/* Background media */}
      {!overlayOnly && (slide.bgImage || slide.bgVideo) && (
        <div className="absolute inset-0 z-[1]" style={{ overflow: 'hidden', pointerEvents: 'none' }}>
          {slide.bgImage && (
            <img src={slide.bgImage} alt="" loading="lazy" decoding="async" style={{ ...mediaStyle, objectFit: 'cover' }} />
          )}
          {slide.bgVideo && (
            <video
              src={slide.bgVideo}
              autoPlay loop playsInline
              muted={videoMuted}
              style={{ ...mediaStyle, objectFit: 'cover' }}
              ref={videoRefCallback}
            />
          )}
          {slide.bgDarken > 0 && (
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})`, pointerEvents: 'none' }} />
          )}
        </div>
      )}

      {/* Overlay pattern */}
      {!overlayOnly && <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} color={slide.overlayColor} scale={scale} />}

      {/* Decorative shape (e.g. halftone asterisk) — rendered above overlay, below content.
          Shape is filled with a dot pattern masked by the asterisk silhouette. */}
      {!overlayOnly && slide.decorShape === 'asterisk' && (() => {
        const uid = `decor-${dataSlideId ?? 'x'}`;
        const patternId = `${uid}-dots`;
        const maskId = `${uid}-mask`;
        const fadeId = `${uid}-fade`;
        const color = slide.decorColor || '#CDE0FA';
        return (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: `${slide.decorTop ?? -8}%`,
              left: `${slide.decorLeft ?? 42}%`,
              width: `${slide.decorSize ?? 75}%`,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <svg
              viewBox="0 0 280 280"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
            >
              <defs>
                <pattern id={patternId} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="6" cy="6" r="2.8" fill={color} />
                </pattern>
                {/* Radial fade: dots are denser/opaque in center, fade toward the edges */}
                <radialGradient id={fadeId} cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="70%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.25" />
                </radialGradient>
                <mask id={maskId}>
                  <rect width="280" height="280" fill="black" />
                  <g fill={`url(#${fadeId})`}>
                    <g transform="translate(140 140)">
                      <rect x="-36" y="-126" width="72" height="150" rx="36" ry="36" />
                      <rect x="-34" y="-122" width="68" height="146" rx="34" ry="34" transform="rotate(60)" />
                      <rect x="-37" y="-128" width="74" height="152" rx="37" ry="37" transform="rotate(120)" />
                      <rect x="-35" y="-124" width="70" height="148" rx="35" ry="35" transform="rotate(180)" />
                      <rect x="-36" y="-126" width="72" height="150" rx="36" ry="36" transform="rotate(240)" />
                      <rect x="-34" y="-120" width="68" height="144" rx="34" ry="34" transform="rotate(300)" />
                      <circle cx="0" cy="0" r="58" />
                      <circle cx="-8" cy="6" r="50" />
                      <circle cx="10" cy="-4" r="46" />
                    </g>
                  </g>
                </mask>
              </defs>
              <rect width="280" height="280" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
            </svg>
          </div>
        );
      })()}

      {/* Content layer — pointer-events: none on wrapper so stickers (above) can be dragged anywhere.
          Interactive children re-enable pointer-events. */}
      <div className="relative z-10 flex flex-col h-full w-full" style={{ pointerEvents: 'none' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between w-full flex-shrink-0" style={{ marginBottom: `${4 * scale}px`, pointerEvents: 'auto' }}>
          {slide.showUsername !== false ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slide.username}</span>
          ) : <span />}
          {slide.showSlideCount !== false ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.counterSize}px`, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>[ {slideIndex + 1}/{totalSlides} ]</span>
          ) : <span />}
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 min-h-0" style={{ justifyContent: V_ALIGN_TO_JUSTIFY[slide.vAlign] || 'center' }}>
          <div>
            {/* Title */}
            <div
              onTouchStart={onTitleTouchStart}
              onTouchMove={onTitleTouchMove}
              onTouchEnd={onTitleTouchEnd}
              onMouseDown={onTitleMouseDown}
              style={{ ...title.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab', pointerEvents: 'auto' }}
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
              style={{ ...body.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab', marginTop: `${metrics.titleBodyGap}px`, pointerEvents: 'auto' }}
            >
              {isList ? (
                <ul
                  onClick={onBodyClick}
                  className="outline-none cursor-pointer"
                  style={{
                    ...body.textStyle,
                    fontSize: `${metrics.bulletSize}px`,
                    lineHeight: metrics.bulletLineHeight,
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${metrics.bulletGap}px`,
                    maxWidth: `${metrics.bulletMaxWidth * 100}%`,
                  }}
                >
                  {listItems.map((line, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: `${metrics.bulletIndent}px` }}>
                      <span style={{ flexShrink: 0, opacity: 0.7, lineHeight: metrics.bulletLineHeight }}>•</span>
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

        {/* Bottom bar */}
        <div className="flex items-end justify-between w-full flex-shrink-0" style={{ pointerEvents: 'auto' }}>
          {slide.showFooter ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.6)', fontSize: `${metrics.footerSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>
              {slide.footerText || ""}
            </span>
          ) : <span />}
          {slide.showArrow !== false && slideIndex < totalSlides - 1 ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.5)', fontSize: `${(metrics.footerSize + 2 * scale)}px` }}>→</span>
          ) : <span />}
        </div>
      </div>

      {/* Sticker layer — rendered ABOVE content so they can be dragged anywhere on the slide */}
      {slide.stickers && slide.stickers.length > 0 && (
        <div className="absolute inset-0 z-[15]" style={{ pointerEvents: 'none' }}>
          <StickerLayer
            stickers={slide.stickers}
            onUpdateSticker={onUpdateSticker}
            onDeleteSticker={onDeleteSticker}
            interactive={stickerInteractive}
            scale={scale}
          />
        </div>
      )}

      {/* Watermark */}
      {watermark && (
        <div className="absolute z-20" style={{
          bottom: `${8 * scale}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: `${9 * scale}px`,
            color: slide.metaColor || 'rgba(255,255,255,0.5)',
            fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap',
          }}>{watermark}</span>
        </div>
      )}
    </div>
  );
});

SlideFrame.displayName = "SlideFrame";

export default SlideFrame;
