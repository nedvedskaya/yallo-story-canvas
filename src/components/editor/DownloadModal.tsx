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

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  slideFormat: SlideFormat;
  activeSlide: number;
  onSlideChange: (index: number) => void;
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// Wait for all images inside an element to finish loading
async function waitForAssets(el: HTMLElement): Promise<void> {
  await document.fonts.ready;
  const imgs = el.querySelectorAll("img");
  const promises: Promise<void>[] = [];
  imgs.forEach(img => {
    if (!img.complete) {
      promises.push(new Promise(res => {
        img.onload = () => res();
        img.onerror = () => res();
      }));
    }
  });
  if (promises.length > 0) await Promise.all(promises);
  // Extra frame for layout stabilization
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}

// Capture a video frame as data URL
function captureVideoFrame(video: HTMLVideoElement): string {
  try {
    const c = document.createElement("canvas");
    c.width = video.videoWidth || video.clientWidth || 640;
    c.height = video.videoHeight || video.clientHeight || 360;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, c.width, c.height);
      return c.toDataURL("image/png");
    }
  } catch (e) {
    console.warn("Video frame capture failed", e);
  }
  return "";
}

// Record a video slide as WebM blob with text overlay and audio
async function recordVideoSlide(
  slide: Slide,
  exportWidth: number,
  exportHeight: number,
  slideEl: HTMLElement | null,
  onProgress: (text: string) => void,
): Promise<Blob | null> {
  return new Promise(async (resolve) => {
    try {
      onProgress("Подготовка видео...");

      // Create offscreen video
      const video = document.createElement("video");
      video.src = slide.bgVideo!;
      video.crossOrigin = "anonymous";
      video.playsInline = true;
      video.muted = false;

      await new Promise<void>((res, rej) => {
        video.onloadeddata = () => res();
        video.onerror = () => rej(new Error("Video load failed"));
        video.load();
      });

      const canvas = document.createElement("canvas");
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext("2d")!;

      // Build text overlay canvas from real DOM content layer
      let overlayCanvas: HTMLCanvasElement | null = null;
      if (slideEl) {
        const contentLayer = slideEl.querySelector(".z-10") as HTMLElement;
        if (contentLayer) {
          try {
            const elW = slideEl.offsetWidth;
            const scale = exportWidth / elW;
            overlayCanvas = await html2canvas(contentLayer, {
              scale,
              useCORS: true,
              allowTaint: true,
              backgroundColor: null,
              width: contentLayer.offsetWidth,
              height: contentLayer.offsetHeight,
              logging: false,
            });
          } catch (e) {
            console.warn("Overlay capture failed", e);
          }
        }
      }

      // Setup MediaRecorder
      const canvasStream = canvas.captureStream(30);

      // Try to get audio from video
      try {
        const audioVideo = document.createElement("video");
        audioVideo.src = slide.bgVideo!;
        audioVideo.crossOrigin = "anonymous";
        await new Promise<void>(res => { audioVideo.onloadeddata = () => res(); audioVideo.load(); });
        // @ts-ignore
        const audioStream = audioVideo.captureStream?.() as MediaStream | undefined;
        if (audioStream) {
          const audioTracks = audioStream.getAudioTracks();
          audioTracks.forEach(t => canvasStream.addTrack(t));
        }
        audioVideo.play().catch(() => {});
      } catch { /* no audio */ }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(canvasStream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: "video/webm" }));
      };

      const bgPosX = slide.bgPosX ?? 50;
      const bgPosY = slide.bgPosY ?? 50;
      const bgScale = slide.bgScale ?? 100;

      const drawFrame = () => {
        ctx.clearRect(0, 0, exportWidth, exportHeight);

        // Background color
        ctx.fillStyle = slide.bgColor.includes("gradient") ? "#333" : slide.bgColor;
        ctx.fillRect(0, 0, exportWidth, exportHeight);

        // Draw video frame (cover behavior)
        const vw = video.videoWidth || exportWidth;
        const vh = video.videoHeight || exportHeight;
        const videoAR = vw / vh;
        const canvasAR = exportWidth / exportHeight;
        let drawW: number, drawH: number;
        if (videoAR > canvasAR) {
          drawH = exportHeight;
          drawW = exportHeight * videoAR;
        } else {
          drawW = exportWidth;
          drawH = exportWidth / videoAR;
        }
        const scale = bgScale / 100;
        drawW *= scale;
        drawH *= scale;
        const dx = (bgPosX / 100) * exportWidth - drawW / 2;
        const dy = (bgPosY / 100) * exportHeight - drawH / 2;
        ctx.drawImage(video, dx, dy, drawW, drawH);

        // Darken overlay
        if (slide.bgDarken > 0) {
          ctx.fillStyle = `rgba(0,0,0,${slide.bgDarken / 100})`;
          ctx.fillRect(0, 0, exportWidth, exportHeight);
        }

        // Draw text overlay from captured content layer
        if (overlayCanvas) {
          ctx.drawImage(overlayCanvas, 0, 0, exportWidth, exportHeight);
        }
      };

      onProgress("Запись видео...");
      recorder.start();
      video.currentTime = 0;
      await video.play();

      const animate = () => {
        if (video.ended || video.paused) {
          recorder.stop();
          return;
        }
        drawFrame();
        requestAnimationFrame(animate);
      };
      animate();

      // Safety timeout - max 60 seconds
      setTimeout(() => {
        if (recorder.state === "recording") {
          video.pause();
          recorder.stop();
        }
      }, 60000);

    } catch (e) {
      console.error("Video recording failed:", e);
      resolve(null);
    }
  });
}

const DownloadModal = ({ open, onClose, slides, slideFormat, activeSlide, onSlideChange }: DownloadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"png" | "pdf" | "all" | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];
  const hasVideoSlides = slides.some(s => !!s.bgVideo);

  // Navigate to slide and wait for stabilization
  const prepareSlideCapture = useCallback(async (index: number) => {
    onSlideChange(index);
    await wait(400); // Wait for carousel animation
    await document.fonts.ready;
    const el = document.querySelector(`[data-slide-id="${slides[index].id}"]`) as HTMLElement;
    if (el) await waitForAssets(el);
    await wait(100); // Extra stabilization
    return el;
  }, [slides, onSlideChange]);

  // Capture a single slide element as canvas
  const captureSlideCanvas = useCallback(async (el: HTMLElement): Promise<HTMLCanvasElement> => {
    const elWidth = el.offsetWidth;
    const elHeight = el.offsetHeight;
    // Scale to match export resolution, cap at 4x for mobile stability
    const scale = Math.min(4, formatInfo.width / elWidth);

    return html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: elWidth,
      height: elHeight,
      logging: false,
      imageTimeout: 15000,
    });
  }, [formatInfo]);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    // Try link.click first
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // iOS fallback
    setTimeout(() => {
      try { window.open(url, "_blank"); } catch {}
    }, 500);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // Capture all slides as canvases (static frame for video slides)
  const captureAllSlides = useCallback(async (): Promise<HTMLCanvasElement[]> => {
    const canvases: HTMLCanvasElement[] = [];
    const total = slides.length;
    const savedSlide = activeSlide;

    for (let i = 0; i < total; i++) {
      setProgressText(`Подготовка слайда ${i + 1} из ${total}...`);
      setProgress(Math.round((i / total) * 80));

      const el = await prepareSlideCapture(i);
      if (!el) {
        console.warn(`Slide element not found: ${slides[i].id}`);
        continue;
      }

      // For video slides: temporarily swap video with frame image
      let videoEl: HTMLVideoElement | null = null;
      let tempImg: HTMLImageElement | null = null;
      const videoContainer = el.querySelector("video");
      if (videoContainer) {
        videoEl = videoContainer;
        videoEl.pause();
        const frameUrl = captureVideoFrame(videoEl);
        if (frameUrl) {
          tempImg = document.createElement("img");
          tempImg.src = frameUrl;
          // Copy exact computed styles
          const cs = window.getComputedStyle(videoEl);
          tempImg.style.position = cs.position;
          tempImg.style.left = cs.left;
          tempImg.style.top = cs.top;
          tempImg.style.width = cs.width;
          tempImg.style.height = cs.height;
          tempImg.style.transform = cs.transform;
          tempImg.style.transformOrigin = cs.transformOrigin;
          tempImg.style.minWidth = cs.minWidth;
          tempImg.style.minHeight = cs.minHeight;
          tempImg.style.objectFit = cs.objectFit as string;
          videoEl.parentElement?.insertBefore(tempImg, videoEl);
          videoEl.style.display = "none";
          await wait(50);
        }
      }

      try {
        const canvas = await captureSlideCanvas(el);
        canvases.push(canvas);
      } catch (e) {
        console.error(`html2canvas failed for slide ${i}:`, e);
      }

      // Restore video element
      if (videoEl && tempImg) {
        videoEl.style.display = "";
        tempImg.remove();
      }

      setProgress(Math.round(((i + 1) / total) * 80));
    }

    // Restore original slide
    onSlideChange(savedSlide);
    return canvases;
  }, [slides, activeSlide, onSlideChange, prepareSlideCapture, captureSlideCanvas]);

  const downloadPNG = async () => {
    setLoading(true);
    setLoadingType("png");
    setProgress(0);
    setProgressText("Начинаем экспорт...");
    try {
      const canvases = await captureAllSlides();
      if (canvases.length === 0) throw new Error("No slides captured");

      setProgressText("Упаковка в архив...");
      setProgress(85);
      const zip = new JSZip();
      for (let i = 0; i < canvases.length; i++) {
        const dataUrl = canvases[i].toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        zip.file(`slide-${i + 1}.png`, base64, { base64: true });
      }
      setProgress(95);
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");
      setProgress(100);
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
      const canvases = await captureAllSlides();
      if (canvases.length === 0) throw new Error("No slides captured");

      setProgressText("Создание PDF...");
      setProgress(85);
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

      setProgress(100);
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

  const downloadAll = async () => {
    setLoading(true);
    setLoadingType("all");
    setProgress(0);
    setProgressText("Начинаем экспорт...");
    try {
      const zip = new JSZip();
      const total = slides.length;
      const savedSlide = activeSlide;

      for (let i = 0; i < total; i++) {
        const slide = slides[i];
        setProgress(Math.round((i / total) * 90));

        if (slide.bgVideo) {
          // Video slide → navigate to it first to get the real DOM, then record
          setProgressText(`Подготовка видео-слайда ${i + 1} из ${total}...`);
          const el = await prepareSlideCapture(i);

          const blob = await recordVideoSlide(
            slide, formatInfo.width, formatInfo.height,
            el, setProgressText,
          );
          if (blob) {
            zip.file(`slide-${i + 1}.webm`, blob);
          } else {
            // Fallback: download original video
            try {
              const resp = await fetch(slide.bgVideo);
              const vidBlob = await resp.blob();
              zip.file(`slide-${i + 1}.mp4`, vidBlob);
            } catch {
              console.warn(`Could not fetch video for slide ${i + 1}`);
            }
          }
        } else {
          // Image/color slide → capture as PNG
          setProgressText(`Подготовка слайда ${i + 1} из ${total}...`);
          const el = await prepareSlideCapture(i);
          if (!el) continue;

          try {
            const canvas = await captureSlideCanvas(el);
            const dataUrl = canvas.toDataURL("image/png");
            const base64 = dataUrl.split(",")[1];
            zip.file(`slide-${i + 1}.png`, base64, { base64: true });
          } catch (e) {
            console.error(`Capture failed for slide ${i}:`, e);
          }
        }

        setProgress(Math.round(((i + 1) / total) * 90));
      }

      onSlideChange(savedSlide);
      setProgressText("Упаковка в архив...");
      setProgress(95);
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, "slides.zip");
      setProgress(100);
      toast({ title: "Готово!", description: `${total} слайдов сохранены (PNG + видео)` });
    } catch (e) {
      console.error("Export all error:", e);
      toast({ title: "Ошибка", description: "Не удалось сохранить файлы", variant: "destructive" });
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

            {loading && (
              <div className="px-4 pb-2">
                <p className="text-[11px] mb-1.5" style={{ color: "rgba(26,26,46,0.6)" }}>{progressText}</p>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
              {/* PNG */}
              <button
                onClick={downloadPNG}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)" }}
              >
                {loadingType === "png" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <Image size={18} style={{ color: "#1a1a2e" }} />}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить как PNG</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>{slides.length} {slides.length === 1 ? "изображение" : "изображений"} · {formatInfo.dimensions}</span>
                </div>
              </button>

              {/* PDF */}
              <button
                onClick={downloadPDF}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)" }}
              >
                {loadingType === "pdf" ? <Loader2 size={18} className="animate-spin" style={{ color: "#1a1a2e" }} /> : <FileText size={18} style={{ color: "#1a1a2e" }} />}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium" style={{ color: "#1a1a2e" }}>Сохранить как PDF</span>
                  <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.45)" }}>Все слайды в одном файле</span>
                </div>
              </button>

              {/* All (PNG + Video) */}
              {hasVideoSlides && (
                <button
                  onClick={downloadAll}
                  disabled={loading}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,200,220,0.5)" }}
                >
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
