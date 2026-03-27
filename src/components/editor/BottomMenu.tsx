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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(isActive ? null : item.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all",
                isActive
                  ? "bg-primary/20 text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  "transition-colors",
                  isActive && "text-foreground drop-shadow-[0_0_8px_hsl(47,100%,85%)]"
                )}
              />
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomMenu;
export type { MenuId };
