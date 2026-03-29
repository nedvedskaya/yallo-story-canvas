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

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  slideFormat: SlideFormat;
}

const DownloadModal = ({ open, onClose, slides, slideFormat }: DownloadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"png" | "pdf" | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];

  const captureSlides = async (): Promise<HTMLCanvasElement[]> => {
    const canvases: HTMLCanvasElement[] = [];
    const slideElements = document.querySelectorAll<HTMLElement>("[data-slide-id]");
    const total = slideElements.length;

    for (let i = 0; i < total; i++) {
      const el = slideElements[i];
      setProgressText(`Подготовка слайда ${i + 1} из ${total}...`);
      setProgress(Math.round(((i) / total) * 100));

      // For video elements, pause and draw current frame to canvas
      const videos = el.querySelectorAll('video');
      const videoCanvases: { video: HTMLVideoElement; canvas: HTMLCanvasElement; parent: HTMLElement }[] = [];
      
      for (const video of Array.from(videos)) {
        try {
          video.pause();
          const vc = document.createElement('canvas');
          vc.width = video.videoWidth || video.clientWidth;
          vc.height = video.videoHeight || video.clientHeight;
          const ctx = vc.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, vc.width, vc.height);
          }
          // Replace video with canvas image temporarily
          const img = document.createElement('img');
          img.src = vc.toDataURL('image/png');
          img.style.cssText = video.style.cssText;
          img.style.position = video.style.position;
          img.style.objectFit = video.style.objectFit || 'cover';
          const parent = video.parentElement;
          if (parent) {
            parent.insertBefore(img, video);
            video.style.display = 'none';
            videoCanvases.push({ video, canvas: vc, parent });
          }
        } catch (e) {
          console.warn('Video frame capture failed:', e);
        }
      }

      const scale = Math.max(2, formatInfo.width / el.offsetWidth);
      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
      canvases.push(canvas);

      // Restore videos
      for (const { video, parent } of videoCanvases) {
        video.style.display = '';
        const tempImg = parent.querySelector('img[src^="data:image/png"]');
        if (tempImg) parent.removeChild(tempImg);
        video.play().catch(() => {});
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }
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
    
    // Fallback for iOS
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const downloadPNG = async () => {
    setLoading(true);
    setLoadingType("png");
    setProgress(0);
    setProgressText("Начинаем экспорт...");
    try {
      const canvases = await captureSlides();
      
      if (canvases.length === 1) {
        // Single slide — download as PNG directly
        setProgressText("Сохранение...");
        canvases[0].toBlob((blob) => {
          if (blob) {
            triggerDownload(blob, "slide.png");
            toast({ title: "Готово!", description: "Слайд сохранён как PNG" });
          }
        }, "image/png");
      } else {
        // Multiple slides — ZIP
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
      }
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
