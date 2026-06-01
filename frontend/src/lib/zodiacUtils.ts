import { ZodiacSign, ZODIAC_GLYPHS, ELEMENT_COLORS, ZODIAC_ELEMENTS } from "./constants";

/**
 * Get the Unicode glyph for a zodiac sign.
 */
export function getZodiacGlyph(sign: ZodiacSign): string {
  return ZODIAC_GLYPHS[sign] || "★";
}

/**
 * Get the element (Fire, Earth, Air, Water) for a zodiac sign.
 */
export function getElement(sign: ZodiacSign): string {
  return ZODIAC_ELEMENTS[sign] || "Unknown";
}

/**
 * Get a color for a zodiac sign based on its element.
 */
export function getSignColor(sign: ZodiacSign): string {
  const element = getElement(sign);
  return ELEMENT_COLORS[element] || "#F5A623";
}

/**
 * Convert an ecliptic degree (0–360) to the zodiac sign index (0–11).
 */
export function degreeToSignIndex(degree: number): number {
  return Math.floor(((degree % 360) + 360) % 360 / 30);
}

/**
 * Convert an ecliptic degree to a position within its sign (0°–29°).
 */
export function degreeInSign(degree: number): number {
  return ((degree % 360) + 360) % 360 % 30;
}

/**
 * Format a degree as e.g. "12° Leo".
 */
export function formatDegree(degree: number, sign: ZodiacSign): string {
  const d = Math.round(degreeInSign(degree));
  return `${d}° ${sign}`;
}

/**
 * Convert ecliptic degrees to SVG x, y on a circle.
 * Astro charts: 0° Aries at 9 o'clock, going counter-clockwise.
 */
export function degreeToSVG(
  degree: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number } {
  // In astro charts: Aries (0°) at left (9 o'clock), going counter-clockwise
  const angleRad = ((180 - degree) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy - radius * Math.sin(angleRad),
  };
}

/**
 * Generate a unique conversation ID.
 */
export function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Format a timestamp for display.
 */
export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
