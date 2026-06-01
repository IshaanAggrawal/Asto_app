export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/* ── Zodiac signs ─────────────────────────────────────── */

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_GLYPHS: Record<ZodiacSign, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

export const ZODIAC_ELEMENTS: Record<ZodiacSign, string> = {
  Aries: "Fire",
  Taurus: "Earth",
  Gemini: "Air",
  Cancer: "Water",
  Leo: "Fire",
  Virgo: "Earth",
  Libra: "Air",
  Scorpio: "Water",
  Sagittarius: "Fire",
  Capricorn: "Earth",
  Aquarius: "Air",
  Pisces: "Water",
};

export const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#E05C5C",
  Earth: "#4CAF7D",
  Air: "#5CA8E0",
  Water: "#7B68EE",
};

/* ── Planet data ──────────────────────────────────────── */

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  "North Node": "☊",
  Chiron: "⚷",
};

/* ── Chat quick-ask chips ─────────────────────────────── */

export const QUICK_ASK_CHIPS = [
  "What does my chart say about love?",
  "What are today's transits for me?",
  "What's my rising sign?",
  "Tell me about my Moon sign",
  "What career path suits my chart?",
];

/* ── Mock chart data ──────────────────────────────────── */

export interface PlanetPlacement {
  name: string;
  sign: ZodiacSign;
  degree: number;
  house: number;
}

export interface HouseData {
  house: number;
  sign: ZodiacSign;
  degree: number;
}

export interface ChartData {
  chart_id: string;
  sun_sign: ZodiacSign;
  moon_sign: ZodiacSign;
  rising_sign: ZodiacSign;
  planets: PlanetPlacement[];
  houses: HouseData[];
}

export const MOCK_CHART_DATA: ChartData = {
  chart_id: "mock-chart-001",
  sun_sign: "Leo",
  moon_sign: "Pisces",
  rising_sign: "Scorpio",
  planets: [
    { name: "Sun", sign: "Leo", degree: 142.5, house: 10 },
    { name: "Moon", sign: "Pisces", degree: 338.2, house: 5 },
    { name: "Mercury", sign: "Virgo", degree: 165.8, house: 11 },
    { name: "Venus", sign: "Cancer", degree: 108.3, house: 9 },
    { name: "Mars", sign: "Aries", degree: 18.7, house: 6 },
    { name: "Jupiter", sign: "Sagittarius", degree: 258.1, house: 2 },
    { name: "Saturn", sign: "Capricorn", degree: 288.9, house: 3 },
    { name: "Uranus", sign: "Taurus", degree: 42.4, house: 7 },
    { name: "Neptune", sign: "Pisces", degree: 348.6, house: 5 },
    { name: "Pluto", sign: "Capricorn", degree: 292.3, house: 3 },
    { name: "North Node", sign: "Gemini", degree: 72.1, house: 8 },
    { name: "Chiron", sign: "Aries", degree: 8.5, house: 6 },
  ],
  houses: [
    { house: 1, sign: "Scorpio", degree: 210 },
    { house: 2, sign: "Sagittarius", degree: 240 },
    { house: 3, sign: "Capricorn", degree: 270 },
    { house: 4, sign: "Aquarius", degree: 300 },
    { house: 5, sign: "Pisces", degree: 330 },
    { house: 6, sign: "Aries", degree: 0 },
    { house: 7, sign: "Taurus", degree: 30 },
    { house: 8, sign: "Gemini", degree: 60 },
    { house: 9, sign: "Cancer", degree: 90 },
    { house: 10, sign: "Leo", degree: 120 },
    { house: 11, sign: "Virgo", degree: 150 },
    { house: 12, sign: "Libra", degree: 180 },
  ],
};

/* ── Mock transit data ────────────────────────────────── */

export interface TransitData {
  planet: string;
  aspect: string;
  natal_planet: string;
  description: string;
}

export const MOCK_TRANSITS: TransitData[] = [
  {
    planet: "Jupiter",
    aspect: "Trine",
    natal_planet: "Sun",
    description:
      "A harmonious day for self-expression and creative pursuits. Opportunities may arise in leadership roles.",
  },
  {
    planet: "Venus",
    aspect: "Conjunction",
    natal_planet: "Moon",
    description:
      "Heightened emotional sensitivity and a desire for beauty and comfort. Nurture close relationships.",
  },
  {
    planet: "Mars",
    aspect: "Square",
    natal_planet: "Mercury",
    description:
      "Watch for impulsive communication. Channel this dynamic energy into productive debates or writing.",
  },
];
