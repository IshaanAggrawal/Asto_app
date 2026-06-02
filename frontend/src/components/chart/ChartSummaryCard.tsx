import type { ChartData } from "@/lib/constants";
import { ZODIAC_GLYPHS } from "@/lib/constants";
import { getSignColor, getZodiacGlyph } from "@/lib/zodiacUtils";
import ZodiacIcon from "@/components/shared/ZodiacIcon";

interface ChartSummaryCardProps {
  data: ChartData;
  name?: string;
}

export default function ChartSummaryCard({ data, name }: ChartSummaryCardProps) {
  const bigThree = [
    { label: "Sun", sign: data.sun_sign },
    { label: "Moon", sign: data.moon_sign },
    { label: "Rising", sign: data.rising_sign },
  ];

  return (
    <div className="space-y-6">
      {/* Name */}
      {name && (
        <div>
          <h2 className="font-display text-xl text-text-primary">{name}</h2>
          <p className="text-text-muted text-sm mt-1">Natal Chart Summary</p>
        </div>
      )}

      {/* Big three */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-text-muted font-body">
          The Big Three
        </h3>
        {bigThree.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-white/5"
            style={{ border: "1px solid var(--border)" }}
          >
            <ZodiacIcon sign={item.sign} size="sm" />
            <div>
              <span className="text-text-secondary text-sm">{item.label}</span>
              <p className="text-text-primary font-body font-medium">
                {getZodiacGlyph(item.sign)} {item.sign}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
          opacity: 0.2,
        }}
      />

      {/* Planet placements */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-text-muted font-body">
          Planet Placements
        </h3>
        {data.planets.map((planet) => {
          const color = getSignColor(planet.sign);
          return (
            <div
              key={planet.name}
              className="flex items-center justify-between py-1.5 group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-primary text-sm font-body">
                  {planet.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center">
                  <ZodiacIcon sign={planet.sign} size="sm" />
                </span>
                <span className="text-text-secondary text-sm">
                  {planet.sign}
                </span>
                <span className="text-text-muted text-xs ml-1">
                  H{planet.house}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
