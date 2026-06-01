import type { ZodiacSign } from "./constants";

interface ZodiacIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/* ── Individual SVG zodiac icons ────────────────────────
   Each is a hand-tuned path in a 24×24 viewBox,
   styled as stroke-based line art for a premium feel.
   ─────────────────────────────────────────────────────── */

function AriesIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 22V10M12 10C12 6 9.5 2 6 2C3.5 2 2 4 2 6C2 8.5 4 10 6 10M12 10C12 6 14.5 2 18 2C20.5 2 22 4 22 6C22 8.5 20 10 18 10"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function TaurusIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4C4 4 7 8 12 8C17 8 20 4 20 4"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="12" cy="15" r="6" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function GeminiIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 3C8 5 16 5 20 3M4 21C8 19 16 19 20 21M8 4.5V19.5M16 4.5V19.5"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function CancerIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20 9C20 9 17 7 12 7C7 7 4 9 4 12"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
      <path
        d="M4 15C4 15 7 17 12 17C17 17 20 15 20 12"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
      <circle cx="7" cy="9" r="2.5" stroke={color} strokeWidth="1.8" />
      <circle cx="17" cy="15" r="2.5" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function LeoIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="9" r="4" stroke={color} strokeWidth="1.8" />
      <path
        d="M13 9C13 9 16 9 18 11C20 13 20 16 18 18C16 20 13 20 13 18C13 16 15 15 17 15"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function VirgoIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20V6C4 4 6 3 8 5C8 5 8 20 8 20M8 6C8 4 10 3 12 5C12 5 12 20 12 20M12 6C12 4 14 3 16 5C16 5 16 14 16 14C16 14 19 14 20 17C20 19 18 21 16 20"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function LibraIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M4 14h16M12 14V4"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M6 14C6 11 8.7 8 12 8C15.3 8 18 11 18 14"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
    </svg>
  );
}

function ScorpioIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20V6C4 4 6 3 8 5C8 5 8 20 8 20M8 6C8 4 10 3 12 5C12 5 12 20 12 20M12 6C12 4 14 3 16 5C16 5 16 18 16 18L19 15"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M16 18L19 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SagittariusIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 21L21 3M21 3H14M21 3V10M8 16L14 10"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function CapricornIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4V16C4 16 4 20 8 20C12 20 12 16 12 16V4"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M12 16C12 16 12 20 16 20C18 20 20 18 20 16C20 14 18 12 16 14C14 16 16 20 20 20"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function AquariusIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2 9L5 6L8 9L11 6L14 9L17 6L20 9L22 7"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M2 17L5 14L8 17L11 14L14 17L17 14L20 17L22 15"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function PiscesIcon({ size = 24, color = "currentColor", className }: ZodiacIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M7 3C4 6 4 18 7 21"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M17 3C20 6 20 18 17 21"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Lookup map ───────────────────────────────────────── */

const ZODIAC_ICON_MAP: Record<ZodiacSign, React.FC<ZodiacIconProps>> = {
  Aries: AriesIcon,
  Taurus: TaurusIcon,
  Gemini: GeminiIcon,
  Cancer: CancerIcon,
  Leo: LeoIcon,
  Virgo: VirgoIcon,
  Libra: LibraIcon,
  Scorpio: ScorpioIcon,
  Sagittarius: SagittariusIcon,
  Capricorn: CapricornIcon,
  Aquarius: AquariusIcon,
  Pisces: PiscesIcon,
};

/**
 * Renders a professional SVG zodiac icon for the given sign.
 */
export default function ZodiacIcon({
  sign,
  size = 24,
  color = "currentColor",
  className,
}: ZodiacIconProps & { sign: ZodiacSign }) {
  const Icon = ZODIAC_ICON_MAP[sign];
  if (!Icon) return null;
  return <Icon size={size} color={color} className={className} />;
}

export { ZODIAC_ICON_MAP };
