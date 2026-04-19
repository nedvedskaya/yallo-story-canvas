/**
 * SlideFrame — unified slide renderer.
 * Used by SlideCarousel for preview and DownloadModal for export.
 */
import React from "react";
import SlideOverlay from "./SlideOverlay";
import StickerLayer from "./StickerLayer";
import SlideFactory from "./SlideFactory";
import { DecorShape } from "./TemplatesPanel";
import type { Slide } from "./SlideCarousel";
import type { SlideFormat } from "./SizePanel";
import {
  H_ALIGN_TO_TEXT,
  getSlideMetrics,
  getMediaStyle,
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

  // Minimalism style package: keyed off bgPattern === 'dots' (template-wide
  // marker). Drives 8% side padding, pill-counter topbar, hidden bottom bar.
  // The asterisk decor is a SEPARATE flag (slide.decorShape === 'asterisk')
  // — user may hide/remove it without losing the Minimalism styling.
  const isMinimalism = slide.bgPattern === 'dots';
  // Hook-specific: absolute top:58% positioning only for `type === 'hook'`
  // inside Minimalism. Other Minimalism types (big_number, quote...) fall
  // back to the normal flex-column flow with their own vAlign.
  const isMinimalismHook = isMinimalism && slide.type === 'hook';

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
    paddingLeft: isMinimalism ? '8%' : `${metrics.paddingLeft}px`,
    paddingRight: isMinimalism ? '8%' : `${metrics.paddingRight}px`,
    display: 'flex',
    flexDirection: 'column',
  };

  // Factory props bundle — identical for both positioning branches below.
  const factoryProps = {
    slide, slideIndex, totalSlides, format, scale, metrics,
    titleOverrides, bodyOverrides, editorOpen,
    onTitleTouchStart, onTitleTouchMove, onTitleTouchEnd, onTitleMouseDown, onTitleClick,
    onBodyTouchStart, onBodyTouchMove, onBodyTouchEnd, onBodyMouseDown, onBodyClick,
  } as const;

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

      {/* Background dot pattern (Minimalism template): tiny grey circles tiled across the whole slide.
          Renders BELOW the overlay layer so overlays still compose on top. Uses an inline SVG
          data-URI so density scales with `scale` (preview 20px tile, export 20×scale px tile). */}
      {!overlayOnly && slide.bgPattern === 'dots' && (() => {
        const tile = 20 * scale;
        // Fixed 20×20 SVG tile with a 1r circle at (10,10), fill #CCCCCC, opacity 0.35.
        // Matches the Minimalism Hook reference: sparse halftone covering the whole slide.
        const svg = encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'>" +
          "<circle cx='10' cy='10' r='1' fill='#CCCCCC' opacity='0.35'/></svg>"
        );
        return (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              zIndex: 1,
              backgroundImage: `url("data:image/svg+xml,${svg}")`,
              backgroundSize: `${tile}px ${tile}px`,
              backgroundRepeat: 'repeat',
              pointerEvents: 'none',
            }}
          />
        );
      })()}

      {/* Overlay pattern */}
      {!overlayOnly && <SlideOverlay type={slide.overlayType} opacity={slide.overlayOpacity} color={slide.overlayColor} scale={scale} />}

      {/* Декоративный астериск (Minimalism cover) — над overlay, под контентом.
          SVG живёт в TemplatesPanel.tsx/DecorShape (1-в-1 с claude.design эталоном). */}
      {!overlayOnly && slide.decorShape === 'asterisk' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: `${slide.decorTop ?? 6}%`,
            left: `${slide.decorLeft ?? 57}%`,
            width: `${slide.decorSize ?? 48}%`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <DecorShape color={slide.decorColor || '#D6E8F7'} />
        </div>
      )}

      {/* Content layer — pointer-events: none on wrapper so stickers (above) can be dragged anywhere.
          Interactive children re-enable pointer-events. */}
      <div className="relative z-10 flex flex-col h-full w-full" style={{ pointerEvents: 'none' }}>
        {/* Top bar.
            - Minimalism (isMinimalism): username слева, pill-counter справа в
              круглой 48px-плашке #F0F0F0 (без скобок [ ]).
            - Все остальные шаблоны: классический "[ N/M ]" справа. */}
        <div className="flex items-center justify-between w-full flex-shrink-0" style={{ marginBottom: `${4 * scale}px`, pointerEvents: 'auto' }}>
          {slide.showUsername !== false ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.usernameSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>{slide.username}</span>
          ) : <span />}
          {slide.showSlideCount !== false ? (
            isMinimalism ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${48 * scale}px`,
                  height: `${48 * scale}px`,
                  borderRadius: '50%',
                  background: '#F0F0F0',
                  color: '#0A0A0A',
                  fontSize: `${13 * scale}px`,
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1,
                }}
              >
                {slideIndex + 1}/{totalSlides}
              </span>
            ) : (
              <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.7)', fontSize: `${metrics.counterSize}px`, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>[ {slideIndex + 1}/{totalSlides} ]</span>
            )
          ) : <span />}
        </div>

        {/* Content area.
            - Minimalism Hook: spacer here; SlideFactory рендерится как absolute
              слой (см. ниже) с контентом, стартующим на top:58% слайда.
            - Все остальные: SlideFactory заполняет flex-1 слот, используя
              собственный vAlign. */}
        {isMinimalismHook ? (
          <div className="flex-1" />
        ) : (
          <SlideFactory {...factoryProps} />
        )}

        {/* Bottom bar — для Minimalism скрываем целиком (arrow/footer уводит
            фокус с заголовка, в референсе их нет). */}
        {!isMinimalism && (
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
        )}
      </div>

      {/* Minimalism Hook: content block positioned absolutely at top:58% of slide,
          with the same 8% side insets the root already applies for flex children. */}
      {isMinimalismHook && (
        <div
          className="absolute"
          style={{
            top: '58%',
            left: '8%',
            right: '8%',
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          <SlideFactory {...factoryProps} />
        </div>
      )}

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
