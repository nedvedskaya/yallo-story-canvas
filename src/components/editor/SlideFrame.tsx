/**
 * SlideFrame — unified slide renderer.
 * Used by SlideCarousel for preview and DownloadModal for export.
 * Single source of truth for slide layout.
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
  /** Override title drag offsets (for live drag preview) */
  titleOverrides?: { offsetX?: number; offsetY?: number; scale?: number };
  /** Override body drag offsets (for live drag preview) */
  bodyOverrides?: { offsetX?: number; offsetY?: number; scale?: number };
  /** Event handlers for title drag */
  onTitleTouchStart?: (e: React.TouchEvent) => void;
  onTitleTouchMove?: (e: React.TouchEvent) => void;
  onTitleTouchEnd?: () => void;
  onTitleMouseDown?: (e: React.MouseEvent) => void;
  onTitleClick?: () => void;
  /** Event handlers for body drag */
  onBodyTouchStart?: (e: React.TouchEvent) => void;
  onBodyTouchMove?: (e: React.TouchEvent) => void;
  onBodyTouchEnd?: () => void;
  onBodyMouseDown?: (e: React.MouseEvent) => void;
  onBodyClick?: () => void;
  /** Is editor open (affects cursor) */
  editorOpen?: boolean;
  /** For video slides: ref callback */
  videoRefCallback?: (el: HTMLVideoElement | null) => void;
  /** For video: muted state */
  videoMuted?: boolean;
  /** Hide background (for overlay-only mode in video export) */
  overlayOnly?: boolean;
  /** Data attribute for slide identification */
  dataSlideId?: number;
  /** Sticker interaction handlers */
  onUpdateSticker?: (id: string, updates: Partial<{x:number;y:number;scale:number;rotation:number}>) => void;
  onDeleteSticker?: (id: string) => void;
  stickerInteractive?: boolean;
  /** Watermark text */
  watermark?: string;
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

  const rootStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    position: 'relative',
    overflow: 'hidden',
    background: overlayOnly ? 'transparent' : slide.bgColor,
    borderRadius: '0px',
    textAlign: H_ALIGN_TO_TEXT[slide.hAlign] as React.CSSProperties['textAlign'],
    padding: `${metrics.padding}px`,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div ref={ref} style={rootStyle} data-slide-id={dataSlideId}>
      {/* Background media (image or video) */}
      {!overlayOnly && (slide.bgImage || slide.bgVideo) && (
        <div
          className="absolute inset-0 z-[1]"
          style={{ overflow: 'hidden', pointerEvents: 'none' }}
        >
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

      {/* Overlay pattern — on top of media but below content */}
      {!overlayOnly && <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} color={slide.overlayColor} scale={scale} />}

      {/* Sticker layer — between overlay and content */}
      {slide.stickers && slide.stickers.length > 0 && (
        <StickerLayer
          stickers={slide.stickers}
          onUpdateSticker={onUpdateSticker}
          onDeleteSticker={onDeleteSticker}
          interactive={stickerInteractive}
          scale={scale}
        />
      )}

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between w-full flex-shrink-0 mb-2">
          {slide.showUsername !== false ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slide.username}</span>
          ) : <span />}
          {slide.showSlideCount !== false ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>[ {slideIndex + 1}/{totalSlides} ]</span>
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
              style={{ ...title.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab' }}
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
              style={{ ...body.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab', marginTop: `${12 * scale}px` }}
            >
              <p
                onClick={onBodyClick}
                className="outline-none cursor-pointer"
                style={body.textStyle}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.body) }}
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between w-full flex-shrink-0">
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
