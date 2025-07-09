
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import PlacementStatsDisplay from '@/components/home/PlacementStatsDisplay';
import PlacementProcessSection from '@/components/home/PlacementProcessSection';
import OurTeamSection from '@/components/home/OurTeamSection';
import FaqAccordin from '@/components/shared/FaqAccordin';
import ContactSection from '@/components/home/ContactSection';
import DevelopmentTeamSection from '@/components/home/DevelopmentTeamSection';

export default function HomePage() {
  return (
    <div className="space-y-12 md:space-y-20">
      <HeroSection /> 
      <AboutSection /> 
      <PlacementStatsDisplay /> 
      <PlacementProcessSection /> 
      <OurTeamSection /> 
      
      <section id="faqs" className="py-12 md:py-20 bg-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about the placement process at MNIT Jaipur.
            </p>
          </div>
          <div className="max-w-5xl mx-auto"> 
            <FaqAccordin />
          </div>
        </div>
      </section>

      <ContactSection /> 
      <DevelopmentTeamSection /> 
    </div>
  );
}
