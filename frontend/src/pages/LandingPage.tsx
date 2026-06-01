import StarfieldBg from "@/components/shared/StarfieldBg";
import HeroSection from "@/components/landing/HeroSection";
import FeatureCards from "@/components/landing/FeatureCards";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <StarfieldBg />
      <div className="relative z-10">
        <HeroSection />
        <FeatureCards />
        <CTASection />
      </div>
    </div>
  );
}
