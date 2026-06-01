import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ChartData, PlanetPlacement } from "@/lib/constants";
import { ZODIAC_GLYPHS, ZODIAC_SIGNS, PLANET_GLYPHS } from "@/lib/constants";
import type { ZodiacSign } from "@/lib/constants";
import { degreeToSVG, getSignColor } from "@/lib/zodiacUtils";
import ZodiacIcon from "@/lib/zodiacIcons";

interface BirthChartWheelProps {
  data: ChartData;
  size?: number;
}

export default function BirthChartWheel({ data, size = 500 }: BirthChartWheelProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPlacement | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const zodiacR = size * 0.39;
  const houseR = size * 0.32;
  const innerR = size * 0.14;
  const planetR = size * 0.26;

  const ascDeg = data.houses[0]?.degree || 0;

  // Convert ecliptic degree to chart angle (adjusted for Ascendant at left)
  const chartAngle = (deg: number) => deg - ascDeg;

  const zodiacSegments = useMemo(() => {
    return ZODIAC_SIGNS.map((sign, i) => {
      const startDeg = i * 30;
      const midDeg = startDeg + 15;
      const pos = degreeToSVG(chartAngle(midDeg), cx, cy, (zodiacR + outerR) / 2);
      const color = getSignColor(sign);
      return { sign, startDeg, pos, color, glyph: ZODIAC_GLYPHS[sign] };
    });
  }, [ascDeg, cx, cy, zodiacR, outerR]);

  const houseLines = useMemo(() => {
    return data.houses.map((h) => {
      const inner = degreeToSVG(chartAngle(h.degree), cx, cy, innerR);
      const outer = degreeToSVG(chartAngle(h.degree), cx, cy, houseR);
      const labelPos = degreeToSVG(
        chartAngle(h.degree + 15),
        cx,
        cy,
        (innerR + houseR) / 2
      );
      return { ...h, inner, outer, labelPos };
    });
  }, [data.houses, ascDeg, cx, cy, innerR, houseR]);

  const planetPositions = useMemo(() => {
    // Spread overlapping planets slightly
    const sorted = [...data.planets].sort((a, b) => a.degree - b.degree);
    const positions: { planet: PlanetPlacement; pos: { x: number; y: number } }[] = [];
    const minSpacing = 18;

    for (const planet of sorted) {
      let angle = chartAngle(planet.degree);
      // Check collision with existing
      for (const existing of positions) {
        const existingAngle = chartAngle(existing.planet.degree);
        if (Math.abs(angle - existingAngle) < 8) {
          angle += minSpacing / planetR * (180 / Math.PI);
        }
      }
      positions.push({
        planet,
        pos: degreeToSVG(angle, cx, cy, planetR),
      });
    }
    return positions;
  }, [data.planets, ascDeg, cx, cy, planetR]);

  const handlePlanetHover = (planet: PlanetPlacement, x: number, y: number) => {
    setHoveredPlanet(planet);
    setTooltipPos({ x, y });
  };

  return (
    <div className="relative" style={{ width: size, height: size, maxWidth: "100%" }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 30px rgba(245,166,35,0.08))" }}
      >
        <defs>
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(25,29,53,0.8)" />
            <stop offset="100%" stopColor="rgba(13,15,26,0.9)" />
          </radialGradient>
        </defs>

        {/* Background */}
        <circle cx={cx} cy={cy} r={outerR + 8} fill="url(#chartBg)" />

        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Zodiac ring */}
        <circle
          cx={cx}
          cy={cy}
          r={zodiacR}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1"
        />

        {/* House ring */}
        <circle
          cx={cx}
          cy={cy}
          r={houseR}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Inner circle */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.8"
        />

        {/* Zodiac sign dividers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = chartAngle(i * 30);
          const inner = degreeToSVG(deg, cx, cy, zodiacR);
          const outer = degreeToSVG(deg, cx, cy, outerR);
          return (
            <line
              key={`zd-${i}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--border-strong)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Zodiac SVG icons */}
        {zodiacSegments.map((seg) => {
          const iconSize = size * 0.055;
          return (
            <foreignObject
              key={seg.sign}
              x={seg.pos.x - iconSize / 2}
              y={seg.pos.y - iconSize / 2}
              width={iconSize}
              height={iconSize}
              style={{ overflow: "visible" }}
            >
              <div style={{
                width: iconSize,
                height: iconSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: `drop-shadow(0 0 4px ${seg.color}40)`,
              }}>
                <ZodiacIcon sign={seg.sign as ZodiacSign} size={iconSize} color={seg.color} />
              </div>
            </foreignObject>
          );
        })}

        {/* House lines */}
        {houseLines.map((h) => (
          <g key={`house-${h.house}`}>
            <line
              x1={h.inner.x}
              y1={h.inner.y}
              x2={h.outer.x}
              y2={h.outer.y}
              stroke={h.house === 1 || h.house === 10 ? "var(--accent)" : "var(--border)"}
              strokeWidth={h.house === 1 || h.house === 10 ? 1.5 : 0.7}
              opacity={h.house === 1 || h.house === 10 ? 0.8 : 0.5}
            />
            <text
              x={h.labelPos.x}
              y={h.labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={size * 0.02}
              fontFamily="DM Sans, sans-serif"
            >
              {h.house}
            </text>
          </g>
        ))}

        {/* Planets */}
        {planetPositions.map(({ planet, pos }, i) => {
          const glyph = PLANET_GLYPHS[planet.name] || "●";
          const color = getSignColor(planet.sign);

          return (
            <motion.g
              key={planet.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              onMouseEnter={(e) => {
                const svg = e.currentTarget.closest("svg");
                if (svg) {
                  const rect = svg.getBoundingClientRect();
                  const scaleX = rect.width / size;
                  const scaleY = rect.height / size;
                  handlePlanetHover(
                    planet,
                    pos.x * scaleX + rect.left,
                    pos.y * scaleY + rect.top
                  );
                }
              }}
              onMouseLeave={() => setHoveredPlanet(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Planet glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size * 0.025}
                fill={`${color}20`}
              />
              {/* Planet dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size * 0.012}
                fill={color}
                opacity="0.8"
              />
              {/* Planet glyph */}
              <text
                x={pos.x}
                y={pos.y - size * 0.022}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={size * 0.024}
                fontWeight="bold"
              >
                {glyph}
              </text>
            </motion.g>
          );
        })}

        {/* Center glyph */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--accent)"
          fontSize={size * 0.04}
          opacity="0.6"
        >
          ✦
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredPlanet && (
        <div
          className="fixed z-50 glass-panel rounded-lg px-4 py-3 text-sm pointer-events-none"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 60,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="font-display text-accent text-base mb-1">
            {PLANET_GLYPHS[hoveredPlanet.name]} {hoveredPlanet.name}
          </div>
          <div className="text-text-secondary">
            {ZODIAC_GLYPHS[hoveredPlanet.sign]} {hoveredPlanet.sign} —{" "}
            {Math.round(hoveredPlanet.degree % 30)}°
          </div>
          <div className="text-text-muted text-xs mt-1">
            House {hoveredPlanet.house}
          </div>
        </div>
      )}
    </div>
  );
}
