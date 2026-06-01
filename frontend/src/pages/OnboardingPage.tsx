import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useChartData } from "@/hooks/useChartData";
import { useUserStore } from "@/store/useUserStore";
import { ZODIAC_GLYPHS, ZODIAC_SIGNS } from "@/lib/constants";
import LoadingOrbs from "@/components/shared/LoadingOrbs";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { calculateChart, loading, error } = useChartData();
  const { birthDetails } = useUserStore();

  const [name, setName] = useState(birthDetails?.name || "");
  const [dob, setDob] = useState(birthDetails?.dob || "");
  const [tob, setTob] = useState(birthDetails?.tob || "");
  const [unknownTime, setUnknownTime] = useState(false);
  const [place, setPlace] = useState(birthDetails?.place || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!dob) errs.dob = "Date of birth is required";
    if (!place.trim()) errs.place = "Place of birth is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const chart = await calculateChart({
      name: name.trim(),
      dob,
      tob: unknownTime ? null : tob || null,
      place: place.trim(),
    });

    if (chart) {
      navigate("/chart");
    }
  };

  // Decorative preview — shows zodiac wheel that reacts to DOB
  const previewSign = useMemo(() => {
    if (!dob) return null;
    const month = parseInt(dob.split("-")[1], 10);
    const day = parseInt(dob.split("-")[2], 10);
    if (!month || !day) return null;

    // Simple sun sign from date
    const dates: [number, number, string][] = [
      [1, 20, "Capricorn"], [2, 19, "Aquarius"], [3, 20, "Pisces"],
      [4, 20, "Aries"], [5, 21, "Taurus"], [6, 21, "Gemini"],
      [7, 22, "Cancer"], [8, 23, "Leo"], [9, 23, "Virgo"],
      [10, 23, "Libra"], [11, 22, "Scorpio"], [12, 22, "Sagittarius"],
    ];
    let sign = "Capricorn";
    for (const [m, d, s] of dates) {
      if (month === m && day <= d) { sign = s; break; }
      if (month === m && day > d) {
        const idx = dates.findIndex(([dm]) => dm === m);
        sign = idx < dates.length - 1 ? dates[idx + 1][2] : "Capricorn";
        break;
      }
    }
    return sign;
  }, [dob]);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h1 className="font-display text-3xl sm:text-4xl text-text-primary mb-3">
                Your Birth Details
              </h1>
              <p className="text-text-secondary text-lg">
                To calculate your natal chart, we need the precise coordinates of
                your arrival on Earth.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-body font-medium text-text-secondary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field"
                  style={errors.name ? { borderColor: "var(--danger)" } : {}}
                />
                {errors.name && (
                  <p className="text-danger text-xs mt-1 font-body">{errors.name}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-body font-medium text-text-secondary mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input-field"
                  style={errors.dob ? { borderColor: "var(--danger)" } : {}}
                />
                {errors.dob && (
                  <p className="text-danger text-xs mt-1 font-body">{errors.dob}</p>
                )}
              </div>

              {/* Time of Birth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-body font-medium text-text-secondary">
                    Time of Birth
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-text-muted font-body">Unknown</span>
                    <div
                      className="relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer"
                      style={{
                        background: unknownTime ? "var(--accent)" : "var(--bg-card)",
                        border: "1px solid var(--border-strong)",
                      }}
                      onClick={() => setUnknownTime(!unknownTime)}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                        style={{
                          background: unknownTime ? "var(--bg-base)" : "var(--text-muted)",
                          left: unknownTime ? "calc(100% - 18px)" : "2px",
                        }}
                      />
                    </div>
                  </label>
                </div>
                <input
                  type="time"
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  disabled={unknownTime}
                  className="input-field disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {unknownTime && (
                  <p className="text-text-muted text-xs mt-1.5 font-body italic">
                    Without birth time, the rising sign and house placements will be
                    approximate.
                  </p>
                )}
              </div>

              {/* Place of Birth */}
              <div>
                <label className="block text-sm font-body font-medium text-text-secondary mb-2">
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. Mumbai, India"
                  className="input-field"
                  style={errors.place ? { borderColor: "var(--danger)" } : {}}
                />
                {errors.place && (
                  <p className="text-danger text-xs mt-1 font-body">{errors.place}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="amber-button w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <LoadingOrbs />
                    <span>Calculating Your Chart...</span>
                  </>
                ) : (
                  "Calculate My Chart"
                )}
              </button>

              {error && (
                <div
                  className="p-3 rounded-lg text-sm text-center"
                  style={{
                    background: "rgba(224, 92, 92, 0.1)",
                    border: "1px solid rgba(224, 92, 92, 0.3)",
                    color: "var(--danger)",
                  }}
                >
                  {error}
                </div>
              )}
            </form>
          </motion.div>

          {/* Right: Decorative preview */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Decorative chart preview */}
              <svg viewBox="0 0 400 400" className="w-full max-w-[420px]" aria-hidden="true">
                <defs>
                  <radialGradient id="previewGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(245,166,35,0.06)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                <circle cx="200" cy="200" r="190" fill="url(#previewGlow)" />

                {/* Rings */}
                {[180, 150, 120, 80].map((r) => (
                  <circle
                    key={r}
                    cx="200"
                    cy="200"
                    r={r}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="0.8"
                  />
                ))}

                {/* House lines */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={200 + 80 * Math.cos(a)}
                      y1={200 + 80 * Math.sin(a)}
                      x2={200 + 150 * Math.cos(a)}
                      y2={200 + 150 * Math.sin(a)}
                      stroke="var(--border)"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* Zodiac glyphs */}
                {ZODIAC_SIGNS.map((sign, i) => {
                  const a = ((i * 30 + 15) * Math.PI) / 180;
                  const x = 200 + 165 * Math.cos(a);
                  const y = 200 + 165 * Math.sin(a);
                  const isPreviewSign = sign === previewSign;
                  return (
                    <text
                      key={sign}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isPreviewSign ? "var(--accent)" : "var(--text-muted)"}
                      fontSize={isPreviewSign ? "20" : "14"}
                      fontFamily="serif"
                      opacity={isPreviewSign ? 1 : 0.4}
                    >
                      {ZODIAC_GLYPHS[sign]}
                    </text>
                  );
                })}

                {/* Name in center */}
                <text
                  x="200"
                  y="192"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontFamily="Cinzel, serif"
                  opacity={name ? 0.8 : 0.2}
                >
                  {name || "Your Name"}
                </text>

                {previewSign && (
                  <text
                    x="200"
                    y="212"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--accent)"
                    fontSize="12"
                    fontFamily="DM Sans, sans-serif"
                    opacity="0.7"
                  >
                    {ZODIAC_GLYPHS[previewSign as keyof typeof ZODIAC_GLYPHS]} {previewSign} Sun
                  </text>
                )}
              </svg>

              {/* Info text */}
              <div className="text-center mt-6">
                <p className="text-text-muted text-sm font-body">
                  {previewSign
                    ? `Sun in ${previewSign} — complete the form to reveal your full chart`
                    : "Enter your birth date to see your sign appear"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
