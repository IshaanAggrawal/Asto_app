import { useScrollReveal } from "@/hooks/useStreamingResponse";
import ZodiacIcon from "@/lib/zodiacIcons";
import type { ZodiacSign } from "@/lib/constants";

interface Feature {
  icon: string;
  title: string;
  description: string;
  glyphSign: ZodiacSign;
}

const features: Feature[] = [
  {
    icon: "☉",
    title: "Your Birth Chart",
    description:
      "A precise map of the heavens at the moment of your birth — your cosmic DNA decoded into an interactive, explorable chart.",
    glyphSign: "Leo",
  },
  {
    icon: "☽",
    title: "Daily Transits",
    description:
      "Real-time planetary positions overlaid on your natal chart, revealing today's cosmic weather and how it uniquely affects you.",
    glyphSign: "Pisces",
  },
  {
    icon: "✦",
    title: "Ask the Stars",
    description:
      "An AI astrologer powered by Vedic and Western astrological traditions. Ask anything — love, career, timing, compatibility.",
    glyphSign: "Scorpio",
  },
];

export default function FeatureCards() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Arc divider */}
      <div className="arc-divider mb-16" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl text-text-primary mb-4">
            What Awaits You
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Three pathways to cosmic understanding — each designed to illuminate
            a different facet of your celestial blueprint.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl p-8 border border-border card-glow transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                background: "var(--bg-card)",
                transitionDelay: `${i * 150}ms`,
              }}
            >
              {/* Corner glyph */}
              <span className="absolute top-4 right-4 opacity-10 group-hover:opacity-25 transition-opacity duration-500">
                <ZodiacIcon sign={feature.glyphSign} size={48} color="var(--accent)" />
              </span>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                <span style={{ color: "var(--accent)" }}>{feature.icon}</span>
              </div>

              <h3 className="font-display text-xl text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-8 right-8 h-px transition-all duration-500 group-hover:left-4 group-hover:right-4"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                  opacity: 0.3,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
