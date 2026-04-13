import { useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Sticker } from "./StickerLayer";

interface StickersPanelProps {
  stickers: Sticker[];
  onAddSticker: (src: string, width: number, height: number) => void;
  onDeleteSticker: (id: string) => void;
}

const StickersPanel = ({ stickers, onAddSticker, onDeleteSticker }: StickersPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Base size: fit into ~80px box
      const maxBase = 80;
      const ratio = Math.min(maxBase / img.width, maxBase / img.height, 1);
      onAddSticker(url, img.width * ratio, img.height * ratio);
    };
    img.src = url;
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const maxBase = 80;
            const ratio = Math.min(maxBase / img.width, maxBase / img.height, 1);
            onAddSticker(url, img.width * ratio, img.height * ratio);
          };
          img.src = url;
          return;
        }
      }
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
          style={{
            background: 'rgba(26,26,46,0.06)',
            color: '#1a1a2e',
          }}
        >
          <Plus size={14} />
          Загрузить
        </button>
        <button
          onClick={handlePaste}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
          style={{
            background: 'rgba(26,26,46,0.06)',
            color: '#1a1a2e',
          }}
        >
          Вставить
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {stickers.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {stickers.map((s) => (
            <div key={s.id} className="relative group">
              <img
                src={s.src}
                alt=""
                className="rounded-lg object-contain"
                style={{ width: 56, height: 56, background: 'rgba(0,0,0,0.04)' }}
              />
              <button
                onClick={() => onDeleteSticker(s.id)}
                className="absolute -top-1 -right-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(220,40,40,0.85)', color: '#fff' }}
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px]" style={{ color: 'rgba(26,26,46,0.4)' }}>
        Двойной клик по элементу на слайде — удалить
      </p>
    </div>
  );
};

export default StickersPanel;
