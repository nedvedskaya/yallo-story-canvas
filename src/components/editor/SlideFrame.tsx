/**
 * SlideFrame — unified slide renderer.
 * Used by SlideCarousel for preview and DownloadModal for export.
 * Single source of truth for slide layout.
 */
import React from "react";
import SlideOverlay from "./SlideOverlay";
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
  /** Event handlers for media drag */
  onMediaTouchStart?: (e: React.TouchEvent) => void;
  onMediaTouchMove?: (e: React.TouchEvent) => void;
  onMediaTouchEnd?: () => void;
  onMediaMouseDown?: (e: React.MouseEvent) => void;
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
}

const SlideFrame = React.forwardRef<HTMLDivElement, SlideFrameProps>(({
  slide, slideIndex, totalSlides, format, scale = 1,
  width, height,
  mediaOverrides, titleOverrides, bodyOverrides,
  onMediaTouchStart, onMediaTouchMove, onMediaTouchEnd, onMediaMouseDown,
  onTitleTouchStart, onTitleTouchMove, onTitleTouchEnd, onTitleMouseDown, onTitleClick,
  onBodyTouchStart, onBodyTouchMove, onBodyTouchEnd, onBodyMouseDown, onBodyClick,
  editorOpen, videoRefCallback, videoMuted = true, overlayOnly = false, dataSlideId,
}, ref) => {
  const metrics = getSlideMetrics(slide, format, scale);
  const mediaStyle = getMediaStyle(slide, mediaOverrides);
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
      {/* Overlay pattern */}
      {!overlayOnly && <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} color={slide.overlayColor} scale={scale} />}

      {/* Background image */}
      {!overlayOnly && slide.bgImage && (
        <div
          className="absolute inset-0 z-[2]"
          style={{ overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}
          onTouchStart={onMediaTouchStart}
          onTouchMove={onMediaTouchMove}
          onTouchEnd={onMediaTouchEnd}
          onMouseDown={onMediaMouseDown}
        >
          <img src={slide.bgImage} alt="" style={{ ...mediaStyle, objectFit: 'contain' }} />
          {slide.bgDarken > 0 && (
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})`, pointerEvents: 'none' }} />
          )}
        </div>
      )}

      {/* Background video */}
      {!overlayOnly && slide.bgVideo && (
        <div
          className="absolute inset-0 z-[2]"
          style={{ overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}
          onTouchStart={onMediaTouchStart}
          onTouchMove={onMediaTouchMove}
          onTouchEnd={onMediaTouchEnd}
          onMouseDown={onMediaMouseDown}
        >
          <video
            src={slide.bgVideo}
            autoPlay loop playsInline
            muted={videoMuted}
            style={{ ...mediaStyle, objectFit: 'cover' }}
            ref={videoRefCallback}
          />
          {slide.bgDarken > 0 && (
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})`, pointerEvents: 'none' }} />
          )}
        </div>
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
                dangerouslySetInnerHTML={{ __html: slide.title }}
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
                dangerouslySetInnerHTML={{ __html: slide.body }}
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
    </div>
  );
});

SlideFrame.displayName = "SlideFrame";

export default SlideFrame;
