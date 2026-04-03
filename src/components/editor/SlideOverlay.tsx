import type { OverlayType } from "./BackgroundPanel";

interface SlideOverlayProps {
  type: OverlayType;
  opacity: number; // 0-100
  color?: string; // base color for overlay lines/shapes, default white
  scale?: number; // scale factor for export (1 = preview, >1 = export)
}

const SlideOverlay = ({ type, opacity, color, scale = 1 }: SlideOverlayProps) => {
  if (type === "none" || opacity === 0) return null;
  const s = scale; // shorthand for scaled pixel values

  const alpha = opacity / 100;
  const style: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    opacity: alpha,
  };

  // Parse color prop to get rgba values for overlays
  const c = color || "rgba(255,255,255,1)";
  // Helper: apply given alpha to the color
  const ca = (a: number) => {
    // If color is hex like #000000, convert
    if (c.startsWith("#")) {
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }
    // If rgba(...), replace alpha
    const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) return `rgba(${match[1]},${match[2]},${match[3]},${a})`;
    return `rgba(255,255,255,${a})`;
  };

  switch (type) {
    case "dots":
      return (
        <div
          style={{
            ...style,
            backgroundImage: `radial-gradient(circle, ${ca(0.5)} ${1 * s}px, transparent ${1 * s}px)`,
            backgroundSize: `${16 * s}px ${16 * s}px`,
          }}
        />
      );
    case "lines":
      return (
        <div
          style={{
            ...style,
            backgroundImage: `repeating-linear-gradient(0deg, ${ca(0.3)} 0px, ${ca(0.3)} ${1 * s}px, transparent ${1 * s}px, transparent ${14 * s}px)`,
          }}
        />
      );
    case "grid":
      return (
        <div
          style={{
            ...style,
            backgroundImage: `
              linear-gradient(${ca(0.25)} ${1 * s}px, transparent ${1 * s}px),
              linear-gradient(90deg, ${ca(0.25)} ${1 * s}px, transparent ${1 * s}px)
            `,
            backgroundSize: `${20 * s}px ${20 * s}px`,
          }}
        />
      );
    case "cells":
      return (
        <svg style={{ ...style, width: "100%", height: "100%" }}>
          <defs>
            <pattern id="cells" width={24 * s} height={24 * s} patternUnits="userSpaceOnUse">
              <path
                d={`M${12 * s} 0 L${24 * s} ${12 * s} L${12 * s} ${24 * s} L0 ${12 * s} Z`}
                fill="none"
                stroke={ca(0.2)}
                strokeWidth={0.5 * s}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cells)" />
        </svg>
      );
    case "blobs":
      return (
        <div style={style}>
          <div
            style={{
              position: "absolute",
              width: "45%",
              height: "40%",
              top: "5%",
              left: "10%",
              borderRadius: "50%",
              background: ca(0.15),
              filter: `blur(${40 * s}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "35%",
              height: "35%",
              top: "40%",
              right: "5%",
              borderRadius: "50%",
              background: ca(0.12),
              filter: `blur(${35 * s}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "30%",
              height: "30%",
              bottom: "10%",
              left: "25%",
              borderRadius: "50%",
              background: ca(0.1),
              filter: `blur(${30 * s}px)`,
            }}
          />
        </div>
      );
    default:
      return null;
  }
};

export default SlideOverlay;
