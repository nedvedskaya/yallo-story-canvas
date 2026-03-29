import type { OverlayType } from "./BackgroundPanel";

interface SlideOverlayProps {
  type: OverlayType;
  opacity: number; // 0-100
  color?: string; // base color for overlay lines/shapes, default white
  scale?: number; // scale factor for export (1 = preview, >1 = export)
}

const SlideOverlay = ({ type, opacity, color }: SlideOverlayProps) => {
  if (type === "none" || opacity === 0) return null;

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
            backgroundImage: `radial-gradient(circle, ${ca(0.5)} 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />
      );
    case "lines":
      return (
        <div
          style={{
            ...style,
            backgroundImage: `repeating-linear-gradient(0deg, ${ca(0.3)} 0px, ${ca(0.3)} 1px, transparent 1px, transparent 14px)`,
          }}
        />
      );
    case "grid":
      return (
        <div
          style={{
            ...style,
            backgroundImage: `
              linear-gradient(${ca(0.25)} 1px, transparent 1px),
              linear-gradient(90deg, ${ca(0.25)} 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      );
    case "cells":
      return (
        <svg style={{ ...style, width: "100%", height: "100%" }}>
          <defs>
            <pattern id="cells" width="30" height="26" patternUnits="userSpaceOnUse">
              <path
                d="M15 0 L30 8 L30 22 L15 26 L0 22 L0 8 Z"
                fill="none"
                stroke={ca(0.3)}
                strokeWidth="0.8"
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
              width: "60%",
              height: "50%",
              top: "10%",
              left: "5%",
              borderRadius: "50%",
              background: ca(0.2),
              filter: "blur(30px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "50%",
              height: "45%",
              bottom: "15%",
              right: "10%",
              borderRadius: "50%",
              background: ca(0.15),
              filter: "blur(25px)",
            }}
          />
        </div>
      );
    case "noise":
      return (
        <div
          style={{
            ...style,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
            mixBlendMode: "overlay",
          }}
        />
      );
    default:
      return null;
  }
};

export default SlideOverlay;
