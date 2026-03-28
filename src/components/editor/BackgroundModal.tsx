import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type BgTab = "color" | "photo" | "video";

const colorPresets = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "#1a1a2e",
  "#f5f5f5",
  "#2d3436",
];

interface BackgroundModalProps {
  open: boolean;
  onClose: () => void;
  onSelectColor: (bg: string) => void;
  onSelectType: (type: "color" | "photo" | "video") => void;
}

const BackgroundModal = ({ open, onClose, onSelectColor, onSelectType }: BackgroundModalProps) => {
  const [tab, setTab] = useState<BgTab>("color");

  const tabs: { id: BgTab; label: string }[] = [
    { id: "color", label: "Цвет" },
    { id: "photo", label: "Фото" },
    { id: "video", label: "Видео" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(26, 26, 46, 0.1)" }}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md"
            style={{
              background: "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.75)",
              borderRadius: "20px",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-base font-semibold" style={{ color: "#1a1a2e" }}>
                Фон
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 transition-colors glass-pill"
                style={{ color: "rgba(26, 26, 46, 0.5)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pb-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    onSelectType(t.id);
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-medium transition-all",
                  )}
                  style={{
                    background: tab === t.id ? "rgba(255, 255, 255, 0.7)" : "transparent",
                    color: tab === t.id ? "#1a1a2e" : "rgba(26, 26, 46, 0.45)",
                    boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
              {tab === "color" && (
                <div className="grid grid-cols-3 gap-3">
                  {colorPresets.map((bg, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectColor(bg)}
                      className="h-16 rounded-xl transition-all active:scale-95"
                      style={{
                        background: bg,
                        border: "1.5px solid rgba(200, 200, 220, 0.4)",
                      }}
                    />
                  ))}
                </div>
              )}
              {tab === "photo" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <p className="text-sm" style={{ color: "rgba(26, 26, 46, 0.5)" }}>
                    Загрузка фото — скоро
                  </p>
                </div>
              )}
              {tab === "video" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <p className="text-sm" style={{ color: "rgba(26, 26, 46, 0.5)" }}>
                    Загрузка видео — скоро
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BackgroundModal;
