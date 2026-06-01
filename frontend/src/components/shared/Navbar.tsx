import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { getZodiacGlyph } from "@/lib/zodiacUtils";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { chartData } = useUserStore();

  const links = [
    { to: "/", label: "Home" },
    { to: "/onboard", label: "Birth Details" },
    { to: "/chart", label: "My Chart" },
    { to: "/chat", label: "Ask the Stars" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-dim))",
                boxShadow: "0 0 20px rgba(245,166,35,0.3)",
              }}
            >
              ☉
            </div>
            <span className="font-display text-xl tracking-wide text-text-primary">
              AstroAgent
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? "text-accent bg-accent-glow"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {chartData && (
              <div className="ml-3 pl-3 border-l border-border flex items-center gap-2">
                <span className="zodiac-glyph text-lg">
                  {getZodiacGlyph(chartData.sun_sign)}
                </span>
                <span className="text-xs text-text-muted font-body">
                  {chartData.sun_sign}
                </span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-border px-4 pb-4 animate-fade-in">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block py-3 text-sm font-body font-medium transition-colors ${
                isActive(link.to) ? "text-accent" : "text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
