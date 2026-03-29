import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, FileText, Film, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { Slide } from "./SlideCarousel";
import { FORMAT_OPTIONS, type SlideFormat } from "./SizePanel";
import {
  buildExportSlide,
  buildContentOverlay,
  waitForExportAssets,
  loadVideoFrame,
  getDefaultPreviewWidth,
} from "./export-utils";

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  slideFormat: SlideFormat;
  activeSlide: number;
  onSlideChange: (index: number) => void;
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/* ── Record a video slide as WebM with text overlay + audio ── */
async function recordVideoSlide(
  slide: Slide,
  formatInfo: (typeof FORMAT_OPTIONS)[0],
  slideIndex: number,
  totalSlides: number,
  previewWidth: number,
  onProgress: (text: string) => void,
): Promise<Blob | null> {
  return new Promise(async (resolve) => {
    try {
      onProgress("Подготовка видео...");
      const ew = formatInfo.width, eh = formatInfo.height;

      // Load video
      const video = document.createElement("video");
      video.src = slide.bgVideo!;
      video.crossOrigin = "anonymous";
      video.playsInline = true;
      video.muted = false;
      await new Promise<void>((res, rej) => { video.onloadeddata = () => res(); video.onerror = () => rej(new Error("Video load failed")); video.load(); });

      // Build text overlay at native resolution
      const overlayEl = buildContentOverlay(slide, formatInfo, slideIndex, totalSlides, previewWidth);
      overlayEl.style.cssText += "position:fixed;left:-9999px;top:0;pointer-events:none;";
      document.body.appendChild(overlayEl);
      await waitForExportAssets(overlayEl);

      let overlayCanvas: HTMLCanvasElement | null = null;
      try {
        overlayCanvas = await html2canvas(overlayEl, {
          scale: 1, useCORS: true, allowTaint: true, backgroundColor: null,
          width: ew, height: eh, logging: false,
        });
      } catch (e) { console.warn("Overlay capture failed", e); }
      document.body.removeChild(overlayEl);

      // Canvas for compositing
      const canvas = document.createElement("canvas");
      canvas.width = ew; canvas.height = eh;
      const ctx = canvas.getContext("2d")!;

      // MediaRecorder setup
      const canvasStream = canvas.captureStream(30);
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
      } catch { /* no audio */ }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";

      const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));

      const bgPosX = slide.bgPosX ?? 50, bgPosY = slide.bgPosY ?? 50, bgScale = slide.bgScale ?? 100;

      const drawFrame = () => {
        ctx.clearRect(0, 0, ew, eh);
        // Background color fill
        if (!slide.bgColor.includes("gradient")) { ctx.fillStyle = slide.bgColor; ctx.fillRect(0, 0, ew, eh); }
        else { ctx.fillStyle = "#333"; ctx.fillRect(0, 0, ew, eh); }

        // Draw video frame (cover)
        const vw = video.videoWidth || ew, vh = video.videoHeight || eh;
        const vAR = vw / vh, cAR = ew / eh;
        let dw: number, dh: number;
        if (vAR > cAR) { dh = eh; dw = eh * vAR; } else { dw = ew; dh = ew / vAR; }
        const sc = bgScale / 100;
        dw *= sc; dh *= sc;
        const dx = (bgPosX / 100) * ew - dw / 2;
        const dy = (bgPosY / 100) * eh - dh / 2;
        ctx.drawImage(video, dx, dy, dw, dh);

        // Darken
        if (slide.bgDarken > 0) { ctx.fillStyle = `rgba(0,0,0,${slide.bgDarken / 100})`; ctx.fillRect(0, 0, ew, eh); }

        // Text overlay
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
      toast({ title: "Ошибка видео", description: "Не удалось записать видео с оверлеем. Сохраняем оригинал.", variant: "destructive" });
      resolve(null);
    }
  });
}

/* ── DownloadModal ── */
const DownloadModal = ({ open, onClose, slides, slideFormat, activeSlide, onSlideChange }: DownloadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"png" | "pdf" | "all" | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];
  const hasVideoSlides = slides.some(s => !!s.bgVideo);

  // Read preview width from DOM or use default
  const getPreviewWidth = useCallback((): number => {
    const el = document.querySelector("[data-slide-id]") as HTMLElement;
    return el?.offsetWidth || getDefaultPreviewWidth(slideFormat);
  }, [slideFormat]);

  // Capture a single slide at native export resolution
  const captureSlide = useCallback(async (slide: Slide, index: number): Promise<HTMLCanvasElement> => {
    const pw = getPreviewWidth();

    let videoFrameUrl: string | undefined;
    if (slide.bgVideo) videoFrameUrl = await loadVideoFrame(slide.bgVideo);

    const exportEl = buildExportSlide(slide, formatInfo, index, slides.length, pw, videoFrameUrl);
    exportEl.style.cssText += "position:fixed;left:-9999px;top:0;pointer-events:none;z-index:-1;";
    document.body.appendChild(exportEl);

    await waitForExportAssets(exportEl);
    await wait(50); // extra stabilization

    const canvas = await html2canvas(exportEl, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: formatInfo.width,
      height: formatInfo.height,
      logging: false,
    });

    document.body.removeChild(exportEl);
    return canvas;
  }, [formatInfo, slides.length, getPreviewWidth]);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => { try { window.open(url, "_blank"); } catch {} }, 500);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  /* ── PNG export ── */
  const downloadPNG = async () => {
    setLoading(true); setLoadingType("png"); setProgress(0); setProgressText("Начинаем экспорт...");
    try {
      const zip = new JSZip();
      for (let i = 0; i < slides.length; i++) {
        setProgressText(`Обработка слайда ${i + 1} из ${slides.length}...`);
        setProgress(Math.round((i / slides.length) * 85));
        const canvas = await captureSlide(slides[i], i);
        const dataUrl = canvas.toDataURL("image/png");
        zip.file(`slide-${i + 1}.png`, dataUrl.split(",")[1], { base64: true });
      }
      setProgressText("Упаковка..."); setProgress(90);
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");
      setProgress(100);
      toast({ title: "Готово!", description: `${slides.length} слайдов сохранены как PNG` });
    } catch (e) {
      console.error("PNG export error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить PNG", variant: "destructive" });
    } finally { setLoading(false); setLoadingType(null); setProgress(0); setProgressText(""); }
  };

  /* ── PDF export ── */
  const downloadPDF = async () => {
    setLoading(true); setLoadingType("pdf"); setProgress(0); setProgressText("Начинаем экспорт...");
    try {
      const isLandscape = formatInfo.width > formatInfo.height;
      const pdf = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "px", format: [formatInfo.width, formatInfo.height] });

      for (let i = 0; i < slides.length; i++) {
        setProgressText(`Обработка слайда ${i + 1} из ${slides.length}...`);
        setProgress(Math.round((i / slides.length) * 85));
        if (i > 0) pdf.addPage([formatInfo.width, formatInfo.height], isLandscape ? "landscape" : "portrait");
        const canvas = await captureSlide(slides[i], i);
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, formatInfo.width, formatInfo.height);
      }
      setProgress(100);
      pdf.save("slides.pdf");
      toast({ title: "Готово!", description: "Слайды сохранены как PDF" });
    } catch (e) {
      console.error("PDF export error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить PDF", variant: "destructive" });
    } finally { setLoading(false); setLoadingType(null); setProgress(0); setProgressText(""); }
  };

  /* ── Save All (PNG + Video) ── */
  const downloadAll = async () => {
    setLoading(true); setLoadingType("all"); setProgress(0); setProgressText("Начинаем экспорт...");
    try {
      const zip = new JSZip();
      const pw = getPreviewWidth();

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setProgress(Math.round((i / slides.length) * 90));

        if (slide.bgVideo) {
          setProgressText(`Обработка видео ${i + 1} из ${slides.length}...`);
          const blob = await recordVideoSlide(slide, formatInfo, i, slides.length, pw, setProgressText);
          if (blob) {
            zip.file(`slide-${i + 1}.webm`, blob);
          } else {
            // Fallback: save original video
            try {
              const resp = await fetch(slide.bgVideo);
              const vidBlob = await resp.blob();
              zip.file(`slide-${i + 1}-original.mp4`, vidBlob);
            } catch { console.warn(`Could not fetch video for slide ${i + 1}`); }
            toast({ title: "Внимание", description: `Видео слайда ${i + 1} сохранено без текстового оверлея` });
          }
        } else {
          setProgressText(`Обработка слайда ${i + 1} из ${slides.length}...`);
          const canvas = await captureSlide(slide, i);
          zip.file(`slide-${i + 1}.png`, canvas.toDataURL("image/png").split(",")[1], { base64: true });
        }
        setProgress(Math.round(((i + 1) / slides.length) * 90));
      }

      setProgressText("Упаковка..."); setProgress(95);
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");
      setProgress(100);
      toast({ title: "Готово!", description: `${slides.length} слайдов сохранены (PNG + видео)` });
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
