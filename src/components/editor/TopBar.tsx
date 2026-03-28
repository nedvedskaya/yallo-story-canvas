import { Download } from "lucide-react";

const TopBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-0">
        <div className="flex items-center justify-between px-5 py-3" style={{ background: 'hsla(50, 10%, 89%, 0.65)', backdropFilter: 'blur(60px) saturate(200%)', WebkitBackdropFilter: 'blur(60px) saturate(200%)' }}>
          <h1 className="tracking-tight text-lg font-thin text-muted-foreground">
            Яло
          </h1>
          <button className="btn-accent-shimmer flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-accent-foreground transition-transform active:scale-95 shadow-md">
            <Download size={16} />
            <span>Скачать</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
