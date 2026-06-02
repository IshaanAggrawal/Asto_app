import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { MOCK_CHART_DATA } from "@/lib/constants";
import BirthChartWheel from "@/components/chart/BirthChartWheel";
import ChartSummaryCard from "@/components/chart/ChartSummaryCard";
import PlanetTable from "@/components/chart/PlanetTable";

const OVERVIEW_TEXT = `Your natal chart reveals a powerful combination of fiery leadership and deep emotional intelligence. With your Sun in Leo, you radiate warmth and creative energy — you're a natural leader who draws others into your orbit.

Your Pisces Moon adds extraordinary depth to your emotional landscape. You feel the world around you with remarkable sensitivity, and this makes you both deeply compassionate and creatively inspired.

The Scorpio Ascendant gives you a magnetic, intense presence that commands respect without demanding it. People sense your depth immediately. Together, these three form a fascinating interplay of fire, water, and water — bold vision tempered by profound intuition.`;

const PLANETS_TEXT = `**Sun in Leo (10th House)** — Your identity shines brightest in your public and professional life. You're destined for visibility and leadership in your career.

**Moon in Pisces (5th House)** — Your emotional nature is deeply creative and intuitive. You process feelings through art, romance, and self-expression.

**Mercury in Virgo (11th House)** — Your mind is analytical, precise, and service-oriented. You communicate ideas clearly within group settings and communities.

**Venus in Cancer (9th House)** — You find love through shared adventures and philosophical exploration, yet crave the comfort of emotional security.

**Mars in Aries (6th House)** — Your energy is bold and pioneering in daily work. You take initiative and prefer to lead rather than follow in routine tasks.

**Jupiter in Sagittarius (2nd House)** — Natural abundance flows to you through optimism, higher learning, and philosophical pursuits.

**Saturn in Capricorn (3rd House)** — Discipline and structure in communication. You take words seriously and build authority through careful expression.`;

const HOUSES_TEXT = `**1st House (Scorpio)** — Your outer persona is intense, magnetic, and deeply perceptive. You approach life as a transformative journey.

**2nd House (Sagittarius)** — Values centered on freedom, adventure, and philosophical growth. You attract resources through optimism.

**3rd House (Capricorn)** — Structured, disciplined approach to communication and learning. Every word carries weight.

**4th House (Aquarius)** — An unconventional home life and unique family dynamics. You need intellectual freedom in your private space.

**5th House (Pisces)** — Creative expression is deeply intuitive and emotionally rich. Romance has a dreamlike, soulful quality.

**10th House (Leo)** — Career and public reputation are central to your identity. You're meant to be seen and celebrated for your work.`;

export default function ChartPage() {
  const { chartData, birthDetails } = useUserStore();
  const [activeTab, setActiveTab] = useState<"overview" | "planets" | "houses">("overview");

  // Use stored chart data or mock data
  const data = chartData || MOCK_CHART_DATA;

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "planets" as const, label: "Planets" },
    { id: "houses" as const, label: "Houses" },
  ];

  const tabContent = {
    overview: OVERVIEW_TEXT,
    planets: PLANETS_TEXT,
    houses: HOUSES_TEXT,
  };

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: "var(--bg-base)" }}>
      {/* No chart data banner */}
      {!chartData && (
        <div
          className="mx-4 sm:mx-6 lg:mx-8 mb-6 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3"
          style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-accent text-lg">☉</span>
            <p className="text-text-primary text-sm font-body">
              Viewing demo chart data.{" "}
              <Link to="/onboard" className="text-accent hover:underline font-medium">
                Enter your birth details
              </Link>{" "}
              for a personalized reading.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            {birthDetails?.name ? `${birthDetails.name}'s Chart` : "Natal Chart"}
          </h1>
          <p className="text-text-secondary mt-2">
            Your cosmic blueprint — the positions of celestial bodies at the moment of your birth.
          </p>
        </motion.div>

        {/* Three-panel layout */}
        <div className="grid lg:grid-cols-[280px_1fr_360px] gap-6">
          {/* Left sidebar — Summary */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="rounded-2xl p-5 sticky top-24 glass-panel card-glow"
            >
              <ChartSummaryCard data={data} name={birthDetails?.name} />
            </div>
          </motion.div>

          {/* Center — Chart wheel */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-full max-w-[560px]">
              <BirthChartWheel data={data} size={560} />

              {/* Planet table below chart on mobile */}
              <div className="mt-6 lg:hidden">
                <div
                  className="rounded-2xl p-5 glass-panel card-glow"
                >
                  <PlanetTable data={data} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right panel — Interpretation */}
          <motion.div
            className="order-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="rounded-2xl overflow-hidden sticky top-24 glass-panel card-glow"
            >
              {/* Tabs */}
              <div className="flex border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-sm font-body font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "text-accent border-b-2 border-accent bg-accent-glow"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5 max-h-[600px] overflow-y-auto">
                <div className="text-sm text-text-secondary leading-relaxed font-body space-y-4">
                  {tabContent[activeTab].split("\n\n").map((para, i) => {
                    // Handle bold text markers
                    const parts = para.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={i}>
                        {parts.map((part, j) =>
                          j % 2 === 1 ? (
                            <span key={j} className="text-text-primary font-medium">
                              {part}
                            </span>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  })}
                </div>

                {/* CTA to chat */}
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    to="/chat"
                    className="amber-button w-full text-sm py-2.5 block text-center"
                  >
                    Ask About My Chart →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
