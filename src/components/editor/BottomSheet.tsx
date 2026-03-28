import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Image, Type, Maximize, Info } from "lucide-react";
import type { MenuId } from "./BottomMenu";

interface BottomSheetProps {
  activeTab: MenuId | null;
  onClose: () => void;
}

const sheetContent: Record<string, { title: string; icon: React.ElementType; items: string[] }> = {
  design: {
    title: "Дизайн",
    icon: Palette,
    items: ["Минимализм", "Градиент", "Ретро", "Неон", "Пастель", "Тёмный"],
  },
  background: {
    title: "Фон",
    icon: Image,
    items: ["Белый", "Чёрный", "Градиент", "Фото", "Текстура", "Размытие"],
  },
  text: {
    title: "Текст",
    icon: Type,
    items: ["Заголовок", "Подзаголовок", "Основной", "Цитата", "Подпись", "Маркер"],
  },
  size: {
    title: "Размер",
    icon: Maximize,
    items: ["1:1 Пост", "4:5 Портрет", "9:16 Сторис", "16:9 Обложка"],
  },
  info: {
    title: "Инфо",
    icon: Info,
    items: ["Название проекта", "3 слайда", "Формат: карусель", "Статус: черновик"],
  },
};

const BottomSheet = ({ activeTab, onClose }: BottomSheetProps) => {
  const content = activeTab ? sheetContent[activeTab] : null;

  return (
    <AnimatePresence>
      {content && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/5"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-20 left-2 right-2 z-40 rounded-3xl glass-strong overflow-hidden"
            style={{ maxHeight: "50vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <content.icon size={18} className="text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">{content.title}</h3>
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground glass-pill">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pb-6 pt-2">
              {activeTab === "size" || activeTab === "info" ? (
                <div className="flex flex-col gap-2">
                  {content.items.map((item) => (
                    <button
                      key={item}
                      className="rounded-2xl glass-pill px-4 py-3 text-left text-sm text-foreground transition-all active:scale-[0.98]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {content.items.map((item) => (
                    <button
                      key={item}
                      className="flex flex-col items-center gap-2 rounded-2xl glass-pill p-4 text-xs text-foreground transition-all active:scale-95"
                    >
                      <div className="h-10 w-10 rounded-xl bg-muted-foreground/10" />
                      <span>{item}</span>
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
