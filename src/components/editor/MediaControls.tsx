import { Slider } from "@/components/ui/slider";
import { Move, ZoomIn } from "lucide-react";
import { labelStyle, valStyle } from "./shared-styles";

interface MediaControlsProps {
  scale: number;
  posX: number;
  posY: number;
  darken: number;
  onChange: (updates: { bgScale?: number; bgPosX?: number; bgPosY?: number; bgDarken?: number }) => void;
}

const MediaControls = ({ scale, posX, posY, darken, onChange }: MediaControlsProps) => (
  <div className="flex flex-col gap-2 mt-2">
    <div className="flex items-center gap-2">
      <ZoomIn size={12} style={labelStyle} />
      <span className="text-[10px] flex-shrink-0" style={labelStyle}>Масштаб</span>
      <Slider value={[scale]} onValueChange={([v]) => onChange({ bgScale: v })} min={10} max={300} step={1} className="flex-1" />
      <span className="text-[10px] w-8 text-right" style={valStyle}>{scale}%</span>
    </div>
    <div className="flex items-center gap-2">
      <Move size={12} style={labelStyle} />
      <span className="text-[10px] flex-shrink-0" style={labelStyle}>X</span>
      <Slider value={[posX]} onValueChange={([v]) => onChange({ bgPosX: v })} min={0} max={100} step={1} className="flex-1" />
      <span className="text-[10px] w-6 text-right" style={valStyle}>{posX}</span>
    </div>
    <div className="flex items-center gap-2">
      <Move size={12} style={labelStyle} />
      <span className="text-[10px] flex-shrink-0" style={labelStyle}>Y</span>
      <Slider value={[posY]} onValueChange={([v]) => onChange({ bgPosY: v })} min={0} max={100} step={1} className="flex-1" />
      <span className="text-[10px] w-6 text-right" style={valStyle}>{posY}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] flex-shrink-0" style={labelStyle}>Затемнение</span>
      <Slider value={[darken]} onValueChange={([v]) => onChange({ bgDarken: v })} min={0} max={100} step={1} className="flex-1" />
      <span className="text-[10px] w-6 text-right" style={valStyle}>{darken}</span>
    </div>
  </div>
);

export default MediaControls;
