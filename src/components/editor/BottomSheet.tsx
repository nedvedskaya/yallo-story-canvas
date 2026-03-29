import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Image, Type, Maximize, Info } from "lucide-react";
import type { MenuId } from "./BottomMenu";
import type { Slide } from "./SlideCarousel";
import BackgroundPanel from "./BackgroundPanel";
import TextPanel from "./TextPanel";
import SizePanel, { type SlideFormat } from "./SizePanel";
import InfoPanel from "./InfoPanel";

interface BottomSheetProps {
  activeTab: MenuId | null;
  onClose: () => void;
  currentSlide?: Slide;
  onUpdateSlide?: (id: number, updates: Partial<Slide>) => void;
  onApplyBgToAll?: () => void;
  onApplyTextToAll?: () => void;
  onApplyInfoToAll?: () => void;
  slideFormat?: SlideFormat;
  onSlideFormatChange?: (format: SlideFormat) => void;
}

const sheetContent: Record<string, { title: string; icon: React.ElementType; items: string[] }> = {
  design: { title: "Шаблоны", icon: Palette, items: ["Минимализм", "Градиент", "Ретро", "Неон", "Пастель", "Тёмный"] },
};

const BottomSheet = ({ activeTab, onClose, currentSlide, onUpdateSlide, onApplyBgToAll, onApplyTextToAll, onApplyInfoToAll, slideFormat, onSlideFormatChange }: BottomSheetProps) => {
  const isBackground = activeTab === "background";
  const isText = activeTab === "text";
  const isSize = activeTab === "size";
  const isInfo = activeTab === "info";
  const isCustomPanel = isBackground || isText || isSize || isInfo;
  const content = activeTab && !isCustomPanel ? sheetContent[activeTab] : null;

  return (
    <AnimatePresence>
      {(content || isCustomPanel) && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(26, 26, 46, 0.05)' }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-4 left-2 right-2 z-40 overflow-hidden"
            style={{
              maxHeight: "45vh",
              background: 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.75)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            }}
          >
            <div className="flex items-center justify-between px-4 pb-1 pt-2">
              <div className="flex items-center gap-2">
                {isBackground ? (
                  <><Image size={18} style={{ color: 'rgba(26, 26, 46, 0.5)' }} /><h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Фон</h3></>
                ) : isText ? (
                  <><Type size={18} style={{ color: 'rgba(26, 26, 46, 0.5)' }} /><h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Текст</h3></>
                ) : isSize ? (
                  <><Maximize size={18} style={{ color: 'rgba(26, 26, 46, 0.5)' }} /><h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Размер</h3></>
                ) : isInfo ? (
                  <><Info size={18} style={{ color: 'rgba(26, 26, 46, 0.5)' }} /><h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Инфо</h3></>
                ) : content && (
                  <><content.icon size={18} style={{ color: 'rgba(26, 26, 46, 0.5)' }} /><h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>{content.title}</h3></>
                )}
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 transition-colors glass-pill" style={{ color: 'rgba(26, 26, 46, 0.5)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="px-4 pb-4 pt-1 overflow-y-auto" style={{ maxHeight: 'calc(45vh - 48px)' }}>
              {isInfo && currentSlide && onUpdateSlide ? (
                <InfoPanel
                  currentSlide={currentSlide}
                  onSave={(updates) => onUpdateSlide(currentSlide.id, updates)}
                  onApplyInfoToAll={() => onApplyInfoToAll?.()}
                />
              ) : isText && currentSlide && onUpdateSlide ? (
                <TextPanel
                  currentSlide={currentSlide}
                  onSave={(updates) => onUpdateSlide(currentSlide.id, updates)}
                  onApplyTextToAll={() => onApplyTextToAll?.()}
                />
              ) : isBackground && currentSlide && onUpdateSlide ? (
                <BackgroundPanel
                  bgColor={currentSlide.bgColor}
                  overlayType={currentSlide.overlayType}
                  overlayOpacity={currentSlide.overlayOpacity}
                  bgImage={currentSlide.bgImage}
                  bgVideo={currentSlide.bgVideo}
                  bgScale={currentSlide.bgScale}
                  bgPosX={currentSlide.bgPosX}
                  bgPosY={currentSlide.bgPosY}
                  bgDarken={currentSlide.bgDarken}
                  bgMuted={currentSlide.bgMuted}
                  onSave={(partial) => onUpdateSlide(currentSlide.id, partial)}
                  onApplyToAll={() => onApplyBgToAll?.()}
                />
              ) : isSize && slideFormat && onSlideFormatChange ? (
                <SizePanel
                  currentFormat={slideFormat}
                  onSave={onSlideFormatChange}
                />
              ) : content && (
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                  {content.items.map((item) => (
                    <button key={item} className="flex flex-col items-center gap-1.5 glass-pill p-3 text-xs transition-all active:scale-95 flex-shrink-0" style={{ color: '#1a1a2e', minWidth: '72px' }}>
                      <div className="h-8 w-8 rounded-lg" style={{ background: 'rgba(26, 26, 46, 0.06)' }} />
                      <span className="text-[10px]">{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
