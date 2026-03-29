import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, FileText, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { Slide } from "./SlideCarousel";
import { FORMAT_OPTIONS, type SlideFormat } from "./SizePanel";
import { FORMAT_TEXT_DEFAULTS } from "./shared-styles";

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  slideFormat: SlideFormat;
}

// Build an off-screen DOM element that replicates the slide at export resolution
function renderSlideToDOM(
  slide: Slide,
  width: number,
  height: number,
  slideIndex: number,
  totalSlides: number,
  format: SlideFormat,
): HTMLDivElement {
  const fmt = FORMAT_TEXT_DEFAULTS[format];
  // We need to scale font sizes from the small preview to the real export size.
  // Preview width is roughly 300px for carousel. Export is 1080px. Scale = ~3.6x.
  // But the FORMAT_TEXT_DEFAULTS are already tuned for the small preview.
  // We scale proportionally: exportWidth / typicalPreviewWidth
  const previewWidth = format === "presentation" ? 420 : format === "stories" ? 240 : format === "square" ? 300 : 320;
  const scale = width / previewWidth;

  const padding = fmt.padding * scale;
  const titleSize = (slide.titleSize ?? fmt.titleSize) * scale;
  const bodySize = (slide.bodySize ?? fmt.bodySize) * scale;
  const usernameSize = fmt.usernameSize * scale;
  const footerSize = fmt.footerSize * scale;

  const hAlignMap: Record<string, string> = { left: "left", center: "center", right: "right" };
  const vAlignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end" };
  const textAlign = hAlignMap[slide.hAlign] || "left";
  const justifyContent = vAlignMap[slide.vAlign] || "flex-start";

  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px; height: ${height}px; position: relative; overflow: hidden;
    background: ${slide.bgColor}; padding: ${padding}px;
    display: flex; flex-direction: column; text-align: ${textAlign};
    font-family: sans-serif; box-sizing: border-box;
  `;

  // Background image
  if (slide.bgImage) {
    const bgPosX = slide.bgPosX ?? 50;
    const bgPosY = slide.bgPosY ?? 50;
    const bgScale = slide.bgScale ?? 100;
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = slide.bgImage;
    img.style.cssText = `
      position: absolute; left: ${bgPosX}%; top: ${bgPosY}%;
      transform: translate(-50%, -50%) scale(${bgScale / 100});
      transform-origin: center center;
      min-width: 100%; min-height: 100%; object-fit: contain;
      z-index: 1;
    `;
    container.appendChild(img);
    if (slide.bgDarken > 0) {
      const darken = document.createElement("div");
      darken.style.cssText = `position: absolute; inset: 0; background: rgba(0,0,0,${slide.bgDarken / 100}); z-index: 2; pointer-events: none;`;
      container.appendChild(darken);
    }
  }

  // Background video frame — will be replaced with captured frame image
  if (slide.bgVideo) {
    // We'll handle this by finding the video element and drawing its frame
    const bgPosX = slide.bgPosX ?? 50;
    const bgPosY = slide.bgPosY ?? 50;
    const bgScale = slide.bgScale ?? 100;
    
    // Try to capture current video frame from the page
    const videoEls = document.querySelectorAll<HTMLVideoElement>('video');
    let frameDataUrl = '';
    for (const v of Array.from(videoEls)) {
      if (v.src === slide.bgVideo || v.currentSrc === slide.bgVideo) {
        try {
          v.pause();
          const vc = document.createElement('canvas');
          vc.width = v.videoWidth || v.clientWidth || 640;
          vc.height = v.videoHeight || v.clientHeight || 360;
          const ctx = vc.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, vc.width, vc.height);
            frameDataUrl = vc.toDataURL('image/png');
          }
        } catch (e) { console.warn('Video capture failed', e); }
        break;
      }
    }

    if (frameDataUrl) {
      const img = document.createElement("img");
      img.src = frameDataUrl;
      img.style.cssText = `
        position: absolute; left: ${bgPosX}%; top: ${bgPosY}%;
        transform: translate(-50%, -50%) scale(${bgScale / 100});
        transform-origin: center center;
        min-width: 100%; min-height: 100%; object-fit: cover;
        z-index: 1;
      `;
      container.appendChild(img);
    }
    if (slide.bgDarken > 0) {
      const darken = document.createElement("div");
      darken.style.cssText = `position: absolute; inset: 0; background: rgba(0,0,0,${slide.bgDarken / 100}); z-index: 2; pointer-events: none;`;
      container.appendChild(darken);
    }
  }

  // Content layer
  const content = document.createElement("div");
  content.style.cssText = `position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%; width: 100%;`;

  // Top bar: username + slide count
  const topBar = document.createElement("div");
  topBar.style.cssText = `display: flex; align-items: center; justify-content: space-between; width: 100%; flex-shrink: 0; margin-bottom: ${8 * scale / 3}px;`;
  
  if (slide.showUsername !== false) {
    const un = document.createElement("span");
    un.textContent = slide.username || "@username";
    un.style.cssText = `color: rgba(255,255,255,0.7); font-size: ${usernameSize}px; font-weight: 400;`;
    topBar.appendChild(un);
  } else {
    topBar.appendChild(document.createElement("span"));
  }

  if (slide.showSlideCount !== false) {
    const sc = document.createElement("span");
    sc.textContent = `${slideIndex + 1}/${totalSlides}`;
    sc.style.cssText = `color: rgba(255,255,255,0.7); font-size: ${usernameSize}px; font-weight: 400;`;
    topBar.appendChild(sc);
  } else {
    topBar.appendChild(document.createElement("span"));
  }
  content.appendChild(topBar);

  // Content area with vAlign
  const contentArea = document.createElement("div");
  contentArea.style.cssText = `display: flex; flex-direction: column; flex: 1; min-height: 0; justify-content: ${justifyContent};`;

  const textWrap = document.createElement("div");

  // Title
  const titleWrap = document.createElement("div");
  const titleOffsetX = (slide.titleOffsetX ?? 0) * scale;
  const titleOffsetY = (slide.titleOffsetY ?? 0) * scale;
  const titleScale2 = slide.titleScale ?? 1;
  titleWrap.style.cssText = `transform: translate(${titleOffsetX}px, ${titleOffsetY}px) scale(${titleScale2}); transform-origin: center center;`;

  const titleEl = document.createElement("h2");
  titleEl.innerHTML = slide.title;
  const titleCase = slide.titleCase === 'uppercase' ? 'uppercase' : slide.titleCase === 'lowercase' ? 'lowercase' : 'none';
  titleEl.style.cssText = `
    color: #ffffff; font-size: ${titleSize}px; font-weight: 700; margin: 0;
    font-family: ${slide.titleFont ? `'${slide.titleFont}', ` : ''}'Inter', sans-serif;
    text-transform: ${titleCase};
    line-height: ${slide.titleLineHeight ?? 1.1};
    letter-spacing: ${(slide.titleLetterSpacing ?? 0) * scale}px;
  `;
  titleWrap.appendChild(titleEl);
  textWrap.appendChild(titleWrap);

  // Body
  const bodyWrap = document.createElement("div");
  const bodyOffsetX = (slide.bodyOffsetX ?? 0) * scale;
  const bodyOffsetY = (slide.bodyOffsetY ?? 0) * scale;
  const bodyScale2 = slide.bodyScale ?? 1;
  bodyWrap.style.cssText = `transform: translate(${bodyOffsetX}px, ${bodyOffsetY}px) scale(${bodyScale2}); transform-origin: center center;`;

  const bodyEl = document.createElement("p");
  bodyEl.innerHTML = slide.body;
  const bodyCase = slide.bodyCase === 'uppercase' ? 'uppercase' : slide.bodyCase === 'lowercase' ? 'lowercase' : 'none';
  bodyEl.style.cssText = `
    color: rgba(255,255,255,0.85); font-size: ${bodySize}px; font-weight: 400;
    margin: ${12 * scale / 3}px 0 0 0;
    font-family: ${slide.bodyFont ? `'${slide.bodyFont}', ` : ''}'Inter', sans-serif;
    text-transform: ${bodyCase};
    line-height: ${slide.bodyLineHeight ?? 1.5};
    letter-spacing: ${(slide.bodyLetterSpacing ?? 0) * scale}px;
  `;
  bodyWrap.appendChild(bodyEl);
  textWrap.appendChild(bodyWrap);

  contentArea.appendChild(textWrap);
  content.appendChild(contentArea);

  // Bottom bar: footer + arrow
  const bottomBar = document.createElement("div");
  bottomBar.style.cssText = `display: flex; align-items: flex-end; justify-content: space-between; width: 100%; flex-shrink: 0;`;

  if (slide.showFooter) {
    const ft = document.createElement("span");
    ft.textContent = slide.footerText || "";
    ft.style.cssText = `color: rgba(255,255,255,0.6); font-size: ${footerSize}px; font-weight: 400;`;
    bottomBar.appendChild(ft);
  } else {
    bottomBar.appendChild(document.createElement("span"));
  }

  if (slide.showArrow !== false && slideIndex < totalSlides - 1) {
    const arrow = document.createElement("span");
    arrow.textContent = "→";
    arrow.style.cssText = `color: rgba(255,255,255,0.5); font-size: ${footerSize + 2 * scale / 3}px;`;
    bottomBar.appendChild(arrow);
  } else {
    bottomBar.appendChild(document.createElement("span"));
  }

  content.appendChild(bottomBar);
  container.appendChild(content);

  return container;
}

const DownloadModal = ({ open, onClose, slides, slideFormat }: DownloadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"png" | "pdf" | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];

  const captureSlides = async (): Promise<HTMLCanvasElement[]> => {
    const canvases: HTMLCanvasElement[] = [];
    const total = slides.length;

    // Create off-screen host
    const host = document.createElement("div");
    host.style.cssText = "position: fixed; left: -9999px; top: 0; z-index: -1; pointer-events: none;";
    document.body.appendChild(host);

    for (let i = 0; i < total; i++) {
      setProgressText(`Подготовка слайда ${i + 1} из ${total}...`);
      setProgress(Math.round((i / total) * 100));

      const slideEl = renderSlideToDOM(slides[i], formatInfo.width, formatInfo.height, i, total, slideFormat);
      host.appendChild(slideEl);

      // Wait for images to load
      const images = slideEl.querySelectorAll("img");
      await Promise.all(Array.from(images).map(img => 
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      ));

      // Small delay for layout
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(slideEl, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: formatInfo.width,
        height: formatInfo.height,
      });
      canvases.push(canvas);

      host.removeChild(slideEl);
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    document.body.removeChild(host);
    return canvases;
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fallback for iOS — if click didn't work, try opening
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 3000);
  };

  const downloadPNG = async () => {
    setLoading(true);
    setLoadingType("png");
    setProgress(0);
    setProgressText("Начинаем экспорт...");
    try {
      const canvases = await captureSlides();
      
      setProgressText("Упаковка в архив...");
      const zip = new JSZip();
      for (let i = 0; i < canvases.length; i++) {
        const dataUrl = canvases[i].toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        zip.file(`slide-${i + 1}.png`, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");
      toast({ title: "Готово!", description: `${canvases.length} слайдов сохранены как PNG` });
    } catch (e) {
      console.error("PNG export error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить PNG", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingType(null);
      setProgress(0);
      setProgressText("");
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    setLoadingType("pdf");
    setProgress(0);
    setProgressText("Начинаем экспорт...");
    try {
      const canvases = await captureSlides();
      if (canvases.length === 0) return;

      setProgressText("Создание PDF...");
      const isLandscape = formatInfo.width > formatInfo.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "px",
        format: [formatInfo.width, formatInfo.height],
      });

      canvases.forEach((canvas, i) => {
        if (i > 0) pdf.addPage([formatInfo.width, formatInfo.height], isLandscape ? "landscape" : "portrait");
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, formatInfo.width, formatInfo.height);
      });

      pdf.save("slides.pdf");
      toast({ title: "Готово!", description: "Слайды сохранены как PDF" });
    } catch (e) {
      console.error("PDF export error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить PDF", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingType(null);
      setProgress(0);
      setProgressText("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(26,26,46,0.3)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-[320px]"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: "20px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <h3 className="text-base font-semibold" style={{ color: "#1a1a2e" }}>Скачать</h3>
              <button onClick={onClose} className="rounded-full p-1.5 transition-colors" style={{ color: "rgba(26,26,46,0.5)" }}>
                <X size={16} />
              </button>
            </div>

            {/* Progress bar */}
            {loading && (
              <div className="px-4 pb-2">
                <p className="text-[11px] mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>{progressText}</p>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
              <button
                onClick={downloadPNG}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(200,200,220,0.5)",
                }}
              >
                {loadingType === "png" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <Image size={18} style={{ color: "#1a1a2e" }} />}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить как PNG</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>{slides.length} {slides.length === 1 ? "изображение" : "изображений"} · {formatInfo.dimensions}</span>
                </div>
              </button>

              <button
                onClick={downloadPDF}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(200,200,220,0.5)",
                }}
              >
                {loadingType === "pdf" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <FileText size={18} style={{ color: "#1a1a2e" }} />}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить как PDF</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>Все слайды в одном файле</span>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DownloadModal;
