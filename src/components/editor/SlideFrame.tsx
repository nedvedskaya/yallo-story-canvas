/**
 * SlideFrame — unified slide renderer.
 * Used by SlideCarousel for preview and DownloadModal for export.
 */
import React from "react";
import SlideOverlay from "./SlideOverlay";
import StickerLayer from "./StickerLayer";
import SlideFactory from "./SlideFactory";
import { DecorShape, HalftoneDots } from "./TemplatesPanel";
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
  /** Пробрасывается в SlideFactory → layout для patch'а полей слайда
   *  (photo upload в Layout2 и т.п.). */
  onSlidePatch?: (patch: Partial<Slide>) => void;
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
  onSlidePatch,
  editorOpen, videoRefCallback, videoMuted = true, overlayOnly = false, dataSlideId,
  onUpdateSticker, onDeleteSticker, stickerInteractive = false,
  watermark,
}, ref) => {
  const metrics = getSlideMetrics(slide, format, scale);
  const isExport = !!(width && height);
  const mediaStyle = getMediaStyle(slide, undefined, isExport ? width : undefined, isExport ? height : undefined);

  // Minimalism style package: keyed off `slide.template === 'minimalism'` (independent
  // axis from layout `type` and from `bgPattern`). Drives the reference padding block
  // (top 56 / sides 80 on 1080×1350), pill-counter topbar, hidden bottom bar. Background
  // dot-pattern (`bgPattern: 'dots'`) is a SEPARATE flag — off by default for Minimalism,
  // user re-enables via the BG panel. Asterisk decor is also separate (`decorShape`).
  const isMinimalism = slide.template === 'minimalism';
  // До дизайнов от Ольги все 4 MinimalismLayout-файла идентичны (MinimalismBase):
  // рендерят title/body/highlight в flex-колонке с vAlign пользователя. Поэтому
  // layout-specific ветки (absolute top:48% для layout1, dark inversion для layout4)
  // из SlideFrame убраны — вернутся, когда Ольга пришлёт уникальные HTML для каждого
  // layout.

  // Reference-px paddings from Minimalism HTML (/Яло/carousel-slide-standalone-src.html):
  //   top: 56px, left/right: 80px on a 1080×1350 slide. We scale via renderScale so
  //   preview and export both land on pixel-perfect values at any container size.
  const minimalismPadTop = 56 * metrics.renderScale;
  const minimalismPadSide = 80 * metrics.renderScale;

  const rootStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    position: 'relative',
    overflow: 'hidden',
    background: overlayOnly ? 'transparent' : slide.bgColor,
    borderRadius: '0px',
    textAlign: H_ALIGN_TO_TEXT[slide.hAlign] as React.CSSProperties['textAlign'],
    paddingTop: isMinimalism ? `${minimalismPadTop}px` : `${metrics.paddingTop}px`,
    paddingBottom: `${metrics.paddingBottom}px`,
    paddingLeft: isMinimalism ? `${minimalismPadSide}px` : `${metrics.paddingLeft}px`,
    paddingRight: isMinimalism ? `${minimalismPadSide}px` : `${metrics.paddingRight}px`,
    display: 'flex',
    flexDirection: 'column',
  };

  // Factory props bundle — identical for both positioning branches below.
  const factoryProps = {
    slide, slideIndex, totalSlides, format, scale, metrics,
    titleOverrides, bodyOverrides, editorOpen,
    onTitleTouchStart, onTitleTouchMove, onTitleTouchEnd, onTitleMouseDown, onTitleClick,
    onBodyTouchStart, onBodyTouchMove, onBodyTouchEnd, onBodyMouseDown, onBodyClick,
    onSlidePatch,
  } as const;

  return (
    <div ref={ref} style={rootStyle} data-slide-id={dataSlideId}>
      {/* Background media */}
      {!overlayOnly && (slide.bgImage || slide.bgVideo) && (
        <div className="absolute inset-0 z-[1]" style={{ overflow: 'hidden', pointerEvents: 'none' }}>
          {slide.bgImage && (
            // div + background-image вместо <img objectFit:cover>: html2canvas 1.4.1
            // не умеет object-fit и растягивал бы <img> на width/height, ломая
            // aspect ratio в PNG/PDF. background-size:cover поддерживается корректно.
            // mediaStyle содержит позиционирование (position:absolute, top/left %,
            // width/height %), поэтому objectFit убираем и накладываем background-*.
            <div
              aria-hidden="true"
              style={{
                ...mediaStyle,
                backgroundImage: `url("${slide.bgImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
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
          SVG живёт в TemplatesPanel.tsx/DecorShape (1-в-1 с claude.design эталоном).
          Управление видимостью — через BG panel → «Декоративные элементы».
          Показываем ТОЛЬКО на layout 1 (hook/cover) — layouts 2/3/4 имеют
          собственные декоры внутри своих компонентов. Это защищает от
          наложения цветка поверх photo-блока Layout2 и halftone-облака Layout3. */}
      {/* Halftone-арка точек — декор Minimalism Layout 3 (по дефолту) и любого
          другого слайда, где пользователь включил тумблер в BG-панели.
          Позиционируется bottom-right квадрант; квадрат 65% от меньшей стороны
          слайда, съезжает на ~20% за границу (чтобы арка обрезалась снизу-справа
          — как на эталонном скриншоте). Кадрируется overflow:hidden SlideFrame. */}
      {!overlayOnly && slide.decorDots === 'halftone' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            // Раньше был right:-12%, bottom:-10% → самые крупные точки (корень
            // SVG 1100×1100 в bottom-right) ВЫЕЗЖАЛИ за рамку слайда и самая
            // плотная часть «облака» обрезалась — угол выглядел «голым».
            // Теперь прижимаем SVG к нижнему-правому углу слайда flush (right:0,
            // bottom:0), чтобы крупные точки попали точно в угол, а арка
            // веером раскрывалась вверх-влево. Ширина 80% (чуть больше, чем
            // было 78%), чтобы охватить больше площади.
            right: 0,
            bottom: 0,
            width: '80%',
            aspectRatio: '1 / 1',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <HalftoneDots color={slide.decorColor || slide.accentColor || '#D6E8F7'} />
        </div>
      )}

      {!overlayOnly && slide.decorShape === 'asterisk' && (!slide.layout || slide.layout === 1) && (
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
            <span
              style={{
                color: slide.metaColor || 'rgba(255,255,255,0.7)',
                // Minimalism: username Inter 400 24px (увеличено с 15 для лучшей читаемости
                // в редакторе и экспорте). Масштабируется через renderScale, чтобы визуально
                // совпадало в превью и экспорте. Другие шаблоны — metrics.usernameSize carousel-дефолт.
                fontSize: isMinimalism ? `${24 * metrics.renderScale}px` : `${metrics.usernameSize}px`,
                fontWeight: 400,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {slide.username}
            </span>
          ) : <span />}
          {slide.showSlideCount !== false ? (
            isMinimalism ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Pill-counter: круг 56×56 (увеличено с 48) с #F0F0F0 фоном, текст Inter 500 16px
                  // (увеличено с 13). renderScale = (previewW/exportW)*scale → точные пиксели.
                  width: `${56 * metrics.renderScale}px`,
                  height: `${56 * metrics.renderScale}px`,
                  borderRadius: '50%',
                  background: '#F0F0F0',
                  color: '#0A0A0A',
                  fontSize: `${16 * metrics.renderScale}px`,
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

        {/* Content area. SlideFactory заполняет flex-1 слот и сам распоряжается
            вертикальным выравниванием. Ветки для конкретных layouts (absolute
            top:48% для hero-эталона) вернутся, когда Ольга пришлёт дизайн для
            соответствующего layout. */}
        <SlideFactory {...factoryProps} />

        {/* Bottom bar — управляется флагами slide.showFooter/showArrow во всех
            шаблонах (включая Minimalism). Для Minimalism цвет footer/arrow
            берётся из slide.metaColor = #999999 по умолчанию шаблона. */}
        <div className="flex items-end justify-between w-full flex-shrink-0" style={{ pointerEvents: 'auto' }}>
          {slide.showFooter ? (
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.6)', fontSize: `${metrics.footerSize}px`, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>
              {slide.footerText || ""}
            </span>
          ) : <span />}
          {slide.showArrow ? (
            // Раньше был гейт `slideIndex < totalSlides - 1` — стрелка
            // автоматически скрывалась на последнем слайде. Убрал, потому что
            // пользователь ожидает: toggle ON → видно. На одном единственном
            // слайде это тоже работает, показывая что переключатель живой.
            <span style={{ color: slide.metaColor || 'rgba(255,255,255,0.5)', fontSize: `${(metrics.footerSize + 2 * scale)}px` }}>→</span>
          ) : <span />}
        </div>
      </div>

      {/* Место для absolute-слоёв конкретных layouts (например, hero-hook с
          top:48%). Будет заполнено по мере прихода дизайнов от Ольги. */}

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
