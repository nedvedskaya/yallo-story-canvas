import { Palette, Image, Type, Maximize, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "design", icon: Palette, label: "Дизайн" },
  { id: "background", icon: Image, label: "Фон" },
  { id: "text", icon: Type, label: "Текст" },
  { id: "size", icon: Maximize, label: "Размер" },
  { id: "info", icon: Info, label: "Инфо" },
] as const;

type MenuId = (typeof menuItems)[number]["id"];

interface BottomMenuProps {
  activeTab: MenuId | null;
  onTabChange: (tab: MenuId | null) => void;
}

const BottomMenu = ({ activeTab, onTabChange }: BottomMenuProps) => {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className="mx-auto max-w-md rounded-[2rem] px-2 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] font-sans"
        style={{
          background: 'rgba(255, 220, 225, 0.35)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255, 255, 255, 0.75)',
          borderRadius: '32px',
          boxShadow: '0 8px 32px rgba(255, 180, 190, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(isActive ? null : item.id)}
                className="relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300"
              >
                {isActive && (
                  <div
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full"
                    style={{ background: '#D4748A' }}
                  />
                )}
                <item.icon
                  size={22}
                  className={cn(
                    "relative z-10 transition-all duration-300",
                    isActive && "scale-110"
                  )}
                  style={{ color: isActive ? '#D4748A' : 'rgba(180, 100, 110, 0.6)' }}
                />
                <span
                  className="relative z-10 text-[10px] transition-colors font-normal"
                  style={{ color: isActive ? '#D4748A' : 'rgba(180, 100, 110, 0.6)' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomMenu;
export type { MenuId };
