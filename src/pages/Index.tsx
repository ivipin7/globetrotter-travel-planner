import { Navbar } from "@/components/layout/Navbar";
import { PremiumHero } from "@/components/premium/PremiumHero";
import { PremiumFeatures } from "@/components/premium/PremiumFeatures";
import { DestinationsSection } from "@/components/home/DestinationsSection";
import { PremiumCTA } from "@/components/premium/PremiumCTA";
import { Footer } from "@/components/home/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <PremiumHero />
        <PremiumFeatures />
        <DestinationsSection />
        <PremiumCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;