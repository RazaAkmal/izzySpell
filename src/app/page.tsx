import Navbar from "@/components/landing/NavbarSection";
import HeroSection from "@/components/landing/Hero";
import HowItWorksSection from "@/components/landing/HowItWorks";
import SeeAppActions from "@/components/landing/SeeAppActions";
import CredibilitySections from "@/components/landing/CredibilitySections";
import RealProgress from "@/components/landing/RealProgress";
import { TestimonialsSection } from "@/components/landing/Testimonials";
import VocabularySection from "@/components/landing/VucabliraySection";
import Footer from "@/components/landing/FooterSection";
import WhyChooseSection from "@/components/landing/WhyChooseSection";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#EBF9FF] font-sans overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <WhyChooseSection />
      <SeeAppActions />
      <HowItWorksSection />
      <CredibilitySections />
      <RealProgress />
      <TestimonialsSection />
      <VocabularySection />
      <Footer />
    </div>
  );
}
