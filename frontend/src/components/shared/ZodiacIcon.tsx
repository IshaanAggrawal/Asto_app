import type { ZodiacSign } from "@/lib/constants";
import { ZODIAC_GLYPHS } from "@/lib/constants";
import { getSignColor } from "@/lib/zodiacUtils";

interface ZodiacIconProps {
  sign: ZodiacSign;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: "text-lg w-8 h-8",
  md: "text-2xl w-10 h-10",
  lg: "text-3xl w-14 h-14",
  xl: "text-5xl w-20 h-20",
};

export default function ZodiacIcon({
  sign,
  size = "md",
  showLabel = false,
  className = "",
}: ZodiacIconProps) {
  const glyph = ZODIAC_GLYPHS[sign] || "★";
  const color = getSignColor(sign);

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`${SIZES[size]} rounded-full flex items-center justify-center transition-all duration-300`}
        style={{
          background: `${color}15`,
          border: `1px solid ${color}40`,
          color: color,
          filter: `drop-shadow(0 0 6px ${color}30)`,
        }}
      >
        {glyph}
      </div>
      {showLabel && (
        <span className="text-xs font-body text-text-secondary">{sign}</span>
      )}
    </div>
  );
}
