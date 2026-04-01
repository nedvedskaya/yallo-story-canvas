import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, FileText, Film, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { Slide } from "./SlideCarousel";
import { FORMAT_OPTIONS, type SlideFormat } from "./SizePanel";
import SlideFrame from "./SlideFrame";
import { loadVideoFrame } from "./export-utils";
import type { Root } from "react-dom/client";

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  slideFormat: SlideFormat;
  activeSlide: number;
  onSlideChange: (index: number) => void;
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Detect best supported video MIME type */
function getSupportedVideoMime(): { mimeType: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates: Array<{ mime: string; ext: string }> = [
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mime)) return { mimeType: c.mime, ext: c.ext };
  }
  return null;
}

/** Render SlideFrame to an offscreen DOM node at native export resolution */
async function renderSlideToDOM(
  slide: Slide,
  format: SlideFormat,
  slideIndex: number,
  totalSlides: number,
  exportWidth: number,
  exportHeight: number,
  previewWidth: number,
  overlayOnly = false,
): Promise<{ container: HTMLDivElement; root: Root }> {
  const scale = exportWidth / previewWidth;

  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:-9999px;top:0;z-index:-1;pointer-events:none;width:${exportWidth}px;height:${exportHeight}px;`;
  document.body.appendChild(container);

  const root = createRoot(container);

  return new Promise((resolve) => {
    root.render(
      <SlideFrame
        slide={slide}
        slideIndex={slideIndex}
        totalSlides={totalSlides}
        format={format}
        scale={scale}
        width={exportWidth}
        height={exportHeight}
        overlayOnly={overlayOnly}
      />
    );

    requestAnimationFrame(() => requestAnimationFrame(async () => {
      await document.fonts.ready;

      const promises: Promise<void>[] = [];
      container.querySelectorAll("img").forEach(img => {
        if (!img.complete) {
          promises.push(new Promise(res => { img.onload = () => res(); img.onerror = () => res(); }));
        }
      });
      container.querySelectorAll("*").forEach(el => {
        const bg = (el as HTMLElement).style?.backgroundImage;
        if (bg && bg.startsWith('url(') && !bg.includes("data:image/svg")) {
          const match = bg.match(/url\(["']?(.+?)["']?\)/);
          if (match) {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            promises.push(new Promise(res => { img.onload = () => res(); img.onerror = () => res(); img.src = match[1]; }));
          }
        }
      });
      if (promises.length > 0) await Promise.all(promises);
      const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent);
      await wait(isMobileSafari ? 300 : 80);

      resolve({ container, root });
    }));
  });
}

function cleanupContainer(container: HTMLDivElement, root: Root) {
  try { root.unmount(); } catch {}
  try { document.body.removeChild(container); } catch {}
}

function getPreviewWidth(format: SlideFormat): number {
  switch (format) {
    case "stories": return 220;
    case "square": return 270;
    case "presentation": return 380;
    default: return 290;
  }
}

/** Mobile-friendly download using share API or fallback */
async function triggerDownload(blob: Blob, filename: string) {
  // Mobile: use navigator.share if available
  if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      const file = new File([blob], filename, { type: blob.type });
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      // User cancelled or share failed — fall through to download link
      console.log("Share cancelled, falling back to download link");
    }
  }
  // Fallback: download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** Record video slide with text overlay */
async function recordVideoSlide(
  slide: Slide,
  format: SlideFormat,
  formatInfo: (typeof FORMAT_OPTIONS)[0],
  slideIndex: number,
  totalSlides: number,
  previewWidth: number,
  onProgress: (text: string) => void,
): Promise<{ blob: Blob; ext: string } | null> {
  const supported = getSupportedVideoMime();
  if (!supported) {
    console.warn("MediaRecorder not supported");
    return null;
  }

  return new Promise(async (resolve) => {
    try {
      onProgress("Подготовка видео...");
      const ew = formatInfo.width, eh = formatInfo.height;

      const video = document.createElement("video");
      video.src = slide.bgVideo!;
      if (!slide.bgVideo!.startsWith("blob:")) video.crossOrigin = "anonymous";
      video.playsInline = true;
      video.muted = true; // muted for iOS autoplay policy
      await new Promise<void>((res, rej) => {
        video.onloadeddata = () => res();
        video.onerror = () => rej(new Error("Video load failed"));
        video.load();
      });

      // Build overlay using SlideFrame (overlay-only mode)
      const overlayResult = await renderSlideToDOM(slide, format, slideIndex, totalSlides, ew, eh, previewWidth, true);

      let overlayCanvas: HTMLCanvasElement | null = null;
      try {
        overlayCanvas = await html2canvas(overlayResult.container.firstElementChild as HTMLElement || overlayResult.container, {
          scale: 1, useCORS: true, allowTaint: true, backgroundColor: null,
          width: ew, height: eh, logging: false,
        });
      } catch (e) { console.warn("Overlay capture failed", e); }
      cleanupContainer(overlayResult.container, overlayResult.root);

      const canvas = document.createElement("canvas");
      canvas.width = ew; canvas.height = eh;
      const ctx = canvas.getContext("2d")!;

      const canvasStream = canvas.captureStream(30);

      // Try to capture audio (unmute for recording)
      try {
        video.muted = false;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
      } catch {
        video.muted = true; // fallback to muted if audio capture fails
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType: supported.mimeType,
        videoBitsPerSecond: 5_000_000,
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const resultBlob = new Blob(chunks, { type: supported.mimeType });
        resolve({ blob: resultBlob, ext: supported.ext });
      };

      const bgPosX = slide.bgPosX ?? 50, bgPosY = slide.bgPosY ?? 50, bgScale = slide.bgScale ?? 100;

      const drawFrame = () => {
        ctx.clearRect(0, 0, ew, eh);
        if (!slide.bgColor.includes("gradient")) { ctx.fillStyle = slide.bgColor; ctx.fillRect(0, 0, ew, eh); }
        else { ctx.fillStyle = "#333"; ctx.fillRect(0, 0, ew, eh); }

        const vw = video.videoWidth || ew, vh = video.videoHeight || eh;
        const vAR = vw / vh, cAR = ew / eh;
        let dw: number, dh: number;
        if (vAR > cAR) { dh = eh; dw = eh * vAR; } else { dw = ew; dh = ew / vAR; }
        const sc = bgScale / 100;
        dw *= sc; dh *= sc;
        const dx = (bgPosX / 100) * ew - dw / 2;
        const dy = (bgPosY / 100) * eh - dh / 2;
        ctx.drawImage(video, dx, dy, dw, dh);

        if (slide.bgDarken > 0) { ctx.fillStyle = `rgba(0,0,0,${slide.bgDarken / 100})`; ctx.fillRect(0, 0, ew, eh); }
        if (overlayCanvas) ctx.drawImage(overlayCanvas, 0, 0, ew, eh);
      };

      onProgress("Запись видео...");
      recorder.start();
      video.currentTime = 0;
      await video.play();

      const animate = () => {
        if (video.ended || video.paused) { recorder.stop(); return; }
        drawFrame();
        requestAnimationFrame(animate);
      };
      animate();

      setTimeout(() => { if (recorder.state === "recording") { video.pause(); recorder.stop(); } }, 60000);
    } catch (e) {
      console.error("Video recording failed:", e);
      resolve(null);
    }
  });
}

/** Download original video as fallback */
async function downloadOriginalVideo(videoSrc: string, filename: string) {
  try {
    const resp = await fetch(videoSrc);
    const blob = await resp.blob();
    triggerDownload(blob, filename);
    return true;
  } catch {
    return false;
  }
}

const DownloadModal = ({ open, onClose, slides, slideFormat }: DownloadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"png" | "pdf" | "all" | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];
  const hasVideoSlides = slides.some(s => !!s.bgVideo);

  const captureSlide = useCallback(async (slide: Slide, index: number): Promise<HTMLCanvasElement> => {
    const pw = getPreviewWidth(slideFormat);

    // For video slides, capture a frame and substitute as bgImage so html2canvas can render it
    let renderSlide = slide;
    if (slide.bgVideo) {
      const frameDataUrl = await loadVideoFrame(slide.bgVideo);
      if (frameDataUrl) {
        renderSlide = { ...slide, bgImage: frameDataUrl, bgVideo: undefined };
      }
    }

    // Render at 2× for antialiasing, then downscale
    const exportW = formatInfo.width;
    const exportH = formatInfo.height;
    const renderW = exportW * 2;
    const renderH = exportH * 2;

    const { container, root } = await renderSlideToDOM(renderSlide, slideFormat, index, slides.length, renderW, renderH, pw);

    const rawCanvas = await html2canvas(
      (container.firstElementChild as HTMLElement) || container,
      {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: renderW,
        height: renderH,
        logging: false,
        imageTimeout: 15000,
      }
    );

    cleanupContainer(container, root);

    // Downscale 2× → 1× for crisp antialiasing
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = exportW;
    finalCanvas.height = exportH;
    const ctx = finalCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(rawCanvas, 0, 0, exportW, exportH);

    return finalCanvas;
  }, [formatInfo, slides.length, slideFormat]);

  const downloadPNG = async () => {
    setLoading(true); setLoadingType("png"); setProgress(0); setProgressText("Начинаем экспорт...");
    try {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      const canShareFiles = isMobile && navigator.share && navigator.canShare;

      // Render all slides to canvas
      const canvases: HTMLCanvasElement[] = [];
      for (let i = 0; i < slides.length; i++) {
        setProgressText(`Обработка слайда ${i + 1} из ${slides.length}...`);
        setProgress(Math.round((i / slides.length) * 85));
        canvases.push(await captureSlide(slides[i], i));
      }

      if (canShareFiles) {
        // Mobile: share PNG files directly (saves to Photos/Gallery)
        setProgressText("Подготовка изображений...");
        const files: File[] = [];
        for (let i = 0; i < canvases.length; i++) {
          const blob = await new Promise<Blob>((res) =>
            canvases[i].toBlob(b => res(b!), "image/png")
          );
          files.push(new File([blob], `yalo-slide-${i + 1}.png`, { type: "image/png" }));
        }
        setProgress(95);
        try {
          if (navigator.canShare && navigator.canShare({ files })) {
            await navigator.share({ files });
            setProgress(100);
            toast({ title: "Готово!", description: `${slides.length} слайдов сохранены` });
            return;
          }
        } catch (shareErr: unknown) {
          const isCancel = shareErr instanceof Error && shareErr.name === 'AbortError';
          if (isCancel) return;
          console.log("Share failed, falling back to ZIP", shareErr);
        }
      }

      // Desktop or fallback: ZIP
      setProgressText("Упаковка..."); setProgress(90);
      const zip = new JSZip();
      for (let i = 0; i < canvases.length; i++) {
        zip.file(`slide-${i + 1}.png`, canvases[i].toDataURL("image/png").split(",")[1], { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");
      setProgress(100);
      toast({ title: "Готово!", description: `${slides.length} слайдов сохранены как PNG` });
    } catch (e) {
      console.error("PNG export error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить PNG", variant: "destructive" });
    } finally { setLoading(false); setLoadingType(null); setProgress(0); setProgressText(""); }
  };

  const downloadPDF = async () => {
    setLoading(true); setLoadingType("pdf"); setProgress(0); setProgressText("Начинаем экспорт...");
    try {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      const isLandscape = formatInfo.width > formatInfo.height;
      const pdf = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "px", format: [formatInfo.width, formatInfo.height] });
      for (let i = 0; i < slides.length; i++) {
        setProgressText(`Обработка слайда ${i + 1} из ${slides.length}...`);
        setProgress(Math.round((i / slides.length) * 85));
        if (i > 0) pdf.addPage([formatInfo.width, formatInfo.height], isLandscape ? "landscape" : "portrait");
        const canvas = await captureSlide(slides[i], i);
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, formatInfo.width, formatInfo.height);
      }
      setProgress(95);

      if (isMobile && navigator.share && navigator.canShare) {
        // Mobile: share PDF directly
        const pdfBlob = pdf.output("blob");
        const file = new File([pdfBlob], "slides.pdf", { type: "application/pdf" });
        try {
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
            setProgress(100);
            toast({ title: "Готово!", description: "Слайды сохранены как PDF" });
            return;
          }
        } catch (e) {
          console.log("PDF share cancelled, falling back to save", e);
        }
      }

      // Desktop or fallback
      pdf.save("slides.pdf");
      setProgress(100);
      toast({ title: "Готово!", description: "Слайды сохранены как PDF" });
    } catch (e) {
      console.error("PDF export error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить PDF", variant: "destructive" });
    } finally { setLoading(false); setLoadingType(null); setProgress(0); setProgressText(""); }
  };

  const downloadAll = async () => {
    setLoading(true); setLoadingType("all"); setProgress(0); setProgressText("Начинаем экспорт...");
    try {
      const pw = getPreviewWidth(slideFormat);
      const pngSlides: Array<{ index: number; data: string }> = [];
      const videoSlides: Array<{ index: number; blob: Blob; ext: string; hasOverlay: boolean }> = [];

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setProgress(Math.round((i / slides.length) * 85));

        if (slide.bgVideo) {
          setProgressText(`Обработка видео ${i + 1} из ${slides.length}...`);
          const result = await recordVideoSlide(slide, slideFormat, formatInfo, i, slides.length, pw, setProgressText);
          if (result) {
            videoSlides.push({ index: i, blob: result.blob, ext: result.ext, hasOverlay: true });
          } else {
          // Fallback: use original File if available, otherwise fetch blob URL
            try {
              let vidBlob: Blob;
              if (slide.bgVideoFile) {
                vidBlob = slide.bgVideoFile;
              } else {
                const resp = await fetch(slide.bgVideo);
                vidBlob = await resp.blob();
              }
              const origExt = (slide.bgVideoFile?.name || slide.bgVideo || "").includes(".webm") ? "webm" : "mp4";
              videoSlides.push({ index: i, blob: vidBlob, ext: origExt, hasOverlay: false });
              console.log(`Slide ${i + 1}: fallback to original video file`);
            } catch (err) {
              console.error(`Slide ${i + 1}: video fallback failed`, err);
              toast({ title: "Ошибка", description: `Не удалось сохранить видео слайда ${i + 1}`, variant: "destructive" });
            }
          }
        } else {
          setProgressText(`Обработка слайда ${i + 1} из ${slides.length}...`);
          const canvas = await captureSlide(slide, i);
          pngSlides.push({ index: i, data: canvas.toDataURL("image/png").split(",")[1] });
        }
      }

      setProgressText("Сохранение..."); setProgress(90);

      // Pack everything into a single ZIP
      const zip = new JSZip();
      pngSlides.forEach(s => zip.file(`slide-${s.index + 1}.png`, s.data, { base64: true }));
      videoSlides.forEach(vs => {
        zip.file(`slide-${vs.index + 1}.${vs.ext}`, vs.blob);
        if (!vs.hasOverlay) {
          toast({ title: "Внимание", description: `Видео слайда ${vs.index + 1} сохранено без текста (устройство не поддерживает запись)` });
        }
      });
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");

      setProgress(100);
      toast({ title: "Готово!", description: `${slides.length} слайдов сохранены` });
    } catch (e) {
      console.error("Export all error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить файлы", variant: "destructive" });
    } finally { setLoading(false); setLoadingType(null); setProgress(0); setProgressText(""); }
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

            {loading && (
              <div className="px-4 pb-2">
                <p className="text-[11px] mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>{progressText}</p>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
              <button onClick={downloadPNG} disabled={loading}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)" }}>
                {loadingType === "png" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <Image size={18} style={{ color: "#1a1a2e" }} />}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить как PNG</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>{slides.length} {slides.length === 1 ? "изображение" : "изображений"} · {formatInfo.dimensions}</span>
                </div>
              </button>

              <button onClick={downloadPDF} disabled={loading}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)" }}>
                {loadingType === "pdf" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <FileText size={18} style={{ color: "#1a1a2e" }} />}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить как PDF</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>Все слайды в одном файле</span>
                </div>
              </button>

              {hasVideoSlides && (
                <button onClick={downloadAll} disabled={loading}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)" }}>
                  {loadingType === "all" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <Film size={18} style={{ color: "#1a1a2e" }} />}
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить всё (PNG + видео)</span>
                    <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>Картинки и видео со звуком</span>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DownloadModal;
