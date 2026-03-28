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
        className="mx-auto max-w-md rounded-[2rem] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] font-sans border-0 shadow-xl bg-[sidebar-primary-foreground] bg-white"
        style={{
          background: 'linear-gradient(135deg, hsla(40, 12%, 88%, 0.55) 0%, hsla(45, 10%, 82%, 0.45) 50%, hsla(40, 8%, 86%, 0.55) 100%)',
          backdropFilter: 'blur(60px) saturate(200%)',
          WebkitBackdropFilter: 'blur(60px) saturate(200%)',
          border: '1px solid hsla(50, 15%, 95%, 0.45)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 hsla(50, 10%, 98%, 0.35)',
        }}
      >
        <div className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(isActive ? null : item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300 text-[#676f7e] shadow-none",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {/* Glow beam above active icon */}
                {isActive && (
                  <>
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-[#fbf5b7]"
                      style={{
                        boxShadow: '0 0 12px 4px rgba(255, 241, 182, 0.6), 0 0 24px 8px rgba(255, 241, 182, 0.3)',
                      }}
                    />
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 h-10 w-12 rounded-full"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(255, 241, 182, 0.35) 0%, transparent 70%)',
                      }}
                    />
                  </>
                )}
                <item.icon
                  size={22}
                  className={cn(
                    "relative z-10 transition-all duration-300 text-black",
                    isActive && "scale-110"
                  )}
                  style={isActive ? { color: '#FFF1B6', filter: 'drop-shadow(0 0 6px rgba(255, 241, 182, 0.5))' } : undefined}
                />
                <span
                  className={cn(
                    "relative z-10 text-[10px] transition-colors font-normal text-primary-foreground",
                    !isActive && "text-muted-foreground"
                  )}
                  style={isActive ? { color: '#FFF1B6' } : undefined}
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
