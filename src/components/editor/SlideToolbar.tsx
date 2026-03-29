import { useState } from "react";
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

type ActiveTool = "hAlign" | "vAlign" | null;

const SlideToolbar = ({
  hAlign,
  vAlign,
  onHAlignChange,
  onVAlignChange,
}: SlideToolbarProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const HIcon = hAlignIcons[hAlign];
  const VIcon = vAlignIcons[vAlign];

  const cycleH = () => {
    setActiveTool("hAlign");
    const idx = hAlignCycle.indexOf(hAlign);
    onHAlignChange(hAlignCycle[(idx + 1) % 3]);
  };

  const cycleV = () => {
    setActiveTool("vAlign");
    const idx = vAlignCycle.indexOf(vAlign);
    onVAlignChange(vAlignCycle[(idx + 1) % 3]);
  };

  const btnStyle = (isActive: boolean): React.CSSProperties => ({
    ...glassBtnStyle,
    color: isActive ? "#1a1a2e" : "#4a4a6a",
    boxShadow: isActive
      ? "0 -3px 8px rgba(100, 120, 220, 0.35), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)"
      : "0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
    position: "relative" as const,
  });

  return (
    <div className="mt-2 flex items-center justify-center gap-2 mx-auto">
      <button
        onClick={cycleH}
        className="flex items-center justify-center transition-all active:scale-90"
        style={btnStyle(activeTool === "hAlign")}
      >
        {activeTool === "hAlign" && (
          <div
            className="absolute -top-[1px] left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full"
            style={{ background: "rgba(100, 120, 220, 0.7)" }}
          />
        )}
        <HIcon size={15} />
      </button>

      <button
        onClick={cycleV}
        className="flex items-center justify-center transition-all active:scale-90"
        style={btnStyle(activeTool === "vAlign")}
      >
        {activeTool === "vAlign" && (
          <div
            className="absolute -top-[1px] left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full"
            style={{ background: "rgba(100, 120, 220, 0.7)" }}
          />
        )}
        <VIcon size={15} />
      </button>
    </div>
  );
};

export default SlideToolbar;
