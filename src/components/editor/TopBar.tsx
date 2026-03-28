import { Download } from "lucide-react";

const TopBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong mx-0">
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Яло
          </h1>
          <button className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-transform active:scale-95">
            <Download size={16} />
            <span>Скачать</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
