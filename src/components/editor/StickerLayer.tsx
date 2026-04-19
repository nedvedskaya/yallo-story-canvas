import React, { useRef, useCallback } from "react";
import { useDragTracker } from "@/hooks/use-drag-tracker";

export interface Sticker {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  width: number;
  height: number;
}

interface StickerLayerProps {
  stickers: Sticker[];
  onUpdateSticker?: (id: string, updates: Partial<Sticker>) => void;
  onDeleteSticker?: (id: string) => void;
  interactive?: boolean;
  scale?: number;
}

/** Контекст, который drag-трекер помнит между pointerdown и pointermove: id
 *  стикера и его исходные координаты в процентах. */
interface DragCtx {
  id: string;
  origX: number;
  origY: number;
}

const StickerLayer: React.FC<StickerLayerProps> = ({ stickers, onUpdateSticker, onDeleteSticker, interactive = true, scale = 1 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getContainerRect = useCallback(() => containerRef.current?.getBoundingClientRect(), []);

  // Переводим px-дельту указателя в проценты от размера контейнера (так хранится
  // позиция стикера — x/y в %). Позволяет корректно работать при любом масштабе.
  const handleMove = useCallback((ctx: DragCtx, dx: number, dy: number) => {
    if (!onUpdateSticker) return;
    const rect = getContainerRect();
    if (!rect) return;
    const newX = ctx.origX + (dx / rect.width) * 100;
    const newY = ctx.origY + (dy / rect.height) * 100;
    onUpdateSticker(ctx.id, { x: newX, y: newY });
  }, [onUpdateSticker, getContainerRect]);

  const drag = useDragTracker<DragCtx>({ onMove: handleMove });

  const handlePointerDown = useCallback((e: React.PointerEvent, sticker: Sticker) => {
    if (!interactive || !onUpdateSticker) return;
    drag.onPointerDown(e, { id: sticker.id, origX: sticker.x, origY: sticker.y });
  }, [interactive, onUpdateSticker, drag]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, sticker: Sticker) => {
    e.stopPropagation();
    if (onDeleteSticker) onDeleteSticker(sticker.id);
  }, [onDeleteSticker]);

  if (!stickers || stickers.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[5]"
      style={{ pointerEvents: 'none' }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      {stickers.map((s) => (
        <img
          key={s.id}
          src={s.src}
          alt=""
          draggable={false}
          onPointerDown={(e) => handlePointerDown(e, s)}
          onDoubleClick={(e) => handleDoubleClick(e, s)}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.width * s.scale * scale}px`,
            height: `${s.height * s.scale * scale}px`,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
            cursor: interactive ? 'grab' : 'default',
            touchAction: 'none',
            userSelect: 'none',
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default StickerLayer;
