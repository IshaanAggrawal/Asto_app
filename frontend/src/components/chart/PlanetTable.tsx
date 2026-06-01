import type { ChartData } from "@/lib/constants";
import { ZODIAC_GLYPHS, PLANET_GLYPHS } from "@/lib/constants";
import { getSignColor } from "@/lib/zodiacUtils";

interface PlanetTableProps {
  data: ChartData;
}

export default function PlanetTable({ data }: PlanetTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-2 font-body font-medium">Planet</th>
            <th className="text-left py-3 px-2 font-body font-medium">Sign</th>
            <th className="text-center py-3 px-2 font-body font-medium">Degree</th>
            <th className="text-center py-3 px-2 font-body font-medium">House</th>
          </tr>
        </thead>
        <tbody>
          {data.planets.map((planet) => {
            const color = getSignColor(planet.sign);
            return (
              <tr
                key={planet.name}
                className="border-b border-border/50 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ color }}>
                      {PLANET_GLYPHS[planet.name] || "●"}
                    </span>
                    <span className="text-text-primary font-body">
                      {planet.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color }} className="text-base">
                      {ZODIAC_GLYPHS[planet.sign]}
                    </span>
                    <span className="text-text-secondary">{planet.sign}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="text-text-secondary font-mono text-xs">
                    {Math.round(planet.degree % 30)}°
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-body"
                    style={{
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {planet.house}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
