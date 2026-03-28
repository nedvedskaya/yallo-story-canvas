import { Download } from "lucide-react";

interface TopBarProps {
  onDownload?: () => void;
}

const TopBar = ({ onDownload }: TopBarProps) => {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <h1 className="tracking-tight text-lg font-extralight" style={{ color: '#1a1a2e' }}>
        Яло
      </h1>
      <button
        onClick={onDownload}
        className="btn-accent-shimmer flex items-center gap-2 px-4 py-2 text-sm font-medium transition-transform active:scale-95"
      >
        <Download size={16} />
        <span>Скачать</span>
      </button>
    </div>
  );
};

export default TopBar;
