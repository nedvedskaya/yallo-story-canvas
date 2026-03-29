import type React from "react";

export const glassBtnStyle: React.CSSProperties = {
  width: 36, height: 36, color: "#4a4a6a",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.7)", borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

export const labelStyle: React.CSSProperties = { color: "rgba(26,26,46,0.5)" };
export const valStyle: React.CSSProperties = { color: "rgba(26,26,46,0.6)" };
