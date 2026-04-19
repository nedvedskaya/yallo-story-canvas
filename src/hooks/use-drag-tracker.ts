import { useRef, useCallback } from "react";

/**
 * Общий хук одно-указательного drag'а с детектом click-vs-drag через порог.
 *
 * Использование: компоненты, у которых есть перетаскиваемые элементы с
 * поведением «короткий тап = click, длинный тап с движением = drag»
 * (стикеры, draggable-элементы без pinch-to-scale).
 *
 * SlideCarousel (текстовый drag) пока не мигрирован — там особая логика:
 *   - 2-finger pinch для масштаба;
 *   - mouse + touch события обрабатываются отдельно (legacy);
 *   - offset хранится в пикселях, а не в процентах от контейнера.
 * Когда/если SlideCarousel перейдёт на PointerEvent — можно будет
 * расширить этот хук (опциональный onPinch callback) или ввести отдельный
 * useDragAndPinch. Пока приоритет — убрать дубликат drag-а для стикеров.
 */

/** Порог движения (в px), после которого поинтер-сессия считается drag'ом,
 *  а не click'ом. Раньше в StickerLayer было 3, в SlideCarousel — 5. */
export const DRAG_THRESHOLD_PX = 5;

export interface DragTrackerHandlers<T> {
  /** Начать drag. Передай произвольный `context` — он будет возвращён в onMove/onEnd. */
  onPointerDown: (e: React.PointerEvent, context: T) => void;
  /** Ставь на контейнер — получает все move-события во время drag'а. */
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  /** True, если текущая/последняя сессия превысила порог (drag, не click). */
  didMove: () => boolean;
}

export interface DragTrackerOptions<T> {
  /** Вызывается на каждый pointermove во время drag'а (после onPointerDown,
   *  до onPointerUp). dx/dy — дельта в px от стартовой точки. */
  onMove: (ctx: T, dx: number, dy: number) => void;
  /** Вызывается один раз при pointerup. Если передан — можешь зафиксировать
   *  финальное состояние (например, запушить в undo-стек). */
  onEnd?: (ctx: T, moved: boolean) => void;
  /** Вернуть элемент-контейнер для захвата указателя. Обычно не нужен — хук
   *  использует setPointerCapture на target pointerdown события. */
  threshold?: number;
}

/** Хук drag-трекера. Возвращает хендлеры для биндинга на DOM-элементах.
 *  Контекст (T) — любые данные, которые нужны callbacks (id стикера,
 *  исходные координаты и т.д.). */
export function useDragTracker<T>({
  onMove,
  onEnd,
  threshold = DRAG_THRESHOLD_PX,
}: DragTrackerOptions<T>): DragTrackerHandlers<T> {
  const stateRef = useRef<{ startX: number; startY: number; ctx: T } | null>(null);
  const movedRef = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent, context: T) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    movedRef.current = false;
    stateRef.current = { startX: e.clientX, startY: e.clientY, ctx: context };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (Math.abs(dx) + Math.abs(dy) > threshold) {
      movedRef.current = true;
    }
    onMove(s.ctx, dx, dy);
  }, [onMove, threshold]);

  const onPointerUp = useCallback((_e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s) return;
    if (onEnd) onEnd(s.ctx, movedRef.current);
    stateRef.current = null;
  }, [onEnd]);

  const didMove = useCallback(() => movedRef.current, []);

  return { onPointerDown, onPointerMove, onPointerUp, didMove };
}
