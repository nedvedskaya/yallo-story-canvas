interface Tab {
  id: string;
  label: string;
}

interface GlassTabBarProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

const GlassTabBar = ({ tabs, activeId, onChange }: GlassTabBarProps) => (
  <div className="flex gap-1">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className="flex-1 rounded-lg py-1.5 text-[11px] font-medium"
        style={{
          background: activeId === t.id ? "rgba(255,255,255,0.7)" : "transparent",
          color: activeId === t.id ? "#1a1a2e" : "rgba(26,26,46,0.45)",
          boxShadow: activeId === t.id ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default GlassTabBar;
