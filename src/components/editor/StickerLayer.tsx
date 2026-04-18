import React, { useRef, useCallback } from "react";

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

const StickerLayer: React.FC<StickerLayerProps> = ({ stickers, onUpdateSticker, onDeleteSticker, interactive = true, scale = 1 }) => {
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  const getContainerRect = useCallback(() => containerRef.current?.getBoundingClientRect(), []);

  const handlePointerDown = useCallback((e: React.PointerEvent, sticker: Sticker) => {
    if (!interactive || !onUpdateSticker) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    movedRef.current = false;
    dragRef.current = { id: sticker.id, startX: e.clientX, startY: e.clientY, origX: sticker.x, origY: sticker.y };
  }, [interactive, onUpdateSticker]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !onUpdateSticker) return;
    const rect = getContainerRect();
    if (!rect) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) movedRef.current = true;
    const newX = dragRef.current.origX + (dx / rect.width) * 100;
    const newY = dragRef.current.origY + (dy / rect.height) * 100;
    onUpdateSticker(dragRef.current.id, { x: newX, y: newY });
  }, [onUpdateSticker, getContainerRect]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

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
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
