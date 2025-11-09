import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ListingsPreviewSection } from "@/components/ListingsPreviewSection";
import { ChatbotTeaserSection } from "@/components/ChatbotTeaserSection";
import { WhyVisionScoutSection } from "@/components/WhyVisionScoutSection";
import { PartnersSection } from "@/components/PartnersSection";
import { TechSection } from "@/components/TechSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <ListingsPreviewSection />
      <ChatbotTeaserSection />
      <WhyVisionScoutSection />
      <PartnersSection />
      <TechSection />
      <Footer />
    </div>
  );
};

export default Index;
