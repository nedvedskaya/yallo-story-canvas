import { Download, Undo2, Redo2 } from "lucide-react";

interface TopBarProps {
  onDownload?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const TopBar = ({ onDownload, onUndo, onRedo, canUndo = false, canRedo = false }: TopBarProps) => {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <h1 className="tracking-tight text-lg font-extralight" style={{ color: '#1a1a2e' }}>
        Яло
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg transition-all active:scale-95 disabled:opacity-30"
          style={{ color: '#1a1a2e' }}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg transition-all active:scale-95 disabled:opacity-30"
          style={{ color: '#1a1a2e' }}
        >
          <Redo2 size={18} />
        </button>
        <button
          onClick={onDownload}
          className="btn-accent-shimmer flex items-center gap-2 px-4 py-2 text-sm font-medium transition-transform active:scale-95"
        >
          <Download size={16} />
          <span>Скачать</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
