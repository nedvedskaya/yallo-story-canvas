import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, FileText, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

  const formatInfo = FORMAT_OPTIONS.find(f => f.id === slideFormat) || FORMAT_OPTIONS[0];

  const captureSlides = async (): Promise<HTMLCanvasElement[]> => {
    const canvases: HTMLCanvasElement[] = [];
    const slideElements = document.querySelectorAll<HTMLElement>("[data-slide-id]");

    for (const el of Array.from(slideElements)) {
      const canvas = await html2canvas(el, {
        scale: formatInfo.width / el.offsetWidth,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
      canvases.push(canvas);
    }
    return canvases;
  };

  const downloadPNG = async () => {
    setLoading(true);
    setLoadingType("png");
    try {
      const canvases = await captureSlides();
      canvases.forEach((canvas, i) => {
        const link = document.createElement("a");
        link.download = `slide-${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    } catch (e) {
      console.error("PNG export error:", e);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    setLoadingType("pdf");
    try {
      const canvases = await captureSlides();
      if (canvases.length === 0) return;

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
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setLoading(false);
      setLoadingType(null);
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
