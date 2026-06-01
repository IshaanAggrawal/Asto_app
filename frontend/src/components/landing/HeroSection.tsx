import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ZODIAC_SIGNS, ZODIAC_GLYPHS } from "@/lib/constants";
import type { ZodiacSign } from "@/lib/constants";
import ZodiacIcon from "@/lib/zodiacIcons";

/**
 * Rich decorative zodiac wheel inspired by classical astrology charts.
 * Multiple concentric rings, zodiac names & glyphs, ornamental patterns.
 */
function DecorativeWheel() {
  const signs = ZODIAC_SIGNS;
  const cx = 300;
  const cy = 300;

  // Larger ring radii
  const outerR = 290;
  const nameR = 265;     // sign name text radius
  const glyphRingOuter = 245;
  const glyphRingInner = 195; // Wide band for the glyphs
  const glyphR = 220;    // glyph center
  const midRingOuter = 185;
  const midRingInner = 150;
  const innerRing = 140;
  const coreRing = 90;
  const centerR = 60;

  // Generate dots on a ring
  const ringDots = (radius: number, count: number, size: number, opacity: number) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const angle = (i * 360 / count) * Math.PI / 180;
      dots.push(
        <circle
          key={`d-${radius}-${i}`}
          cx={cx + radius * Math.cos(angle)}
          cy={cy + radius * Math.sin(angle)}
          r={size}
          fill={`rgba(245,166,35,${opacity})`}
        />
      );
    }
    return dots;
  };

  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full max-w-[560px] md:max-w-[640px]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(245,166,35,0.06)" />
          <stop offset="70%" stopColor="rgba(245,166,35,0.02)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#AA7A00" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={outerR + 10} fill="url(#wheelGlow)" />

      {/* === Outer ring (Double lined) === */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="url(#goldGradient)" opacity="0.4" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={outerR - 4} fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth="1" />

      {/* Dotted ring just inside outer */}
      {ringDots(outerR - 10, 96, 1.2, 0.25)}

      {/* === Sign names (rotated text around the wheel) === */}
      {signs.map((name, i) => {
        const angle = i * 30 + 15; // center of each 30° segment
        return (
          <text
            key={`name-${name}`}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(245,166,35,0.5)"
            fontSize="11"
            fontFamily="DM Sans, sans-serif"
            fontWeight="600"
            letterSpacing="3"
            transform={`
              rotate(${angle - 90}, ${cx}, ${cy})
              translate(${cx}, ${cy - nameR})
              rotate(${angle > 90 && angle < 270 ? 180 : 0})
            `}
          >
            {name.toUpperCase()}
          </text>
        );
      })}

      {/* === Glyph ring borders (Double lined for premium feel) === */}
      <circle cx={cx} cy={cy} r={glyphRingOuter} fill="none" stroke="url(#goldGradient)" opacity="0.3" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={glyphRingOuter - 3} fill="none" stroke="rgba(245,166,35,0.1)" strokeWidth="0.8" />

      <circle cx={cx} cy={cy} r={glyphRingInner + 3} fill="none" stroke="rgba(245,166,35,0.1)" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={glyphRingInner} fill="none" stroke="url(#goldGradient)" opacity="0.3" strokeWidth="1.5" />

      {/* Segment dividers (outer to glyph ring inner) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={`seg-${i}`}
            x1={cx + glyphRingInner * Math.cos(angle)}
            y1={cy + glyphRingInner * Math.sin(angle)}
            x2={cx + (outerR - 2) * Math.cos(angle)}
            y2={cy + (outerR - 2) * Math.sin(angle)}
            stroke="rgba(245,166,35,0.2)"
            strokeWidth="1"
          />
        );
      })}

      {/* === Large professional zodiac SVG icons === */}
      {signs.map((name, i) => {
        const angle = ((i * 30 + 15) * Math.PI) / 180;
        const x = cx + glyphR * Math.cos(angle);
        const y = cy + glyphR * Math.sin(angle);
        const iconSize = 36;
        return (
          <foreignObject
            key={`glyph-${i}`}
            x={x - iconSize / 2}
            y={y - iconSize / 2}
            width={iconSize}
            height={iconSize}
            style={{ overflow: "visible" }}
          >
            <div style={{ width: iconSize, height: iconSize, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 6px rgba(245,166,35,0.5))" }}>
              <ZodiacIcon sign={name as ZodiacSign} size={iconSize} color="#F5A623" />
            </div>
          </foreignObject>
        );
      })}

      {/* === Middle ring === */}
      <circle cx={cx} cy={cy} r={midRingOuter} fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={midRingInner} fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth="1" />

      {/* Dotted ring in middle zone */}
      {ringDots((midRingOuter + midRingInner) / 2, 48, 0.6, 0.15)}

      {/* House-style divider lines (inner area) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = ((i * 30 + 15) * Math.PI) / 180;
        return (
          <line
            key={`house-${i}`}
            x1={cx + centerR * Math.cos(angle)}
            y1={cy + centerR * Math.sin(angle)}
            x2={cx + midRingInner * Math.cos(angle)}
            y2={cy + midRingInner * Math.sin(angle)}
            stroke="rgba(245,166,35,0.08)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* === Inner ring === */}
      <circle cx={cx} cy={cy} r={innerRing} fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth="0.8" />

      {/* === Core ring === */}
      <circle cx={cx} cy={cy} r={coreRing} fill="none" stroke="rgba(245,166,35,0.2)" strokeWidth="1" />

      {/* Dotted ring at core */}
      {ringDots(coreRing - 6, 24, 0.5, 0.12)}

      {/* === Decorative planet dots === */}
      {[
        { deg: 35, r: 110, size: 4.5 },
        { deg: 105, r: 95, size: 3.5 },
        { deg: 155, r: 140, size: 3 },
        { deg: 200, r: 120, size: 5 },
        { deg: 250, r: 100, size: 4 },
        { deg: 310, r: 145, size: 3.5 },
        { deg: 350, r: 85, size: 4 },
      ].map((p, i) => {
        const angle = (p.deg * Math.PI) / 180;
        const x = cx + p.r * Math.cos(angle);
        const y = cy + p.r * Math.sin(angle);
        return (
          <circle
            key={`planet-${i}`}
            cx={x}
            cy={y}
            r={p.size}
            fill="rgba(245,166,35,0.5)"
            filter="url(#glowFilter)"
          />
        );
      })}

      {/* === Center ornament === */}
      <circle cx={cx} cy={cy} r={centerR} fill="none" stroke="rgba(245,166,35,0.25)" strokeWidth="1" />

      {/* Inner star pattern */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const innerPt = { x: cx + 15 * Math.cos(angle), y: cy + 15 * Math.sin(angle) };
        const outerPt = { x: cx + (centerR - 8) * Math.cos(angle), y: cy + (centerR - 8) * Math.sin(angle) };
        return (
          <line
            key={`star-${i}`}
            x1={innerPt.x}
            y1={innerPt.y}
            x2={outerPt.x}
            y2={outerPt.y}
            stroke="rgba(245,166,35,0.15)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="5" fill="rgba(245,166,35,0.7)" filter="url(#glowFilter)" />
      <circle cx={cx} cy={cy} r="2" fill="rgba(245,166,35,1)" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12">
        {/* Text content */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-accent/30" />
            <span className="text-accent text-sm font-body tracking-[0.25em] uppercase">
              Celestial Guidance
            </span>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-accent/30" />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 tracking-wide">
            <span className="text-text-primary">Know yourself</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, var(--accent), #E8C547, var(--accent-dim))",
              }}
            >
              through the stars
            </span>
          </h1>

          <p className="text-text-secondary text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Your personal AI astrologer — blending ancient Vedic wisdom with
            modern celestial computation. Discover what the cosmos has written
            for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/onboard" className="amber-button text-center text-lg">
              Begin Your Journey
            </Link>
            <Link to="/chart" className="ghost-button text-center text-lg">
              See My Chart
            </Link>
          </div>

          {/* Zodiac line — SVG icons */}
          <div className="mt-12 flex items-center justify-center lg:justify-start gap-4">
            {ZODIAC_SIGNS.map((sign, i) => (
              <motion.div
                key={sign}
                className="opacity-40 hover:opacity-100 transition-all duration-300 cursor-default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1 + i * 0.08 }}
              >
                <ZodiacIcon sign={sign} size={22} color="var(--accent)" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Decorative wheel */}
        <motion.div
          className="flex-1 flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <div className="animate-spin-slow">
            <DecorativeWheel />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <span className="text-xs tracking-widest uppercase">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4v12M5 11l5 5 5-5" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
