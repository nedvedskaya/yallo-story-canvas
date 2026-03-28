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
      <div className="glass-pill mx-auto max-w-md rounded-[2rem] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(isActive ? null : item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {/* Glow behind active icon */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-primary/60 blur-lg" />
                )}
                <item.icon
                  size={22}
                  className={cn(
                    "relative z-10 transition-all duration-300",
                    isActive && "text-foreground scale-110"
                  )}
                />
                <span className={cn(
                  "relative z-10 text-[10px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
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
