import {
  Palette,
  Image,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Crop,
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
const bgIcons = { color: Palette, photo: Image, video: Video };

const SlideToolbar = ({
  hAlign,
  vAlign,
  bgType,
  onHAlignChange,
  onVAlignChange,
  onBgClick,
  onCropClick,
}: SlideToolbarProps) => {
  const HIcon = hAlignIcons[hAlign];
  const VIcon = vAlignIcons[vAlign];
  const BgIcon = bgIcons[bgType];

  const cycleH = () => {
    const idx = hAlignCycle.indexOf(hAlign);
    onHAlignChange(hAlignCycle[(idx + 1) % 3]);
  };

  const cycleV = () => {
    const idx = vAlignCycle.indexOf(vAlign);
    onVAlignChange(vAlignCycle[(idx + 1) % 3]);
  };

  const showCrop = bgType === "photo" || bgType === "video";

  return (
    <div
      className="mt-4 flex items-center justify-center gap-2 px-3 py-2 mx-auto"
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.7)",
        borderRadius: "16px",
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        width: "fit-content",
      }}
    >
      {/* Background */}
      <button
        onClick={onBgClick}
        className="flex items-center justify-center rounded-[10px] transition-all active:scale-90"
        style={{ width: 44, height: 44, color: "#4a4a6a" }}
      >
        <BgIcon size={20} />
      </button>

      {/* Horizontal align */}
      <button
        onClick={cycleH}
        className="flex items-center justify-center rounded-[10px] transition-all active:scale-90"
        style={{ width: 44, height: 44, color: "#4a4a6a" }}
      >
        <HIcon size={20} />
      </button>

      {/* Vertical align */}
      <button
        onClick={cycleV}
        className="flex items-center justify-center rounded-[10px] transition-all active:scale-90"
        style={{ width: 44, height: 44, color: "#4a4a6a" }}
      >
        <VIcon size={20} />
      </button>

      {/* Crop — only for photo/video */}
      {showCrop && (
        <button
          onClick={onCropClick}
          className="flex items-center justify-center rounded-[10px] transition-all active:scale-90"
          style={{ width: 44, height: 44, color: "#4a4a6a" }}
        >
          <Crop size={20} />
        </button>
      )}
    </div>
  );
};

export default SlideToolbar;
