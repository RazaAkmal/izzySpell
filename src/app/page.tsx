import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AppInActionSection from "@/components/landing/AppInActionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CredibilitySection from "@/components/landing/CredibilitySection";
import ResultsSection from "@/components/landing/ResultsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import ReadyToStartSection from "@/components/landing/ReadyToStartSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AppInActionSection />
      <HowItWorksSection />
      <CredibilitySection />
      <ResultsSection />
      <TestimonialsSection />
      <PricingSection />
      <ReadyToStartSection />
      <Footer />
    </div>
  );
}
