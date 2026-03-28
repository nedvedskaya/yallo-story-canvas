import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from "lucide-react";

export type HAlign = "left" | "center" | "right";
export type VAlign = "start" | "center" | "end";
export type BgType = "color" | "photo" | "video";

interface SlideToolbarProps {
  hAlign: HAlign;
  vAlign: VAlign;
  bgType: BgType;
  onHAlignChange: (v: HAlign) => void;
  onVAlignChange: (v: VAlign) => void;
  onBgClick: () => void;
  onCropClick: () => void;
}

const hAlignCycle: HAlign[] = ["left", "center", "right"];
const vAlignCycle: VAlign[] = ["start", "center", "end"];

const hAlignIcons = { left: AlignLeft, center: AlignCenter, right: AlignRight };
const vAlignIcons = {
  start: AlignVerticalJustifyStart,
  center: AlignVerticalJustifyCenter,
  end: AlignVerticalJustifyEnd,
};

const SlideToolbar = ({
  hAlign,
  vAlign,
  onHAlignChange,
  onVAlignChange,
}: SlideToolbarProps) => {
  const HIcon = hAlignIcons[hAlign];
  const VIcon = vAlignIcons[vAlign];

  const cycleH = () => {
    const idx = hAlignCycle.indexOf(hAlign);
    onHAlignChange(hAlignCycle[(idx + 1) % 3]);
  };

  const cycleV = () => {
    const idx = vAlignCycle.indexOf(vAlign);
    onVAlignChange(vAlignCycle[(idx + 1) % 3]);
  };

  return (
    <div
      className="mt-2 flex items-center justify-center gap-0.5 px-1.5 py-1 mx-auto"
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.7)",
        borderRadius: "12px",
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        width: "fit-content",
      }}
    >
      {/* Horizontal align */}
      <button
        onClick={cycleH}
        className="flex items-center justify-center rounded-lg transition-all active:scale-90"
        style={{ width: 32, height: 32, color: "#4a4a6a" }}
      >
        <HIcon size={16} />
      </button>

      {/* Vertical align */}
      <button
        onClick={cycleV}
        className="flex items-center justify-center rounded-lg transition-all active:scale-90"
        style={{ width: 32, height: 32, color: "#4a4a6a" }}
      >
        <VIcon size={16} />
      </button>
    </div>
  );
};

export default SlideToolbar;
