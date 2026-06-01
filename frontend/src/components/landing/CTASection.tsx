import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useStreamingResponse";

export default function CTASection() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section
      ref={ref}
      className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Decorative circles */}
        <div className="relative mx-auto w-32 h-32 mb-10">
          <div
            className="absolute inset-0 rounded-full animate-spin-slow"
            style={{
              border: "1px solid var(--border-strong)",
            }}
          />
          <div
            className="absolute inset-3 rounded-full animate-spin-slow"
            style={{
              border: "1px solid var(--border)",
              animationDirection: "reverse",
              animationDuration: "30s",
            }}
          />
          <div
            className="absolute inset-6 rounded-full"
            style={{ border: "1px solid var(--border)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-accent">
            ✦
          </div>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text-primary mb-6">
          Ready to read your stars?
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Enter your birth details and let the cosmos speak. Your personalized
          chart awaits — along with an AI astrologer ready to answer any
          question.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/onboard" className="amber-button text-lg px-10">
            Begin Your Journey
          </Link>
          <Link to="/chat" className="ghost-button text-lg px-10">
            Ask the Stars
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 text-center">
        <div className="arc-divider mb-8" />
        <p className="text-text-muted text-sm font-body">
          AstroAgent — Bridging ancient wisdom and modern AI
        </p>
        <p className="text-text-muted/50 text-xs mt-2">
          ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓
        </p>
      </div>
    </section>
  );
}
