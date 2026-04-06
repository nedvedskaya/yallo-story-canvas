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
  titleOverrides, bodyOverrides,
  onTitleTouchStart, onTitleTouchMove, onTitleTouchEnd, onTitleMouseDown, onTitleClick,
  onBodyTouchStart, onBodyTouchMove, onBodyTouchEnd, onBodyMouseDown, onBodyClick,
  editorOpen, videoRefCallback, videoMuted = true, overlayOnly = false, dataSlideId,
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
      {/* Background image */}
      {!overlayOnly && slide.bgImage && (
        <div
          className="absolute inset-0 z-[1]"
          style={{ overflow: 'hidden', pointerEvents: 'none' }}
        >
          <img src={slide.bgImage} alt="" style={{ ...mediaStyle, objectFit: 'cover' }} />
          {slide.bgDarken > 0 && (
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${slide.bgDarken / 100})`, pointerEvents: 'none' }} />
          )}
        </div>
      )}

      {/* Background video */}
      {!overlayOnly && slide.bgVideo && (
        <div
          className="absolute inset-0 z-[1]"
          style={{ overflow: 'hidden', pointerEvents: 'none' }}
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

      {/* Overlay pattern — on top of media but below content */}
      {!overlayOnly && <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} color={slide.overlayColor} scale={scale} />}

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top bar — author style variants */}
        {slide.showUsername !== false && (
          <>
            {/* V1: username слева, счётчик справа */}
            {(!slide.authorStyle || slide.authorStyle === 'v1') && (
              <div className="flex items-center justify-between w-full flex-shrink-0 mb-2">
                <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slide.username}</span>
                {slide.showSlideCount !== false && (
                  <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>[ {slideIndex + 1}/{totalSlides} ]</span>
                )}
              </div>
            )}
            {/* V2: username по центру */}
            {slide.authorStyle === 'v2' && (
              <div className="flex items-center justify-center w-full flex-shrink-0 mb-2">
                <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slide.username}</span>
              </div>
            )}
            {/* V3: username · счётчик по центру */}
            {slide.authorStyle === 'v3' && (
              <div className="flex items-center justify-center gap-1 w-full flex-shrink-0 mb-2">
                <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slide.username}</span>
                <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px` }}>·</span>
                {slide.showSlideCount !== false && (
                  <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slideIndex + 1}/{totalSlides}</span>
                )}
              </div>
            )}
            {/* V4: только счётчик по центру */}
            {slide.authorStyle === 'v4' && (
              <div className="flex items-center justify-center w-full flex-shrink-0 mb-2">
                {slide.showSlideCount !== false && (
                  <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slideIndex + 1} / {totalSlides}</span>
                )}
              </div>
            )}
          </>
        )}
        {/* Fallback: username hidden but slide count shown */}
        {slide.showUsername === false && slide.showSlideCount !== false && (
          <div className="flex items-center justify-end w-full flex-shrink-0 mb-2">
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>[ {slideIndex + 1}/{totalSlides} ]</span>
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-col flex-1 min-h-0" style={{ justifyContent: V_ALIGN_TO_JUSTIFY[slide.vAlign] || 'center' }}>

          {/* LAYOUT: photo-top */}
          {slide.layoutType === 'photo-top' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                flex: '0 0 52%',
                overflow: 'hidden',
                marginLeft: `-${metrics.padding}px`,
                marginRight: `-${metrics.padding}px`,
                marginTop: `-${metrics.padding}px`,
                borderRadius: '0px',
              }}>
                {slide.bgImage ? (
                  <img src={slide.bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: `${metrics.bodySize}px` }}>+ фото</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: `${metrics.padding * 0.6}px` }}>
                <div onTouchStart={onTitleTouchStart} onTouchMove={onTitleTouchMove} onTouchEnd={onTitleTouchEnd} onMouseDown={onTitleMouseDown} style={{ ...title.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab' }}>
                  <h2 onClick={onTitleClick} className="outline-none cursor-pointer" style={title.textStyle} dangerouslySetInnerHTML={{ __html: slide.title }} />
                </div>
                <div onTouchStart={onBodyTouchStart} onTouchMove={onBodyTouchMove} onTouchEnd={onBodyTouchEnd} onMouseDown={onBodyMouseDown} style={{ ...body.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab', marginTop: `${8 * scale}px` }}>
                  <p onClick={onBodyClick} className="outline-none cursor-pointer" style={body.textStyle} dangerouslySetInnerHTML={{ __html: slide.body }} />
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT: title-only */}
          {slide.layoutType === 'title-only' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div onTouchStart={onTitleTouchStart} onTouchMove={onTitleTouchMove} onTouchEnd={onTitleTouchEnd} onMouseDown={onTitleMouseDown} style={{ ...title.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab' }}>
                <h2 onClick={onTitleClick} className="outline-none cursor-pointer" style={{ ...title.textStyle, fontSize: `${metrics.titleSize * 1.35}px`, lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: slide.title }} />
              </div>
            </div>
          )}

          {/* LAYOUT: quote */}
          {slide.layoutType === 'quote' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: `${metrics.titleSize * 3}px`, lineHeight: 0.75, color: slide.titleColor || '#ffffff', opacity: 0.25, fontFamily: 'Georgia, serif', userSelect: 'none' }}>"</div>
              <div onTouchStart={onBodyTouchStart} onTouchMove={onBodyTouchMove} onTouchEnd={onBodyTouchEnd} onMouseDown={onBodyMouseDown} style={{ ...body.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab', marginTop: `${6 * scale}px` }}>
                <p onClick={onBodyClick} className="outline-none cursor-pointer" style={{ ...body.textStyle, fontSize: `${metrics.bodySize * 1.2}px`, fontStyle: 'italic', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: slide.body }} />
              </div>
              {slide.title && (
                <div style={{ marginTop: `${14 * scale}px`, color: slide.metaColor || 'rgba(255,255,255,0.55)', fontSize: `${metrics.footerSize * 1.3}px`, fontFamily: "'Inter', sans-serif" }}>
                  — <span dangerouslySetInnerHTML={{ __html: slide.title }} />
                </div>
              )}
            </div>
          )}

          {/* LAYOUT: default */}
          {(!slide.layoutType || slide.layoutType === 'default') && (
            <div>
              <div onTouchStart={onTitleTouchStart} onTouchMove={onTitleTouchMove} onTouchEnd={onTitleTouchEnd} onMouseDown={onTitleMouseDown} style={{ ...title.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab' }}>
                <h2 onClick={onTitleClick} className="outline-none cursor-pointer" style={title.textStyle} dangerouslySetInnerHTML={{ __html: slide.title }} />
              </div>
              <div onTouchStart={onBodyTouchStart} onTouchMove={onBodyTouchMove} onTouchEnd={onBodyTouchEnd} onMouseDown={onBodyMouseDown} style={{ ...body.wrapperStyle, touchAction: 'none', cursor: editorOpen ? 'text' : 'grab', marginTop: `${12 * scale}px` }}>
                <p onClick={onBodyClick} className="outline-none cursor-pointer" style={body.textStyle} dangerouslySetInnerHTML={{ __html: slide.body }} />
              </div>
            </div>
          )}

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
